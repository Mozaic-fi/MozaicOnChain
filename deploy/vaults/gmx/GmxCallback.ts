import {networkConfigs} from '../../../utils/networkConfigs'
import {ContractUtils} from '../../../utils/contractUtils'
import { contractNames } from '../../../utils/names/contractNames'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Vaults.Theseus.GmxCallback

const deploy: DeployFunction = async (hre) => {

    const networkConfig = networkConfigs.get(hre.network.name)

    const theseusVaultDeploymentAddress = (await hre.deployments.get(contractNames.Vaults.Theseus.Vault)).address
    const gmxPluginDeploymentAddress = (await hre.deployments.get(contractNames.Vaults.Theseus.GmxPlugin)).address

    const constructorArgs = [theseusVaultDeploymentAddress, gmxPluginDeploymentAddress]
    const deployer = new ContractUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()

    
    const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
    await deployer.setContractConfigValues('setHandler', [], [vaultInfo.depositHandlerAddress, vaultInfo.withdrawHandlerAddress, vaultInfo.orderHandlerAddress])
}

deploy.tags = [contractName]
deploy.dependencies = [ contractNames.Vaults.Theseus.GmxPlugin ]

export default deploy