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

    taskManager.registerTask('setConfig',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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
        const roleStore = await (data.contractUtil as ContractUtils).getVariableValues('roleStore')
        console.log(`roleStore: ${cliCyan(roleStore)}`)

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