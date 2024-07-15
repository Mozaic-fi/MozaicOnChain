import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import { ContractUtils } from '../../utils/contractUtils'

import hre from 'hardhat';

async function main() {
    const { deployments } = hre
    const mozStaking = contractNames.Tokens.MozStaking
    console.log(`Initializing ${mozStaking} on ${hre.network.name}`)

    const signer = (await ethers.getSigners())[0]
    const networkConfig = networkConfigs.get(hre.network.name)
    
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });