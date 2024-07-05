import { networkConfigs, NetworkInfo } from "./networkConfigs";
import { HardhatRuntimeEnvironment } from 'hardhat/types'

export class DeploymentUtils {
    private hre: HardhatRuntimeEnvironment;
    private network: string;
    private networkConfig: NetworkInfo;
    private contractName: string;
    private contractAddress: string = ''
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

        const { address } = await deploy(this.contractName, {
            from: deployer,
            args: this.constructorArgs,
            log: true,
            skipIfAlreadyDeployed: false,
        })
        this.contractAddress = address; 
        console.log(`Deployed contract: ${this.contractName}, network: ${this.network}, address: ${address}`)
        return address;
    }

    async verifyContract() {
        console.log(`Verifying contract: ${this.contractAddress}`)
        await this.hre.run('verify:verify', {
            address: this.contractAddress,
            constructorArguments: this.constructorArgs,
        })
        console.log(`Contract verified: ${this.contractAddress}`)
    }
}