import {networkConfigs} from '../../utils/networkConfigs'
import {DeploymentUtils} from '../../utils/deploymentUtils'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'MozStaking'

const deploy: DeployFunction = async (hre) => {

    let networkConfig = networkConfigs.get(hre.network.name)

    const constructorArgs = [networkConfig?.treasuryAddress!]
    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy