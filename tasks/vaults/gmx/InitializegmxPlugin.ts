import { ethers  } from 'hardhat'
import {networkConfigs} from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import {cliConfirmation} from '../../../utils/cliUtils'
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
        const propertyNames= ['uiFeeReceiver', 'callbackContract', 'callbackGasLimit', 'executionFee', 'shouldUnwrapNativeToken']
        const propertyValues = [vpi.params.uiFeeReceiverAddress, dependencies.get(contractNames.Vaults.Theseus.GmxCallback), vpi.params.callbackGasLimit, vpi.params.executionFee, vpi.params.shouldUnwrapNativeToken]
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
        const functionName = 'setDecimalsBatch'
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

    

    await taskManager.run()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });