import {networkConfigs} from '../../utils/networkConfigs'
import {DeploymentUtils} from '../../utils/deploymentUtils'
import { contractNames } from '../../utils/names/contractNames'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Tokens.MozStaking

const deploy: DeployFunction = async (hre) => {

    let networkConfig = networkConfigs.get(hre.network.name)

    const constructorArgs = [networkConfig?.tokensInfo?.treasuryAddress!]
    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy