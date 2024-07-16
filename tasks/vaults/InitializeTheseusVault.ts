import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import {cliSelectItem, cliInputList} from '../../utils/cliUtils'
import { pluginNames } from '../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../utils/contractUtils'
import { TaskManagerUtils } from '../../utils/taskManagerUtils'
import { getTokens } from '../../utils/vaultTokens'

import hre from 'hardhat';

export const main = async () => {
    const contractName = contractNames.Vaults.Theseus.Vault
    
    const taskManager = new TaskManagerUtils(hre, contractName, [contractNames.Vaults.TokenPriceConsumer, contractNames.Vaults.Theseus.GmxCallback, contractNames.Vaults.Theseus.GmxPlugin])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.vaultInfo = networkConfig?.theseusVaultInfo!
        //TODO: This will work for one gmx plugin, however we need to update the scripts to support multiple plugins
        data.vpi = data.vaultInfo.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
        data.contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
    })
    
    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Finalizing ${contractName} on ${hre.network.name}`)
    });

    taskManager.registerTask('setMaster', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        
        const propertyNames= ['master']
        const propertyValues = [data.vaultInfo.master]
        const functionName = 'setMaster'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setTokenPriceConsumer', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['tokenPriceConsumer']
        const propertyValues = [dependencies.get(contractNames.Vaults.TokenPriceConsumer)]
        const functionName = 'setTokenPriceConsumer'
        const propertyStructName = ''
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues) 
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('setTreasury', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['treasury']
        const propertyValues = [data.vaultInfo.treasuryAddress]
        const functionName = 'setTreasury'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    // taskManager.registerTask('selectPluginAndPool', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    //     const propertyNames= ['selectedPluginId', 'selectedPoolId']
    //     const plugins = await (data.contractUtil as ContractUtils).getArrayValues('plugins')
    //     const pluginIndex = await cliSelectItem('Select Plugin to select', plugins)
    //     const plugin = plugins[pluginIndex];
    //     //TODO: Multi plugin support required
    //     const pluginContract = new ContractUtils(hre,contractNames.Vaults.Theseus.GmxPlugin, [], true, plugin.pluginAddress)
    //     const pools = await pluginContract.getArrayValues('pools')
    //     const poolIndex = await cliSelectItem('Select Pool to select', pools)
    //     const propertyValues = [pools[poolIndex].poolId, plugin.pluginId]
    //     const functionName = 'selectPluginAndPool'
    //     await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
    //     return {
    //         functionName,
    //         propertyStructName: '',
    //         propertyNames,
    //         propertyValues
    //     }
    // });

    taskManager.registerTask('setExecutionFee', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo
        const functionName = 'setExecutionFee'
        const propertyNames= ['depositMinExecFee', 'withdrawMinExecFee']
        const propertyValues = [vpi.executionDepositFee, vpi.executionWithdrawFee]
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('addAcceptedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'addAcceptedToken'
        const tokenIndex = await cliSelectItem('Select a token to add', tokens)   
        const propertyNames= ['acceptedTokens']
        const propertyValues = [tokens[tokenIndex].address]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('removeAcceptedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const functionName = 'removeAcceptedToken'
        const tokensList: string[] = await (data.contractUtil as ContractUtils).getArrayValues('acceptedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>tokensList.includes(token.address))
        const tokenIndex = await cliSelectItem('Select a token to remove', tokens)   
        const propertyNames= ['acceptedTokens']
        const propertyValues = [tokensList[tokenIndex]]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })
    

    taskManager.registerTask('addDepositAllowedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'addDepositAllowedToken'
        const tokenIndex = await cliSelectItem('Select a token to add', tokens)   
        const propertyNames= ['depositAllowedTokens']
        const propertyValues = [tokens[tokenIndex].address]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('removeDepositAllowedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const functionName = 'removeDepositAllowedToken'
        const tokensList: string[] = await (data.contractUtil as ContractUtils).getArrayValues('depositAllowedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>tokensList.includes(token.address))
        const tokenIndex = await cliSelectItem('Select a token to remove', tokens)   
        const propertyNames= ['depositAllowedTokens']
        const propertyValues = [tokensList[tokenIndex]]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('addPlugin', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const plugins = networkConfig.theseusVaultInfo?.vaultPlugins!
        let PluginAddresses = []
        for (let plugin of plugins.values()) {
            const pluginDeployment = dependencies.get(plugin.pluginContractName)
            PluginAddresses.push({
                name: plugin.pluginName,
                address: pluginDeployment,
                id: plugin.pluginId
            })
        }
        const functionName = 'addPlugin'
        const pluginIndex = await cliSelectItem('Select a plugin to add', PluginAddresses)   
        const propertyNames= ['_pluginId', '_pluginAddress']
        const propertyValues = [PluginAddresses[pluginIndex].id, PluginAddresses[pluginIndex].address]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('removePlugin', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const functionName = 'removePlugin'
        const contractPlugins = await (data.contractUtil as ContractUtils).getArrayValues('plugins')       
        const plugins = Array.from(networkConfig.theseusVaultInfo?.vaultPlugins!).filter(entry => contractPlugins.some(p=>entry[1].pluginId == p.pluginId))
        const pluginIndex = await cliSelectItem('Select a plugin to remove', plugins)   
        const propertyNames= ['plugins']
        const propertyValues = [plugins[pluginIndex][1].pluginId]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('setProtocolFeePercentage', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['protocolFeePercentage']
        const propertyValues = [data.vaultInfo.protocolFeePercentage]
        const functionName = 'setProtocolFeePercentage'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setVaultLockers', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultLockers = await cliInputList('Enter the vault lockers addresses')
        const propertyNames= ['vaultLockers']
        const propertyValues = [vaultLockers]
        const functionName = 'setVaultLockers'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    
    taskManager.registerTask('setVaultManagers', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultManagers = await cliInputList('Enter the vault managers addresses')
        const propertyNames= ['vaultManagers']
        const propertyValues = [vaultManagers]
        const functionName = 'setVaultManagers'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    await taskManager.run()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });