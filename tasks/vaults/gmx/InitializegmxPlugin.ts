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
    
    const taskManager = new TaskManagerUtils(hre, contractName, [contractNames.Vaults.Theseus.GmxCallback])
    taskManager.registerInitCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.vaultInfo = networkConfig?.theseusVaultInfo!
        data.vpi = data.vaultInfo.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
        data.contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
    })

    taskManager.registerFinalizeCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Finalizing ${contractName} on ${hre.network.name}`)
    });

    taskManager.registerTask('setTreasury', async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        await data.contractUtil.setContractConfigValues('setTreasury', ['treasury'], [data.vaultInfo.treasuryAddress])
    });
   
    taskManager.registerTask('setRouterConfig', async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        await data.contractUtil.setContractConfigValuesStruct('setRouterConfig', 'routerConfig',
            ['exchangeRouter', 'router', 'depositVault', 'withdrawVault', 'orderVault', 'reader'], 
            [data.vpi.vaultInfo.exchangeRouterAddress, data.vpi.vaultInfo.routerAddress, data.vpi.vaultInfo.depositVaultAddress, data.vpi.vaultInfo.withdrawVaultAddress, data.vpi.vaultInfo.orderVaultAddress, data.vpi.vaultInfo.readerAddress])
    });

    taskManager.registerTask('setGmxParams', async( hre, contractName, deployments, signer, contractAddress, networkConfig,  dependencies, data) => {
        const callBackContractAddress = (await deployments.get(contractNames.Vaults.Theseus.GmxCallback)).address
    });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });