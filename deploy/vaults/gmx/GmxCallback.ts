import {networkConfigs} from '../../../utils/networkConfigs'
import {DeploymentUtils} from '../../../utils/deploymentUtils'
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
    const deployer = new DeploymentUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()

    
    const gmxCallbackContract = await deployer.getDeployedContract()
    console.log(`Setting callBack contract handler addresses in ${contractName} contract`)
    const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
    console.log(vaultInfo)
    await gmxCallbackContract.setHandler(vaultInfo.depositHandlerAddress, vaultInfo.withdrawHandlerAddress, vaultInfo.orderHandlerAddress)
    console.log('setting handlers done')
}

deploy.tags = [contractName]
deploy.dependencies = [ contractNames.Vaults.Theseus.Vault, contractNames.Vaults.Theseus.GmxPlugin ]

export default deploy