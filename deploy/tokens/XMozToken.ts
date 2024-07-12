import {networkConfigs} from '../../utils/networkConfigs'
import {DeploymentUtils} from '../../utils/deploymentUtils'
import { contractNames } from '../../utils/contractNames'


import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Tokens.XMozToken

const deploy: DeployFunction = async (hre) => {

    const mozStakingDeployment = await hre.deployments.get(contractNames.Tokens.MozStaking)
    
    const constructorArgs = [mozStakingDeployment.address]
    
    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)
    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy