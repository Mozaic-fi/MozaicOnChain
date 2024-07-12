import {networkConfigs} from '../../utils/networkConfigs'
import {DeploymentUtils} from '../../utils/deploymentUtils'
import { contractNames } from '../../utils/contractNames'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Tokens.MozTokenAdapter

const deploy: DeployFunction = async (hre) => {

    const endpointV2Deployment = await hre.deployments.get(contractNames.Libraries.LayerZero.EndpointV2)

    let networkConfig = networkConfigs.get(hre.network.name)!

    const constructorArgs = [networkConfig.tokensInfo?.mozTokenContractAddress! , endpointV2Deployment.address]

    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)
    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy
