import { HardhatRuntimeEnvironment  } from 'hardhat/types';

import {networkConfigs, NetworkInfo} from './networkConfigs'
import {cliConfirmation} from './cliUtils'

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
    private tasks: Map<string, TaskCallback> = new Map();
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
    }

    async checkDependencies(): Promise<void> {
        try{
            this.mainContractDeploymentAddress = (await this.deploymentExtension.get(this.contractName)).address          
        } catch (error) {
            console.log(`Contract ${this.contractName} not found in deployments on ${this.networkName}`);
            throw error;
        }
        for (const [contractName, deploymentName] of this.dependencies) {
            try {
                const deployment = await this.deploymentExtension.get(contractName);
                this.dependencies.set(contractName, deployment.address);
            } catch (error) {
                console.log(`Contract ${contractName} not found in deployments on ${this.networkName}`);
                throw error;
            }  
        }
        console.log(`Contract ${this.contractName} found at ${this.mainContractDeploymentAddress} on ${this.networkName}`);
        console.log(`Dependencies on ${this.networkName}:`);
        this.dependencies.forEach((address, name) => {
            console.log(`- ${name} found at ${address}`);
        });
    }

    registerInitCallback(callback: TaskCallback): void {
        this.initCallback = callback;
    }

    registerFinalizeCallback(callback: TaskCallback): void {
        this.finalizeCallback = callback;
    }

    registerTask(taskName: string, callback: TaskCallback): void {
        if (this.tasks.has(taskName)) {
            throw new Error(`Task "${taskName}" already exists.`);
        }
        this.tasks.set(taskName, callback);
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
        console.log("Task execution completed.");
    }

    async run(): Promise<void> {
        await this.checkDependencies();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const taskNames = Array.from(this.tasks.keys());

        console.log("Available tasks:");
        taskNames.forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });

        const answer = await new Promise<string>(resolve => {
            rl.question("Enter task names, numbers (comma-separated), 'ALL', or 'none': ", resolve);
        });

        let tasksToRun: string[] = [];

        if (answer.toLowerCase() === 'all') {
            tasksToRun = taskNames;
        } else if (answer.toLowerCase() !== 'none' || answer !== '') {
            const inputs = answer.split(',').map(s => s.trim());
            for (const input of inputs) {
                if (/^\d+$/.test(input)) {
                    const index = parseInt(input) - 1;
                    if (index >= 0 && index < taskNames.length) {
                        tasksToRun.push(taskNames[index]);
                    } else {
                        console.log(`Invalid task number: ${input}`);
                        rl.close();
                        return;
                    }
                } else if (this.tasks.has(input)) {
                    tasksToRun.push(input);
                } else {
                    console.log(`Invalid task name: ${input}`);
                    rl.close();
                    return;
                }
            }
        }

        if (tasksToRun.length > 0) {
            console.log("\nTasks to run:");
            tasksToRun.forEach(task => console.log(`- ${task}`));

            if (!await cliConfirmation('Do you want to continue?', true)) {
                throw new Error('User cancelled function call')
            }
            await this.initialize();
                for (const taskName of tasksToRun) {
                    console.log(`\nExecuting task: ${taskName}`);
                    let valuesToLog = await this.tasks.get(taskName)!(this.hardhatRuntimeEnvironment, this.contractName, this.signer, this.mainContractDeploymentAddress, this.networkConfig, this.dependencies, this.deploymentData);
                    console.log(`Task ${taskName} executed with values: ${JSON.stringify(valuesToLog)}`);
                    console.log('\n-----------------------------------\n')
                }
                this.finalize();

        } else {
            console.log("No tasks selected.");
        }

        rl.close();
        console.log('\n===================================\n')
        console.log("Task execution completed.");
        console.log('\n===================================\n')
    }
}