import { ethers  } from 'hardhat'
import {networkConfigs} from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import {cliConfirmation} from '../../../utils/cliUtils'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../../utils/contractUtils'

import hre from 'hardhat';

export const main = async () => {
    const { deployments } = hre
    const contractName = contractNames.Vaults.Theseus.GmxPlugin
    console.log(`Initializing ${contractName} on ${hre.network.name}`)

    const signer = (await ethers.getSigners())[0]
    const networkConfig = networkConfigs.get(hre.network.name)
    
    const contractDeploymentAddress = (await deployments.get(contractName)).address

    const vaultInfo = networkConfig?.theseusVaultInfo!
    const vpi = vaultInfo.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo


    const contractUtil = new ContractUtils(hre, contractName, [], true, contractDeploymentAddress)

    await contractUtil.setContractConfigValues('setTreasury', ['treasury'], [vaultInfo.treasuryAddress])
    await contractUtil.setContractConfigValuesStruct('setRouterConfig', 'routerConfig',
        ['exchangeRouter', 'router', 'depositVault', 'withdrawVault', 'orderVault', 'reader'], 
        [vpi.vaultInfo.exchangeRouterAddress, vpi.vaultInfo.routerAddress, vpi.vaultInfo.depositVaultAddress, vpi.vaultInfo.withdrawVaultAddress, vpi.vaultInfo.orderVaultAddress, vpi.vaultInfo.readerAddress])

    const callBackContractAddress = (await deployments.get(contractNames.Vaults.Theseus.GmxCallback)).address
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });