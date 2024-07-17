import {networkConfigs} from '../../utils/networkConfigs'
import {ContractUtils} from '../../utils/contractUtils'
import { contractNames } from '../../utils/names/contractNames'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Tokens.MozStaking

const deploy: DeployFunction = async (hre) => {

    let networkConfig = networkConfigs.get(hre.network.name)

    console.log(hre.network.name)
    console.log(networkConfig)
    const constructorArgs = [networkConfig?.tokensInfo?.treasuryAddress!]
    const deployer = new ContractUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy