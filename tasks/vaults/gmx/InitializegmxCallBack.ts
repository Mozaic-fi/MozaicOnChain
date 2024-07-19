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
    
    
    const taskManager = new TaskManagerUtils(hre, contractName, [])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
    })
    
    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Finalizing ${contractName} on ${hre.network.name}`)
    });

    taskManager.registerTask('setHandlers', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
    
        const contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
    
        const propertyNames = ['depositHandler', 'withdrawalHandler' , 'orderHandler']  
        const propertyValues = [vaultInfo.handlerInfo.depositHandlerAddress, vaultInfo.handlerInfo.withdrawHandlerAddress, vaultInfo.handlerInfo.orderHandlerAddress]
        const functionName = 'setHandler'

        await contractUtil.setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('getContractBasicStorage', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const depositHandler = await (data.contractUtil as ContractUtils).getVariableValues('depositHandler')
        console.log(`Selected Pool Id: ${cliCyan(depositHandler)}`)

        const withdrawalHandler = await (data.contractUtil as ContractUtils).getVariableValues('withdrawalHandler')
        console.log(`Selected Pool Id: ${cliCyan(withdrawalHandler)}`)

        const orderHandler = await (data.contractUtil as ContractUtils).getVariableValues('orderHandler')
        console.log(`Selected Pool Id: ${cliCyan(orderHandler)}`)

        const config = await (data.contractUtil as ContractUtils).getVariableValues('config')
        console.log(`Selected Pool Id: ${cliCyan(config)}`)
        
    });

    await taskManager.run()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });