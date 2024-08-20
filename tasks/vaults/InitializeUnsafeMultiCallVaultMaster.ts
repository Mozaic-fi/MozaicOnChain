import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import {cliConfirmation, cliCyan} from '../../utils/cliUtils'
import { pluginNames } from '../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../utils/contractUtils'
import { TaskManagerUtils } from '../../utils/taskManagerUtils'
import { getTokens } from '../../utils/vaultTokens'

import hre from 'hardhat';

export const main = async () => {
    const contractName = contractNames.Vaults.Theseus.UnsafeMultiCallVaultMaster;
    
    
    const taskManager = new TaskManagerUtils(hre, contractName, [contractNames.Vaults.Theseus.Vault])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.vaultInfo = networkConfig?.theseusVaultInfo!
        data.contractUtil = new ContractUtils(hre, contractName, [], false, contractAddress)    
    })
    
    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    });

    
    taskManager.registerTask('setAdmin',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['admin']
        const propertyValues = [data.vaultInfo.vaultMasterAdminAddress]
        const functionName = 'setAdmin'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setVault',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['vault']
        const propertyValues = [dependencies.get(contractNames.Vaults.Theseus.Vault)]
        const functionName = 'setVault'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
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