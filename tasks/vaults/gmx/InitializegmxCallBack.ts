import { ethers  } from 'hardhat'
import {networkConfigs} from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import {cliConfirmation} from '../../../utils/cliUtils'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins'
import { ContractUtils } from '../../../utils/contractUtils'

import hre from 'hardhat';

export const main = async () => {
    const { deployments } = hre
    const contractName = contractNames.Vaults.Theseus.GmxCallback
    console.log(`Initializing ${contractName} on ${hre.network.name}`)

    const signer = (await ethers.getSigners())[0]
    const networkConfig = networkConfigs.get(hre.network.name)
    
    const contractDeploymentAddress = (await deployments.get(contractName)).address
    const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo

    const contractUtil = new ContractUtils(hre, contractName, [], true, contractDeploymentAddress)

    const functionNames = ['depositHandler', 'withdrawalHandler' , 'orderHandler']  
    const values = [vaultInfo.depositHandlerAddress, vaultInfo.withdrawHandlerAddress, vaultInfo.orderHandlerAddress]

    await contractUtil.setContractConfigValues('setHandler',functionNames, values)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });