import {networkConfigs} from '../../../utils/networkConfigs'
import {ContractUtils} from '../../../utils/contractUtils'
import { contractNames } from '../../../utils/names/contractNames'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins/gmxVaultPlugins'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Vaults.Theseus.GmxPlugin

const deploy: DeployFunction = async (hre) => {

    const networkConfig = networkConfigs.get(hre.network.name)

    const theseusVaultDeploymentAddress = (await hre.deployments.get(contractNames.Vaults.Theseus.Vault)).address

    const constructorArgs = [theseusVaultDeploymentAddress]
    const deployer = new ContractUtils(hre, contractName, constructorArgs, false)

    await deployer.deployAndVerifyContract()   
}

deploy.tags = [contractName]
deploy.dependencies = [ contractNames.Vaults.Theseus.Vault ]

export default deploy