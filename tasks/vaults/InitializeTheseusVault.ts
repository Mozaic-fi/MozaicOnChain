import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import {cliSelectItem, cliInputList, cliCyan, cliBlue, cliBold, cliRed, cliSelectItems, cliGreen} from '../../utils/cliUtils'
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
        const propertyValues = [data.vaultInfo.vaultMasterAddress]
        const functionName = 'setMaster'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setAdmin', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['admin']
        const propertyValues = [data.vaultInfo.vaultAdminAddress]
        const functionName = 'setAdmin'
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

    taskManager.registerTask('readContractBasicStorage', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const master = await (data.contractUtil as ContractUtils).getVariableValues('master')
        console.log(`Master: ${cliCyan(master)}`)

        const admin = await (data.contractUtil as ContractUtils).getVariableValues('admin')
        console.log(`Admin: ${cliCyan(admin)}`)

        const treasury = await (data.contractUtil as ContractUtils).getVariableValues('treasury')
        console.log(`Treasury: ${cliCyan(treasury)}`)

        const tokenPriceConsumer = await (data.contractUtil as ContractUtils).getVariableValues('tokenPriceConsumer')
        console.log(`Token Price Consumer: ${cliCyan(tokenPriceConsumer)}`)

        const depositMinExecFee = await (data.contractUtil as ContractUtils).getVariableValues('depositMinExecFee')
        console.log(`Deposit Min Exec Fee: ${cliCyan(depositMinExecFee)}`)

        const withdrawMinExecFee = await (data.contractUtil as ContractUtils).getVariableValues('withdrawMinExecFee')
        console.log(`Withdraw Min Exec Fee: ${cliCyan(withdrawMinExecFee)}`)

        const protocolFeePercentage = await (data.contractUtil as ContractUtils).getVariableValues('protocolFeePercentage')
        console.log(`Protocol Fee Percentage: ${cliCyan(protocolFeePercentage)}`)

        const selectedPluginId = await (data.contractUtil as ContractUtils).getVariableValues('selectedPluginId')
        console.log(`Selected Plugin Id: ${cliCyan(selectedPluginId)}`)

        const selectedPoolId = await (data.contractUtil as ContractUtils).getVariableValues('selectedPoolId')
        console.log(`Selected Pool Id: ${cliCyan(selectedPoolId)}`)

        const protocolFeeInVault = await (data.contractUtil as ContractUtils).getVariableValues('protocolFeeInVault')
        console.log(`Selected Pool Id: ${cliRed(protocolFeeInVault)}`)

    });


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
        const tokenIndex = await cliSelectItem('Select a token to add', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['array:acceptedTokens']
        const propertyValues = [tokens[tokenIndex].address]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('addAcceptedTokens', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'addAcceptedToken'
        const tokenIndex = await cliSelectItems('Select a tokens to add', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['array:acceptedTokens']
        const propertyValues:any[] = []
        for (let index of tokenIndex) {
            const token =tokens[index]
            console.log(`Adding token ${cliGreen(token.symbol)}:${cliBlue(token.address)}`)
            await (data.contractUtil as ContractUtils).runContractFunction(functionName,token.address )
            propertyValues.push(token.address)
        }
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })
    

    taskManager.registerTask('getAcceptedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('acceptedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>acceptedTokens.includes(token.address)).map(token=>[token.symbol, token.address])
        console.log(cliBold('Accepted Tokens:'))
        tokens.forEach((token, index) => {
            console.log(`${index+1}. ${cliGreen(token[0])} - ${cliCyan(token[1])}`)
        });
    });
    

    taskManager.registerTask('removeAcceptedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const functionName = 'removeAcceptedToken'
        const tokensList: string[] = await (data.contractUtil as ContractUtils).getArrayValues('acceptedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>tokensList.includes(token.address))
        const tokenIndex = await cliSelectItem('Select a token to remove', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['array:acceptedTokens']
        const propertyValues = [tokensList[tokenIndex]]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
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
        const tokenIndex = await cliSelectItem('Select a token to add', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['array:depositAllowedTokens']
        const propertyValues = [tokens[tokenIndex].address]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('addDepositAllowedTokens', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'addDepositAllowedToken'
        const tokenIndex = await cliSelectItems('Select a tokens to add', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['array:depositAllowedTokens']
        const propertyValues:any[] = []
        for (let index of tokenIndex) {
            const token =tokens[index]
            console.log(`Adding token ${cliGreen(token.symbol)}:${cliBlue(token.address)}`)
            await (data.contractUtil as ContractUtils).runContractFunction(functionName,token.address )
            propertyValues.push(token.address)
        }
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('getDepositAllowedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('depositAllowedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>acceptedTokens.includes(token.address)).map(token=>[token.symbol, token.address])
        console.log(cliBold('Deposit Allowed Tokens:'))
        tokens.forEach((token, index) => {
            console.log(`${index+1}. ${cliGreen(token[0])} - ${cliCyan(token[1])}`)
        });
    })

    taskManager.registerTask('removeDepositAllowedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const functionName = 'removeDepositAllowedToken'
        const tokensList: string[] = await (data.contractUtil as ContractUtils).getArrayValues('depositAllowedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>tokensList.includes(token.address))
        const tokenIndex = await cliSelectItem('Select a token to remove', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['array:depositAllowedTokens']
        const propertyValues = [tokensList[tokenIndex]]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
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
        const propertyNames= ['array:plugins']
        const propertyValues = [PluginAddresses[pluginIndex].id, PluginAddresses[pluginIndex].address]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0], propertyValues[1])
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('getPlugins', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const contractPlugins = await (data.contractUtil as ContractUtils).getArrayValues('plugins')
        const plugins = Array.from(networkConfig.theseusVaultInfo?.vaultPlugins!).filter(entry => contractPlugins.some(p=>entry[1].pluginId == p.pluginId))
        console.log(cliBold('Plugins:'))
        plugins.forEach((plugin, index) => {
            console.log(`${index+1}. ${cliGreen(plugin[1].pluginName)} - ${cliCyan(plugin[1].pluginId.toString())}`)
        });
    });

    taskManager.registerTask('removePlugin', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const functionName = 'removePlugin'
        const contractPlugins = await (data.contractUtil as ContractUtils).getArrayValues('plugins')       
        const plugins = Array.from(networkConfig.theseusVaultInfo?.vaultPlugins!).filter(entry => contractPlugins.some(p=>entry[1].pluginId == p.pluginId))
        const pluginIndex = await cliSelectItem('Select a plugin to remove', plugins)   
        const propertyNames= ['array:plugins']
        const propertyValues = [plugins[pluginIndex][1].pluginId]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })



    taskManager.registerTask('setVaultLockers', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultLockers = await cliInputList('Enter the vault lockers addresses')
        const propertyNames= ['array:vaultLockers']
        const propertyValues = vaultLockers
        const functionName = 'setVaultLockers'
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('getVaultLockers', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultLockers = await (data.contractUtil as ContractUtils).getArrayValues('vaultLockers')
        console.log(cliBold('Vault Lockers:'))
        vaultLockers.forEach((locker, index) => {
            for(let [k,v] of dependencies.entries()){
                if(v == locker){
                    console.log(`${index+1}: ${cliGreen(k)}-${cliCyan(locker)}`)
                    break
                }
            }
            console.log(`${index+1}: ${cliCyan(locker)}`)
        });
    });

    
    taskManager.registerTask('setVaultManagers', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultManagers = await cliInputList('Enter the vault managers addresses')
        const propertyNames= ['array:vaultManagers']
        const propertyValues = vaultManagers
        const functionName = 'setVaultManagers'
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('getVaultManagers', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultManagers = await (data.contractUtil as ContractUtils).getArrayValues('vaultManagers')
        console.log(cliBold('Vault Managers:'))
        vaultManagers.forEach((manager, index) => {
            for(let [k,v] of dependencies.entries()){
                if(v == manager){
                    console.log(`${index+1}: ${cliGreen(k)}-${cliCyan(manager)}`)
                    break
                }
            }
            console.log(`${index+1}. ${cliCyan(manager)}`)
        });
    });

    await taskManager.run()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });