import {networkConfigs} from '../../utils/networkConfigs'
import {ContractUtils} from '../../utils/contractUtils'
import { contractNames } from '../../utils/names/contractNames'


import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Tokens.XMozToken

const deploy: DeployFunction = async (hre) => {

    const mozStakingDeployment = await hre.deployments.get(contractNames.Tokens.MozStaking)
    
    const constructorArgs = [mozStakingDeployment.address]
    
    const deployer = new ContractUtils(hre, contractName, constructorArgs)
    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy