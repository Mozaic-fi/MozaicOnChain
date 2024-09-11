import {networkConfigs} from '../../utils/networkConfigs'
import {ContractUtils} from '../../utils/contractUtils'
import { contractNames } from '../../utils/names/contractNames'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Vaults.Theseus.MultiCallVaultMaster

const deploy: DeployFunction = async (hre) => {

    const networkConfig = networkConfigs.get(hre.network.name)

    const constructorArgs = [networkConfig?.theseusVaultInfo?.vaultMasterAdminAddress ]
    const deployer = new ContractUtils(hre, contractName, constructorArgs, false)

    await deployer.deployAndVerifyContract()
}

deploy.tags = [contractName]

export default deploy