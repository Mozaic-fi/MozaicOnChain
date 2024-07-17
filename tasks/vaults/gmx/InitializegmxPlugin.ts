import { ethers  } from 'hardhat'
import {networkConfigs} from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import {cliSelectItem} from '../../../utils/cliUtils'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../../utils/contractUtils'
import { TaskManagerUtils } from '../../../utils/taskManagerUtils'

import hre from 'hardhat';

export const main = async () => {
    const contractName = contractNames.Vaults.Theseus.GmxPlugin
    
    const taskManager = new TaskManagerUtils(hre, contractName, [contractNames.Vaults.TokenPriceConsumer, contractNames.Vaults.Theseus.GmxCallback])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.vaultInfo = networkConfig?.theseusVaultInfo!
        //Note: this is fine since this script is only for gmx plugin
        data.vpi = data.vaultInfo.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
        data.contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
    })

    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Finalizing ${contractName} on ${hre.network.name}`)
    });

    taskManager.registerTask('setTreasury', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['treasury']
        const propertyValues = [data.vaultInfo.treasuryAddress]
        const functionName = 'setTreasury'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });
   
    taskManager.registerTask('setRouterConfig', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['exchangeRouter', 'router', 'depositVault', 'withdrawVault', 'orderVault', 'reader']
        const propertyValues = [data.vpi.vaultInfo.exchangeRouterAddress, data.vpi.vaultInfo.routerAddress, data.vpi.vaultInfo.depositVaultAddress, data.vpi.vaultInfo.withdrawVaultAddress, data.vpi.vaultInfo.orderVaultAddress, data.vpi.vaultInfo.readerAddress]
        const functionName = 'setRouterConfig'
        const propertyStructName = 'routerConfig'
        await (data.contractUtil as ContractUtils).setContractConfigValuesStruct(functionName, propertyStructName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setGmxParams', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo
        const propertyNames= ['uiFeeReceiver', 'callbackContract', 'callbackGasLimit', 'executionFee', 'shouldUnwrapNativeToken', 'pnlFactorType']
        const propertyValues = [vpi.params.uiFeeReceiverAddress, dependencies.get(contractNames.Vaults.Theseus.GmxCallback), vpi.params.callbackGasLimit, vpi.params.executionFee, vpi.params.shouldUnwrapNativeToken, vpi.params.pnlFactorType]
        const functionName = 'setGmxParams'
        const propertyStructName = 'gmxParams'
        await (data.contractUtil as ContractUtils).setContractConfigValuesStruct(functionName, propertyStructName, propertyNames, propertyValues) 
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }

    });

    taskManager.registerTask('setTokenDecimals', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo
        const tokenAddresses= vpi.tokens.map(token => token.address)
        const tokenDecimals = vpi.tokens.map(token => token.decimals)
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

    taskManager.registerTask('setTokenPriceConsumer', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['tokenPriceConsumer']
        const propertyValues = [dependencies.get(contractNames.Vaults.TokenPriceConsumer)]
        const functionName = 'setTokenPriceConsumer'
        const propertyStructName = ''
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues) 
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    })

    // taskManager.registerTask('setRewardTokens', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    //     const vpi = data.vpi as gmxPluginInfo
    //     const rewardTokens= vpi.tokens.map(token => token.address)
    //     const functionName = 'setRewardTokens'
    //     const propertyStructName = 'mapping'
    //     const propertyValues = [rewardTokens]
    //     const propertyNames = ['rewardTokens']
    //     await (data.contractUtil as ContractUtils).runContractFunction(functionName, rewardTokens)
    //     return {
    //         functionName,
    //         propertyStructName,
    //         propertyNames,
    //         propertyValues
    //     }
    // });

    taskManager.registerTask('addPools', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo
        const functionName = 'addPool'
        const propertyStructName = 'pools'
        let propertyNames = ['poolId', 'indexToken', 'longToken', 'shortToken', 'marketToken']
        let propertyValues: any[][] = []
        vpi.pools.forEach(async(pool) => {
            console.log(`Adding pool ${pool.poolId}`)
            const propertyValuesInner = [pool.poolId, pool.indexToken, pool.longToken, pool.shortToken, pool.marketToken]
            await (data.contractUtil as ContractUtils).setContractConfigValuesArray(functionName, propertyStructName, propertyNames, propertyValuesInner) 
            propertyValues.push(propertyValuesInner)
            console.log('\n-----------------------------------\n')
        })
 
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('addPool (Single Pool)', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo

        const functionName = 'addPool'
        const propertyStructName = 'pools'
        const propertyNames = ['poolId', 'indexToken', 'longToken', 'shortToken', 'marketToken']

        let cliQuestionNumberResponse = await cliSelectItem('Enter the poolId of the pool you want to add', vpi.pools)
        const pool = vpi.pools[cliQuestionNumberResponse]
        const propertyValues = [pool.poolId, pool.indexToken, pool.longToken, pool.shortToken, pool.marketToken]
        await (data.contractUtil as ContractUtils).setContractConfigValuesArray(functionName, propertyStructName, propertyNames, propertyValues) 
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    })

    await taskManager.run()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });