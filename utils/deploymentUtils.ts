import { networkConfigs, NetworkInfo } from "./networkConfigs";
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import {cliConfirmation} from './cliUtils'

export class DeploymentUtils {
    private hre: HardhatRuntimeEnvironment;
    private network: string;
    private networkConfig: NetworkInfo;
    private contractName: string;
    private _contractAddress: string = ''
    private constructorArgs: any[]
    constructor(hre: HardhatRuntimeEnvironment, contractName: string, constructorArgs: any[]) {
        this.hre = hre;
        this.network = hre.network.name;
        this.networkConfig = networkConfigs.get(this.network)!;
        this.contractName = contractName;
        this.constructorArgs = constructorArgs;
    }

    async deployContract() {
        const { getNamedAccounts, deployments } = this.hre;

        const { deploy } = deployments
        const { deployer } = await getNamedAccounts()

        console.log(`Deploying contract: ${this.contractName}, network: ${this.network} with args: ${this.constructorArgs}`)
        if (!await cliConfirmation('Do you want to continue?')) {
            throw new Error('User cancelled deployment')
        }

        const { address } = await deploy(this.contractName, {
            from: deployer,
            args: this.constructorArgs,
            log: true,
            skipIfAlreadyDeployed: false,
        })
        this._contractAddress = address; 
        console.log(`Deployed contract: ${this.contractName}, network: ${this.network}, address: ${address}`)
        return address;
    }

    async verifyContract() {
        console.log(`Verifying contract: ${this._contractAddress}`)
        if (!await cliConfirmation('Do you want to continue?')) {
            throw new Error('User cancelled verification')
        }
        await this.hre.run('verify:verify', {
            address: this._contractAddress,
            constructorArguments: this.constructorArgs,
        })
        console.log(`Contract verified: ${this._contractAddress}`)
    }

    async deployAndVerifyContract() {
        await this.deployContract()
        await this.verifyContract()
    }

    public get contractAddress(): string {
        return this._contractAddress
    }

    async getDeployedContract() {
        const signer = (await this.hre.ethers.getSigners())[0]
        return await this.hre.ethers.getContractAt(this.contractName, this._contractAddress, signer)
    }
}