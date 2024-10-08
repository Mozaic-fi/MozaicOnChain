import { networkConfigs, NetworkInfo } from "./networkConfigs";
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { BigNumber } from 'ethers'

import {cliBlue, cliConfirmation, cliCyan, cliGreen, cliRed, cliYellow} from './cliUtils'

export class ContractUtils {
    private hre: HardhatRuntimeEnvironment;
    private network: string;
    private networkConfig: NetworkInfo;
    private contractName: string;
    private _contractAddress: string;
    private constructorArgs: any[];
    private getCLIConfirmation: boolean;
    constructor(hre: HardhatRuntimeEnvironment, contractName: string, constructorArgs: any[], getCLIConfirmation: boolean = true, contractAddress: string = '') {
        this.hre = hre;
        this.network = hre.network.name;
        this.networkConfig = networkConfigs.get(this.network)!;
        this.contractName = contractName;
        this.constructorArgs = constructorArgs;
        this.getCLIConfirmation = getCLIConfirmation;
        this._contractAddress = contractAddress;
    }

    static async createFromDeployment(hre: HardhatRuntimeEnvironment, contractName: string, getCLIConfirmation: boolean = false) {
        let deployment = await hre.deployments.get(contractName)
        return new ContractUtils(hre, contractName, [], getCLIConfirmation, deployment.address)
    }

    async deployContract() {
        if(this._contractAddress !== '') {
            console.log(`Contract already deployed: ${cliGreen(this.contractName, true)}, network: ${cliBlue(this.network, true)}, address: ${this._contractAddress}`)
            return this._contractAddress;
        }
        const { getNamedAccounts, deployments } = this.hre;

        const { deploy } = deployments
        const { deployer } = await getNamedAccounts()

        console.log(`Deploying contract: ${cliGreen(this.contractName)}, network: ${cliBlue(this.network)} with args: ${this.constructorArgs}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            console.error('User cancelled deployment')
            process.exit(1)
        }

        const { address } = await deploy(this.contractName, {
            from: deployer,
            args: this.constructorArgs,
            log: true,
            skipIfAlreadyDeployed: false,
        })
        this._contractAddress = address; 
        console.log(`Deployed contract: ${cliGreen(this.contractName)}, network: ${cliBlue(this.network)}, address: ${cliCyan(address)}`)
        return address;
    }

    async verifyContract() {
        if(this._contractAddress === '') {
            console.error('Contract not deployed yet')
            process.exit(1)
        }
        console.log(`Verifying contract: ${cliCyan(this._contractAddress)}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            console.error('User cancelled verification')
            process.exit(1)
        }
        await this.hre.run('verify:verify', {
            address: this._contractAddress,
            constructorArguments: this.constructorArgs,
        })
        console.log(cliGreen(`Contract verified: ${this._contractAddress}`))
    }

    async deployAndVerifyContract() {
        if(this._contractAddress !== '') {
            console.log(`Contract already deployed: ${cliGreen(this.contractName, true)}, network: ${cliBlue(this.network, true)}, address: ${this._contractAddress}`)
            return this._contractAddress;
        }
        await this.deployContract()
        if(this.networkConfig.autoVerify) await this.verifyContract()
    }

    public get contractAddress(): string {
        return this._contractAddress
    }

    async resetContractAddress(contractAddress: string) {
        this._contractAddress = contractAddress
    }
    
    async getDeployedContract() {
        if(this._contractAddress === '') {
            console.error('Contract not deployed yet')
            process.exit(1)
        }
        const signer = (await this.hre.ethers.getSigners())[0]
        return await this.hre.ethers.getContractAt(this.contractName, this._contractAddress, signer)
    }

    async getContractABI(){
        const contractArtifact = await this.hre.deployments.getArtifact(this.contractName)
        return contractArtifact.abi
    }

    async setContractConfigValues(functionName: string, prevValuesFunctionNames: string[], args: any[]) {
        console.log(`Setting contract values for function: ${cliYellow(functionName)} on ${cliGreen(this.contractName)} at ${cliBlue(this.network)}`)
        const contract = await this.getDeployedContract()
        if (typeof contract[functionName] !== "function") {
            console.error(`Function ${cliYellow(functionName)} does not exist on the ${cliGreen(this.contractName)} contract.`);
            process.exit(1);
        }

        if(prevValuesFunctionNames.length !== 0) {
            if(prevValuesFunctionNames.length!=args.length){
                console.error(`Wrong number of arguments for the function`);
                process.exit(1);
            }
            for (const prevValueFunctionName of prevValuesFunctionNames) {
                if (typeof contract[prevValueFunctionName] !== "function") {
                    console.error(`Function ${prevValueFunctionName} does not exist on the ${this.contractName} contract.`);
                    process.exit(1);
                }
            }
            let prevValues = new Map<string, any[]>();
            for (let i = 0; i < prevValuesFunctionNames.length; i++) {
                prevValues.set(prevValuesFunctionNames[i], [await contract[prevValuesFunctionNames[i]](), args[i]]);
            }

            let updateRequired = false;
            for (const [key, value] of prevValues) {
                if (value[0] != value[1]) {
                    updateRequired = true;
                    break;
                }
            }
            if (!updateRequired) {
                console.log(cliYellow(`No changes detected in the values of the contract variables`));
                for (const [key, value] of prevValues) {
                    console.log(cliBlue(`${key}: ${value[0]}`));
                }
                return;
            }
            for (const [key, value] of prevValues) {
                console.log(cliGreen(`Updating ${key}: from ${value[0]} to ${value[1]}`));
            }
        }
        console.log(`Calling function: ${functionName} with args: ${args}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            console.error('User cancelled function call')
            process.exit(1);
        }
        const result = await contract[functionName](...args)
        console.log(`Function: ${functionName} result: ${JSON.stringify(result, null, 2)}`)
        return result
    }


    async setContractConfigValuesStruct(functionName: string, prevValuesFunctionName: string, propertyNames: string[], args: any[]) {
        console.log(`Setting contract values for function: ${cliYellow(functionName)} on ${cliGreen(this.contractName)} at ${cliBlue(this.network)}`)
        const contract = await this.getDeployedContract()
        if (typeof contract[functionName] !== "function") {
            console.error(`Function ${functionName} does not exist on the ${this.contractName} contract.`);
            process.exit(1);
        }

        if(prevValuesFunctionName) {
            if(propertyNames.length!=args.length){
                console.error(`Wrong number of arguments for the function`);
                process.exit(1);
            }

            if (typeof contract[prevValuesFunctionName] !== "function") {
                console.error(`Function ${prevValuesFunctionName} does not exist on the ${this.contractName} contract.`);
                process.exit(1);
            }
            
            let prevValues = new Map<string, any[]>();
            const prevValueStruct = await contract[prevValuesFunctionName]();
            for (let i = 0; i < propertyNames.length; i++) {
                prevValues.set(propertyNames[i], [prevValueStruct[propertyNames[i]], args[i]]);
            }

            let updateRequired = false;
            for (const [key, value] of prevValues) {
                if (value[0] instanceof BigNumber && value[1] instanceof BigNumber) {
                    if(!value[0].eq(value[1])) {
                        updateRequired = true;
                        break;
                    }
                }
                else if (value[0] != value[1]) {
                    updateRequired = true;
                    break;
                }
            }
            if (!updateRequired) {
                console.log(cliYellow(`No changes detected in the values of the contract variables`));
                for (const [key, value] of prevValues) {
                    console.log(cliGreen(`${key}: ${value[0]}`));
                }
                return;
            }
            for (const [key, value] of prevValues) {
                console.log(cliBlue(`Updating ${key}: from ${value[0]} to ${value[1]}`, false));
            }
        }
        console.log(`Calling function: ${cliYellow(functionName)} with args: ${args}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            console.error('User cancelled function call')
            process.exit(1);
        }
        const result = await contract[functionName](...args)
        console.log(`Function: ${functionName} result: ${JSON.stringify(result, null, 2)}`)
        return result
    }


    async setContractConfigValuesArray(functionName: string, arrayName: string, propertyNames: string[], args: any[]) {
        console.log(`Setting contract values for function: ${cliYellow(functionName)} on ${cliGreen(this.contractName)} at ${cliBlue(this.network)}`)
        const contract = await this.getDeployedContract()
        if (typeof contract[functionName] !== "function") {
            console.error(`Function ${functionName} does not exist on the ${this.contractName} contract.`);
            process.exit(1);
        }

        if(arrayName) {
            if(propertyNames.length!=args.length) {
                console.error(`Wrong number of arguments for the function`);
                process.exit(1);
            }

            if (typeof contract[arrayName] !== "function") {
                console.error(`Function ${arrayName} does not exist on the ${this.contractName} contract.`);
                process.exit(1);
            }
            const arrayValues = await this.getArrayValues(arrayName)
            if(arrayValues.length !== 0) {

                let prevValues = new Map<string, any[]>();
                for (let i = 0; i < arrayValues.length; i++) {
                    let prevValueInArray = arrayValues[i]
                    if(prevValueInArray[propertyNames[0]] === args[0]) {
                        for (let j = 0; j < propertyNames.length; j++) {
                            prevValues.set(propertyNames[j], [prevValueInArray[propertyNames[j]], args[j]]);  
                        }                     
                    }
                }

                let updateRequired = false;
                for (const [key, value] of prevValues) {
                    if (value[0] != value[1]) {
                        updateRequired = true;
                        break;
                    }
                }
                if(prevValues.size === 0)  updateRequired = true;
                if (!updateRequired) {
                    console.log(cliYellow(`No changes detected in the values of the contract variables`));
                    for (const [key, value] of prevValues) {
                        console.log(cliGreen(`${key}: ${value[0]}`));
                    }
                    return;
                }
                for (const [key, value] of prevValues) {
                    console.log(cliBlue(`Updating ${key}: from ${value[0]} to ${value[1]}`, false));
                }
            }
        
        }
        console.log(`Calling function: ${cliYellow(functionName)} with args: ${args}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            console.error('User cancelled function call')
            process.exit(1);
        }
        const result = await contract[functionName](...args)
        console.log(`Function: ${cliYellow(functionName)} result: ${JSON.stringify(result, null, 2)}`)
        return result
    }

    async runContractFunction(functionName: string, ...args: any[]) {
        console.log(`Running function: ${cliYellow(functionName)} on ${cliGreen(this.contractName)} at ${cliBlue(this.network)}`)
        const contract = await this.getDeployedContract()
        if (typeof contract[functionName] !== "function") {
            console.error(`Function ${functionName} does not exist on the ${this.contractName} contract.`);
            process.exit(1);
        }
        console.log(`Calling function: ${cliYellow(functionName)} with args: ${args}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            console.error('User cancelled function call')
            process.exit(1);
        }
        const result = await contract[functionName](...args)
        console.log(cliBlue(`Function: ${functionName} result: ${JSON.stringify(result, null, 2)}`, false))
        return result
    }

    async callContractFunction(functionName: string, ...args: any[]) {
        const contract = await this.getDeployedContract()
        if (typeof contract[functionName] !== "function") {
            return undefined
        }
        const result = await contract[functionName](...args)
        return result
    }

    async getArrayValues(arrayName: string) {
        const contract = await this.getDeployedContract()
        if (typeof contract[arrayName] !== "function") {
            console.error(`Function ${arrayName} does not exist on the ${this.contractName} contract.`);
            process.exit(1);
        }
        let values = []
        let i = 0;
        while (true) {
            try {
                const value = await contract[arrayName](i);
                values.push(value);
                i++;
            } catch (error) {
                break;
            }
        }
        return values;
    }

    async getVariableValues(variableName: string) {
        const contract = await this.getDeployedContract()
        if (typeof contract[variableName] !== "function") {
            console.error(`Function ${variableName} does not exist on the ${this.contractName} contract.`);
            process.exit(1);
        }
        return await contract[variableName]();
    }

    async getMappingValues(mappingName: string, key: any) {
        const contract = await this.getDeployedContract()
        if (typeof contract[mappingName] !== "function") {
            console.error(`Function ${mappingName} does not exist on the ${this.contractName} contract.`);
            process.exit(1);
        }
        return await contract[mappingName](key);
    }
}