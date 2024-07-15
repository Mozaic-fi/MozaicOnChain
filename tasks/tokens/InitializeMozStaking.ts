import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import { ContractUtils } from '../../utils/contractUtils'
import { TaskManagerUtils } from '../../utils/taskManagerUtils'

import hre from 'hardhat';

async function main() {
    const mozStaking = contractNames.Tokens.MozStaking

    const taskManager = new TaskManagerUtils(hre, mozStaking)
    taskManager.registerInitCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig) => {
        console.log(`Initializing ${mozStaking} on ${hre.network.name}`)
    })
    taskManager.registerTask('initialize', async( hre, contractName, deployments, signer, contractAddress, networkConfig) => {
        if(networkConfig?.tokensInfo?.requireAdapter){
            return
        }
        else {
            const xMozToken = contractNames.Tokens.XMozToken
            const mozToken = contractNames.Tokens.MozToken
    
            const mozStakingDeploymentAdress = (await deployments.get(mozStaking)).address
            const xMozDeploymentAdress = (await deployments.get(xMozToken)).address
            const mozDeploymentAdress = (await deployments.get(mozToken)).address
            
            const contractUtil = new ContractUtils(hre, mozStaking, [], true, mozStakingDeploymentAdress)
            await contractUtil.setContractConfigValues('initialize', ['mozaicToken', 'xMozToken'], [mozDeploymentAdress, xMozDeploymentAdress])
        }
    });

    taskManager.registerFinalizeCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig) => {
        console.log(`Finalizing ${mozStaking} on ${hre.network.name}`)
    });

    await taskManager.execute()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });