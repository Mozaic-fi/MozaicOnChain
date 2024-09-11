import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import {cliConfirmation, cliCyan, cliSelectItem} from '../../utils/cliUtils'
import { pluginNames } from '../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../utils/contractUtils'
import { TaskManagerUtils } from '../../utils/taskManagerUtils'
import { getTokens } from '../../utils/vaultTokens'

import hre from 'hardhat';

export const main = async () => {
    const contractName = contractNames.Vaults.TokenPriceConsumer;
    
    
    const taskManager = new TaskManagerUtils(hre, contractName, [])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.contractUtil = new ContractUtils(hre, contractName, [], false, contractAddress)
    
    })
    
    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    });

    taskManager.registerTask('addPriceFeed', false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'addPriceFeed'
        const tokenIndex = await cliSelectItem('Select a token to add', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['mapping:tokenPriceFeeds']
        const propertyValues = [tokens[tokenIndex].address, tokens[tokenIndex].priceFeedAddress, tokens[tokenIndex].heartBeatDuration]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, ...propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })
    
    taskManager.registerTask('setTokenDecimals',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName).filter(token => token.synthetic)
        const tokenAddresses= tokens.map(token => token.address)
        const tokenDecimals = tokens.map(token => token.decimals)
        const functionName = 'setTokenDecimalsBatch'
        const propertyStructName = 'mapping'
        const propertyValues = [tokenAddresses, tokenDecimals]
        const propertyNames = ['decimals']
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, tokenAddresses, tokenDecimals)
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    });

    await taskManager.runInteractive()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });