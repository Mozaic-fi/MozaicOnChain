import { ethers  } from 'hardhat'
import {networkConfigs} from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import {cliConfirmation, cliCyan} from '../../../utils/cliUtils'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../../utils/contractUtils'
import { TaskManagerUtils } from '../../../utils/taskManagerUtils'

import hre from 'hardhat';

export const main = async () => {
    const contractName = contractNames.Vaults.Theseus.GmxCallback
    
    
    const taskManager = new TaskManagerUtils(hre, contractName, [contractNames.Vaults.Theseus.GmxPlugin, contractNames.Vaults.Theseus.Vault])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.contractUtil = new ContractUtils(hre, contractName, [], false, contractAddress)
    
    })
    
    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    });

    taskManager.registerTask('setHandlers',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
        const propertyNames = ['depositHandler', 'withdrawalHandler' , 'orderHandler']  
        const propertyValues = [vaultInfo.handlerInfo.depositHandlerAddress, vaultInfo.handlerInfo.withdrawHandlerAddress, vaultInfo.handlerInfo.orderHandlerAddress]
        const functionName = 'setHandler'

        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setConfig',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
        const propertyNames = ['vault', 'gmxPlugin']  
        const propertyValues = [dependencies.get(contractNames.Vaults.Theseus.Vault),  dependencies.get(contractNames.Vaults.Theseus.GmxPlugin)]
        const functionName = 'setConfig'
        const propertyStructName = 'config'
        await (data.contractUtil as ContractUtils).setContractConfigValuesStruct(functionName,propertyStructName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('getContractBasicStorage',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const depositHandler = await (data.contractUtil as ContractUtils).getVariableValues('depositHandler')
        console.log(`depositHandler address: ${cliCyan(depositHandler)}`)

        const withdrawalHandler = await (data.contractUtil as ContractUtils).getVariableValues('withdrawalHandler')
        console.log(`withdrawalHandler address: ${cliCyan(withdrawalHandler)}`)

        const orderHandler = await (data.contractUtil as ContractUtils).getVariableValues('orderHandler')
        console.log(`orderHandler address: ${cliCyan(orderHandler)}`)

        const config = await (data.contractUtil as ContractUtils).getVariableValues('config')
        console.log(`config: ${cliCyan(config)}`)
        
    });

    await taskManager.runInteractive()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });