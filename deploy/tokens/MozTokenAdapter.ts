import {networkConfigs} from '../configs/networks'
import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const contractName = 'MozTokenAdapter'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    let networkConfig = networkConfigs.get(hre.network.name)
    
    if(networkConfig?.requireAdapter){
        const constructorArgs = [networkConfig.mozTokenContractAddress! , endpointV2Deployment.address]
        const { address } = await deploy(contractName, {
            from: deployer,
            args: constructorArgs,
            log: true,
            skipIfAlreadyDeployed: false,
        })
        await verify(address, constructorArgs, hre)
        console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
    }
    else {
        throw new Error(`Only proxy deployment possible for ${hre.network.name}`)
    }
}

deploy.tags = [contractName]

export default deploy

async function verify(contractAddress: string, args: any[], hre: HardhatRuntimeEnvironment) {
    console.log(`Verifying contract: ${contractAddress}`)
    await hre.run('verify:verify', {
        address: contractAddress,
        constructorArguments: args,
    })
    console.log(`Contract verified: ${contractAddress}`)
}