import { networkConfigs, NetworkInfo } from "./networkConfigs";
import { HardhatRuntimeEnvironment } from 'hardhat/types'

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

    async deployContract() {
        if(this._contractAddress !== '') {
            console.log(cliRed(`Contract already deployed: ${this.contractName}, network: ${this.network}, address: ${this._contractAddress}`))
            return this._contractAddress;
        }
        const { getNamedAccounts, deployments } = this.hre;

        const { deploy } = deployments
        const { deployer } = await getNamedAccounts()

        console.log(`Deploying contract: ${cliGreen(this.contractName)}, network: ${cliBlue(this.network)} with args: ${this.constructorArgs}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            throw new Error('User cancelled deployment')
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
            throw new Error('User cancelled verification')
        }
        await this.hre.run('verify:verify', {
            address: this._contractAddress,
            constructorArguments: this.constructorArgs,
        })
        console.log(cliGreen(`Contract verified: ${this._contractAddress}`))
    }

    async deployAndVerifyContract() {
        if(this._contractAddress !== '') {
            console.log(cliRed(`Contract already deployed: ${this.contractName}, network: ${this.network}, address: ${this._contractAddress}`))
            return this._contractAddress;
        }
        await this.deployContract()
        await this.verifyContract()
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
            throw new Error('User cancelled function call')
        }
        const result = await contract[functionName](...args)
        console.log(`Function: ${functionName} result: ${result}`)
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
                if (value[0] != value[1]) {
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
                console.log(cliBlue(`Updating ${key}: from ${value[0]} to ${value[1]}`));
            }
        }
        console.log(`Calling function: ${cliYellow(functionName)} with args: ${args}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            throw new Error('User cancelled function call')
        }
        const result = await contract[functionName](...args)
        console.log(`Function: ${functionName} result: ${result}`)
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
            const arrayLength = await contract[arrayName].length;
            if(arrayLength !== 0) {

                let prevValues = new Map<string, any[]>();
                for (let i = 0; i < arrayLength; i++) {
                    let prevValueInArray = await contract[arrayName](i);
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
                if (!updateRequired) {
                    console.log(cliYellow(`No changes detected in the values of the contract variables`));
                    for (const [key, value] of prevValues) {
                        console.log(cliGreen(`${key}: ${value[0]}`));
                    }
                    return;
                }
                for (const [key, value] of prevValues) {
                    console.log(cliBlue(`Updating ${key}: from ${value[0]} to ${value[1]}`));
                }
            }
        
        }
        console.log(`Calling function: ${cliYellow(functionName)} with args: ${args}`)
        if (!await cliConfirmation('Do you want to continue?', this.getCLIConfirmation)) {
            throw new Error('User cancelled function call')
        }
        const result = await contract[functionName](...args)
        console.log(`Function: ${cliYellow(functionName)} result: ${result}`)
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
            throw new Error('User cancelled function call')
        }
        const result = await contract[functionName](...args)
        console.log(cliBlue(`Function: ${functionName} result: ${result}`))
        return result
    }

    async getArrayValues(arrayName: string) {
        const contract = await this.getDeployedContract()
        if (typeof contract[arrayName] !== "function") {
            console.error(`Function ${arrayName} does not exist on the ${this.contractName} contract.`);
            process.exit(1);
        }
        const arrayLength = await contract[arrayName].length;
        let values = []
        for (let i = 0; i < arrayLength; i++) {
            values.push(await contract[arrayName](i));
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