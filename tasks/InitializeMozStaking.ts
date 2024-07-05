import { ethers  } from 'hardhat'
import {networkConfigs} from '../utils/networkConfigs'

import hre from 'hardhat';

async function main() {
    const { deployments } = hre

    console.log(`Network: ${hre.network.name}`)

    const signer = (await ethers.getSigners())[0]
    const networkConfig = networkConfigs.get(hre.network.name)
    
    if(networkConfig?.requireAdapter){
        return
    }
    else {
        const mozStaking = 'MozStaking'
        const xMozToken = 'XMozToken'
        const mozToken = 'MozToken'

        const mozStakingDeploymentAdress = (await deployments.get(mozStaking)).address
        const xMozDeploymentAdress = (await deployments.get(xMozToken)).address
        const mozDeploymentAdress = (await deployments.get(mozToken)).address

        const mozStakingContract = await ethers.getContractAt(mozStaking, mozStakingDeploymentAdress, signer)

        await mozStakingContract.initialize(mozDeploymentAdress, xMozDeploymentAdress);
        console.log(`MozStaking initialized on ${hre.network.name} with MozToken at address: ${mozDeploymentAdress} and XMozToken at address: ${xMozDeploymentAdress}`);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });