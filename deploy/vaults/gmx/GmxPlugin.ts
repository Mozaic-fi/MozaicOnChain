import {networkConfigs} from '../../../utils/networkConfigs'
import {ContractUtils} from '../../../utils/contractUtils'
import { contractNames } from '../../../utils/names/contractNames'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../../utils/vaultPlugins'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = contractNames.Vaults.Theseus.GmxPlugin

const deploy: DeployFunction = async (hre) => {

    const networkConfig = networkConfigs.get(hre.network.name)

    const theseusVaultDeploymentAddress = (await hre.deployments.get(contractNames.Vaults.Theseus.Vault)).address

    const constructorArgs = [theseusVaultDeploymentAddress]
    const deployer = new ContractUtils(hre, contractName, constructorArgs)

    await deployer.deployAndVerifyContract()

    
    const gmxCallbackContract = await deployer.getDeployedContract()
    console.log(`initializing ${contractName}...`)
    const vaultInfo = networkConfig?.theseusVaultInfo?.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
    console.log(vaultInfo)
    
    await gmxCallbackContract.set(vaultInfo.depositHandlerAddress, vaultInfo.withdrawHandlerAddress, vaultInfo.orderHandlerAddress)
    console.log('setting handlers done')
}

deploy.tags = [contractName]
deploy.dependencies = [ contractNames.Vaults.Theseus.Vault ]

export default deploy