import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import { ContractUtils } from '../../utils/contractUtils'
import { TaskManagerUtils } from '../../utils/taskManagerUtils'

import hre from 'hardhat';

async function main() {
    const contractAddress = contractNames.Tokens.MozStaking

    const taskManager = new TaskManagerUtils(hre, contractAddress, [contractNames.Tokens.XMozToken, contractNames.Tokens.MozToken])
    taskManager.registerInitCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig, dependencies, data) => {
        console.log(`Initializing ${contractAddress} on ${hre.network.name}`)
    })

    taskManager.registerFinalizeCallback(async( hre, contractName, deployments, signer, contractAddress, networkConfig, dependencies, data) => {
        console.log(`Finalizing ${contractAddress} on ${hre.network.name}`)
    });

    taskManager.registerTask('initialize-contract', async( hre, contractName, deployments, signer, contractAddress, networkConfig, dependencies, data) => {
        if(networkConfig?.tokensInfo?.requireAdapter){
            return
        }
        else {
            
            const contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
            await contractUtil.setContractConfigValues('initialize', ['mozaicToken', 'xMozToken'],
                 [dependencies.get(contractNames.Tokens.MozToken), dependencies.get(contractNames.Tokens.XMozToken)])
        }
    });

    await taskManager.run()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });