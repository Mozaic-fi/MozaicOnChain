import {networkConfigs} from '../../utils/networkConfigs'
import {DeploymentUtils} from '../../utils/deploymentUtils'
import { contractNames } from '../../utils/names/contractNames'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Tokens.MozToken

const deploy: DeployFunction = async (hre) => {

    const endpointV2Deployment = await hre.deployments.get(contractNames.Libraries.LayerZero.EndpointV2)  
    const mozStakingDeployment = await hre.deployments.get(contractNames.Tokens.MozStaking)

    const constructorArgs = [endpointV2Deployment.address , mozStakingDeployment.address]
    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)
    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy