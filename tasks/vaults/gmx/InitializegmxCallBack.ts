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
    const contractName = contractNames.Vaults.Theseus.GmxCallback
    
    
    const taskManager = new TaskManagerUtils(hre, contractName, [])
    taskManager.registerInitCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
    })
    
    taskManager.registerFinalizeCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Finalizing ${contractName} on ${hre.network.name}`)
    });

    taskManager.registerTask('setHandlers', async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
    
        const contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
    
        const functionNames = ['depositHandler', 'withdrawalHandler' , 'orderHandler']  
        const values = [vaultInfo.handlerInfo.depositHandlerAddress, vaultInfo.handlerInfo.withdrawHandlerAddress, vaultInfo.handlerInfo.orderHandlerAddress]
    
        await contractUtil.setContractConfigValues('setHandler',functionNames, values)
    });

    await taskManager.run()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });