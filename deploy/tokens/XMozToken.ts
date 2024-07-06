import {networkConfigs} from '../../utils/networkConfigs'
import {DeploymentUtils} from '../../utils/deploymentUtils'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'XMozToken'

const deploy: DeployFunction = async (hre) => {

    const mozStakingDeployment = await hre.deployments.get('MozStaking')
    
    const constructorArgs = [mozStakingDeployment.address]
    
    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)
    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy