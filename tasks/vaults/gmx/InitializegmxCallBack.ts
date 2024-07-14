import { ethers  } from 'hardhat'
import {networkConfigs} from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import {cliConfirmation} from '../../../utils/cliUtils'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins'

import hre from 'hardhat';

export const main = async () => {
    const { deployments } = hre
    const contractName = contractNames.Vaults.Theseus.GmxCallback
    console.log(`Initializing ${contractName} on ${hre.network.name}`)

    const signer = (await ethers.getSigners())[0]
    const networkConfig = networkConfigs.get(hre.network.name)
    
    const contractDeploymentAddress = (await deployments.get(contractName)).address
    
    const contract = await ethers.getContractAt(contractName, contractDeploymentAddress, signer)

    const currentDepositHandlerAddress = await contract.depositHandler()
    const currentWithdrawalHandlerAddress = await contract.withdrawalHandler()
    const currentOrderHandlerAddress = await contract.orderHandler()

    const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
    if(currentDepositHandlerAddress != vaultInfo.depositHandlerAddress || currentWithdrawalHandlerAddress != vaultInfo.withdrawHandlerAddress || currentOrderHandlerAddress != vaultInfo.orderHandlerAddress){
        if(!(await cliConfirmation(`GmxCallback is already initialized with DepositHandler at address: ${currentDepositHandlerAddress}, WithdrawHandler at address: ${currentWithdrawalHandlerAddress} and OrderHandler at address: ${currentOrderHandlerAddress}. Do you want to reinitialize it with DepositHandler at address: ${vaultInfo.depositHandlerAddress}, WithdrawHandler at address: ${vaultInfo.withdrawHandlerAddress} and OrderHandler at address: ${vaultInfo.orderHandlerAddress}?`))){
            return
        }
        await contract.setHandler(vaultInfo.depositHandlerAddress, vaultInfo.withdrawHandlerAddress, vaultInfo.orderHandlerAddress);
        console.log(`GmxCallback initialized on ${hre.network.name} with DepositHandler at address: ${vaultInfo.depositHandlerAddress}, WithdrawHandler at address: ${vaultInfo.withdrawHandlerAddress} and OrderHandler at address: ${vaultInfo.orderHandlerAddress}`);
    }
    else{
        console.log(`GmxCallback is already initialized on ${hre.network.name} with DepositHandler at address: ${vaultInfo.depositHandlerAddress}, WithdrawHandler at address: ${vaultInfo.withdrawHandlerAddress} and OrderHandler at address: ${vaultInfo.orderHandlerAddress}`);
    }
    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });