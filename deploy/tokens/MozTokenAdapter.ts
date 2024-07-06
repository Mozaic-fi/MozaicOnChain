import {networkConfigs} from '../../utils/networkConfigs'
import {DeploymentUtils} from '../../utils/deploymentUtils'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'MozTokenAdapter'

const deploy: DeployFunction = async (hre) => {

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    let networkConfig = networkConfigs.get(hre.network.name)!

    const constructorArgs = [networkConfig.mozTokenContractAddress! , endpointV2Deployment.address]

    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)
    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy
