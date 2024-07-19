import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import { ContractUtils } from '../../utils/contractUtils'
import { TaskManagerUtils } from '../../utils/taskManagerUtils'

import hre from 'hardhat';

async function main() {
    const contractAddress = contractNames.Tokens.MozStaking

    const taskManager = new TaskManagerUtils(hre, contractAddress, [contractNames.Tokens.XMozToken, contractNames.Tokens.MozToken])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig, dependencies, data) => {
        data.contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
        console.log(`Initializing ${contractAddress} on ${hre.network.name}`)
    })

    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig, dependencies, data) => {
        console.log(`Finalizing ${contractAddress} on ${hre.network.name}`)
    });

    taskManager.registerTask('initialize-contract', async( hre, contractName, signer, contractAddress, networkConfig, dependencies, data) => {
        if(networkConfig?.tokensInfo?.requireAdapter){
            return
        }
        else {        
            const propertyNames= ['mozaicToken', 'xMozToken']
            const propertyValues = [dependencies.get(contractNames.Tokens.MozToken), dependencies.get(contractNames.Tokens.XMozToken)]
            const functionName = 'initialize'
            await (data.contractUtil as ContractUtils).setContractConfigValues(functionName,propertyNames , propertyValues)
            return {
                functionName,
                propertyStructName: '',
                propertyNames,
                propertyValues
            }
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