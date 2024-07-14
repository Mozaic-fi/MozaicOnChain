import { ethers  } from 'hardhat'
import {networkConfigs} from '../utils/networkConfigs'
import { contractNames } from '../utils/names/contractNames'
import {cliConfirmation} from '../utils/cliUtils'

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
        
        const mozStakingContract = await ethers.getContractAt(mozStaking, mozStakingDeploymentAdress, signer)

        const currentMozToken = await mozStakingContract.mozaicToken()
        const currentXMozToken = await mozStakingContract.xMozToken()
        if(currentMozToken != mozDeploymentAdress || currentXMozToken != xMozDeploymentAdress){
            if(!(await cliConfirmation(`MozStaking is already initialized with MozToken at address: ${currentMozToken} and XMozToken at address: ${currentXMozToken}. Do you want to reinitialize it with MozToken at address: ${mozDeploymentAdress} and XMozToken at address: ${xMozDeploymentAdress}?`))){
                return
            }
            await mozStakingContract.initialize(mozDeploymentAdress, xMozDeploymentAdress);
            console.log(`MozStaking initialized on ${hre.network.name} with MozToken at address: ${mozDeploymentAdress} and XMozToken at address: ${xMozDeploymentAdress}`);
        }else{
            console.log(`MozStaking is already initialized on ${hre.network.name} with MozToken at address: ${mozDeploymentAdress} and XMozToken at address: ${xMozDeploymentAdress}`);
        }
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });