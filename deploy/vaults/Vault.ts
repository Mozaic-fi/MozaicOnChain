import {networkConfigs} from '../../utils/networkConfigs'
import {ContractUtils} from '../../utils/contractUtils'
import { contractNames } from '../../utils/names/contractNames'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Vaults.Theseus.Vault

const deploy: DeployFunction = async (hre) => {

    const networkConfig = networkConfigs.get(hre.network.name)

    const TokenPriceConsumerAddress = (await hre.deployments.get(contractNames.Vaults.TokenPriceConsumer )).address

    const constructorArgs = [networkConfig?.theseusVaultInfo?.vaultMasterAddress,TokenPriceConsumerAddress, networkConfig?.theseusVaultInfo?.treasuryAddress ]
    const deployer = new ContractUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]
deploy.dependencies = [ contractNames.Vaults.TokenPriceConsumer ]

export default deploy