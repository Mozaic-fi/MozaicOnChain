import { HardhatRuntimeEnvironment  } from 'hardhat/types';

import {networkConfigs, NetworkInfo} from './networkConfigs'
import {cliBlue, cliConfirmation, cliCyan, cliGreen, cliMagenta, cliRed, cliSelectItem, cliYellow} from './cliUtils'

import * as readline from 'readline';

type taskOutputLog = {
    functionName: string,
    propertyStructName: string,
    propertyNames: any[],
    propertyValues: any[]
}
type TaskCallback = (hre: HardhatRuntimeEnvironment, contractName: string, signer: string, contractAddress: string, networkConfig: NetworkInfo, dependencies: Map<string,string>, data: any) => Promise<taskOutputLog | void>;

export class TaskManagerUtils {
    private initCallback: TaskCallback | null = null;
    private finalizeCallback: TaskCallback | null = null;
    private tasks: Map<string, [TaskCallback, boolean]> = new Map();
    private hardhatRuntimeEnvironment: HardhatRuntimeEnvironment;
    private contractName: string;
    private deploymentExtension: any;
    private signer: string;
    private mainContractDeploymentAddress: string;
    private networkConfig: NetworkInfo;
    private dependencies: Map<string,string>;
    private deploymentData: any;
    private networkName: string
    constructor(hre: HardhatRuntimeEnvironment, contractName: string, dependencies: string[]) {
        this.hardhatRuntimeEnvironment = hre;
        this.contractName = contractName;
        const { deployments } = this.hardhatRuntimeEnvironment;
        this.deploymentExtension = deployments;
        this.signer = '';
        this.mainContractDeploymentAddress = '';
        this.networkConfig = networkConfigs.get(hre.network.name)!;
        this.dependencies = dependencies.map(dep => [dep, '']).reduce((acc, [key, value]) => acc.set(key, value), new Map<string, string>());
        this.deploymentData = {};
        this.networkName= hre.network.name
        console.log(cliYellow(`Task Manager initialized for contract ${contractName} on ${this.networkName}`,true));
    }

    async checkDependencies(): Promise<void> {
        try{
            this.mainContractDeploymentAddress = (await this.deploymentExtension.get(this.contractName)).address          
        } catch (error) {
            console.log(`Contract ${cliGreen(this.contractName, true)} not found in deployments on ${cliCyan(this.networkName, true)}`);
            throw error;
        }
        for (const [contractName, deploymentName] of this.dependencies) {
            try {
                const deployment = await this.deploymentExtension.get(contractName);
                this.dependencies.set(contractName, deployment.address);
            } catch (error) {
                console.log(`Contract ${cliGreen(contractName, true)} not found in deployments on ${cliCyan(this.networkName, true)}`);
                throw error;
            }  
        }
        console.log(`Contract ${cliGreen(this.contractName, true)} found at ${cliCyan(this.mainContractDeploymentAddress, true)} on ${cliMagenta(this.networkName, true)}`);
        console.log(`Dependencies on ${cliMagenta(this.networkName, true)}:`);
        this.dependencies.forEach((address, name) => {
            console.log(`- ${cliGreen(name, true)} found at ${cliCyan(address, true)}`);
        });
    }

    registerInitCallback(callback: TaskCallback): void {
        this.initCallback = callback;
    }

    registerFinalizeCallback(callback: TaskCallback): void {
        this.finalizeCallback = callback;
    }

    registerTask(taskName: string,defaultTask: boolean, callback: TaskCallback): void {
        if (this.tasks.has(taskName)) {
            throw new Error(`Task "${taskName}" already exists.`);
        }
        this.tasks.set(taskName, [callback, defaultTask]);
    }

    async initialize(): Promise<void> {
        this.signer = (await this.hardhatRuntimeEnvironment.ethers.getSigners())[0].address;  
        if (this.initCallback) {
            await this.initCallback(this.hardhatRuntimeEnvironment, this.contractName, this.signer, this.mainContractDeploymentAddress, this.networkConfig, this.dependencies, this.deploymentData);
        }
    }

    async finalize(): Promise<void> {
        if (this.finalizeCallback) {
            await this.finalizeCallback(this.hardhatRuntimeEnvironment, this.contractName,this.signer, this.mainContractDeploymentAddress, this.networkConfig, this.dependencies, this.deploymentData);
        }
        console.log(cliCyan('\n===================================\n',true))
        console.log(cliCyan("Task execution completed.",true));
        console.log(cliCyan('\n===================================\n',true))
    }

    async run(): Promise<void> {
        await this.checkDependencies();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const taskNames = Array.from(this.tasks.keys());

        console.log(cliGreen("Available tasks:", true));
        taskNames.forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });

        const answer = await new Promise<string>(resolve => {
            rl.question("Enter task names, numbers (comma-separated), 'ALL', or 'none': ", resolve);
        });

        let tasksToRun: string[] = [];

        if (answer.toLowerCase() === 'all') {
            tasksToRun = taskNames;
        } else if (answer.toLowerCase() !== 'none' && answer !== '') {
            const inputs = answer.split(',').map(s => s.trim());
            for (const input of inputs) {
                if (/^\d+$/.test(input)) {
                    const index = parseInt(input) - 1;
                    if (index >= 0 && index < taskNames.length) {
                        tasksToRun.push(taskNames[index]);
                    } else {
                        console.log(cliRed(`Invalid task number: ${input}`));
                        rl.close();
                        return;
                    }
                } else if (this.tasks.has(input)) {
                    tasksToRun.push(input);
                } else {
                    console.log(cliRed(`Invalid task name: ${input}`));
                    rl.close();
                    return;
                }
            }
        }
        rl.close();

        if (tasksToRun.length > 0) {
            console.log(cliBlue("\nTasks to run:",true));
            tasksToRun.forEach(task => console.log(`- ${task}`));

            if (!await cliConfirmation('Do you want to continue?', true)) {
                console.error('User cancelled function call')
                process.exit(1);
            }
            await this.initialize();
                for (const taskName of tasksToRun) {
                    console.log(cliBlue(`\nExecuting task: ${taskName}`));
                    let [callback, _] = this.tasks.get(taskName)!
                    let valuesToLog = await callback(this.hardhatRuntimeEnvironment, this.contractName, this.signer, this.mainContractDeploymentAddress, this.networkConfig, this.dependencies, this.deploymentData);
                    //console.log(`Task ${taskName} executed with values: ${JSON.stringify(valuesToLog)}`);
                    console.log(cliBlue('\n-----------------------------------\n'))
                }
            await this.finalize();

        } else {
            console.log("No tasks selected.");
        }
    }
    
    async runInteractive(): Promise<void> {
        await this.checkDependencies();
        await this.initialize();
        if(await cliConfirmation('Do you want to run default tasks?', true)){
            const defaultTasks = Array.from(this.tasks.entries()).filter(([, [, isDefault]]) => isDefault);
            console.log(cliGreen("Running default tasks:", true));
            for(let defaultTask of defaultTasks){
                console.log(`Running ${cliCyan(defaultTask[0])}...`);
                let valuesToLog = await defaultTask[1][0](this.hardhatRuntimeEnvironment, this.contractName, this.signer, this.mainContractDeploymentAddress, this.networkConfig, this.dependencies, this.deploymentData);
                console.log(cliBlue('\n-----------------------------------\n'))
            }
            console.log('\n\n')
        }
        const taskNames = Array.from(this.tasks.entries()).map(([name, [_, isDefault]]) => `${name} ${isDefault ? '(default)' : ''}`);

        while (true) {
            const index = await cliSelectItem('Select a task to run (or type "0" to finish)', taskNames, true);
    
            if(index === -1){
                break;
            }
            else{
                let taskName  =taskNames[index].replace('(default)','').trim();
                let [callback, _] = this.tasks.get(taskName)!
                let valuesToLog = await callback(this.hardhatRuntimeEnvironment, this.contractName, this.signer, this.mainContractDeploymentAddress, this.networkConfig, this.dependencies, this.deploymentData);
                console.log(cliBlue('\n-----------------------------------\n'))
            }           
        }
        await this.finalize();
    }
    
    
}