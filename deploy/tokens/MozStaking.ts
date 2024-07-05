import {networkConfigs} from '../configs/networks'
import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const contractName = 'MozStaking'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    let networkConfig = networkConfigs.get(hre.network.name)

    const constructorArgs = [networkConfig?.treasuryAddress!]
    const { address } = await deploy(contractName, {
        from: deployer,
        args: constructorArgs,
        log: true,
        skipIfAlreadyDeployed: false,
    })
    await verify(address, constructorArgs, hre)
    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
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