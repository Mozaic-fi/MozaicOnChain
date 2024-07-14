import {networkConfigs} from '../../utils/networkConfigs'
import { networkNames } from '../../utils/networkNames'
import { pluginNames } from '../../utils/pluginNames'
import {DeploymentUtils} from '../../utils/deploymentUtils'
import { contractNames } from '../../utils/contractNames'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Vaults.TokenPriceConsumer

const deploy: DeployFunction = async (hre) => {

    let networkConfig = networkConfigs.get(hre.network.name)

    const tokensData = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name)?.tokens?.map(token => 
        ({
            address: token.address,
            priceFeedAddress: token.priceFeedAddress,
            heartBeatDuration: token.heartBeatDuration
        }))!
    
    const address = tokensData?.map(token => token.address)
    const priceFeeds = tokensData?.map(token => token.priceFeedAddress)
    const heartBeats = tokensData?.map(token => token.heartBeatDuration)

    const constructorArgs = [address, priceFeeds, heartBeats]
    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy