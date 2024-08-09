import { ethers  } from 'hardhat'
import {networkConfigs} from '../../utils/networkConfigs'
import { contractNames } from '../../utils/names/contractNames'
import {cliSelectItem, cliInputList, cliCyan, cliBlue, cliBold, cliRed, cliSelectItems, cliGreen, cliConfirmation} from '../../utils/cliUtils'
import { pluginNames } from '../../utils/names/pluginNames'
import { gmxPluginInfo } from '../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../utils/contractUtils'
import { TaskManagerUtils } from '../../utils/taskManagerUtils'
import { getTokens } from '../../utils/vaultTokens'

import hre from 'hardhat';

export const main = async () => {
    const contractName = contractNames.Vaults.Theseus.Vault
    
    const taskManager = new TaskManagerUtils(hre, contractName, [contractNames.Vaults.TokenPriceConsumer, contractNames.Vaults.Theseus.GmxCallback, contractNames.Vaults.Theseus.GmxPlugin, contractNames.Vaults.Theseus.MultiCallVaultMaster])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.vaultInfo = networkConfig?.theseusVaultInfo!
        //TODO: This will work for one gmx plugin, however we need to update the scripts to support multiple plugins
        data.vpi = data.vaultInfo.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
        data.contractUtil = new ContractUtils(hre, contractName, [], false, contractAddress)
        data.gmxPlugin = new ContractUtils(hre, contractNames.Vaults.Theseus.GmxPlugin, [], false, dependencies.get(contractNames.Vaults.Theseus.GmxPlugin))
    })
    
    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    });

    taskManager.registerTask('setMaster',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['masterContract']
        const propertyValues = [dependencies.get(contractNames.Vaults.Theseus.MultiCallVaultMaster)]
        const functionName = 'setMaster'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setAdmin',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('setTokenPriceConsumer',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('setTreasury',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('setProtocolFeePercentage',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('getContractBasicStorage', false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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
        console.log(`protocol Fee Percentage: ${cliCyan(protocolFeePercentage)}`)

        const selectedPluginId = await (data.contractUtil as ContractUtils).getVariableValues('selectedPluginId')
        console.log(`Selected Plugin Id: ${cliCyan(selectedPluginId)}`)

        const selectedPoolId = await (data.contractUtil as ContractUtils).getVariableValues('selectedPoolId')
        console.log(`Selected Pool Id: ${cliCyan(selectedPoolId)}`)

        const protocolFeeInVault = await (data.contractUtil as ContractUtils).getVariableValues('protocolFeeInVault')
        console.log(`protocol Fee In Vault: ${cliRed(protocolFeeInVault)}`)

    });


    taskManager.registerTask('setExecutionFee',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    // taskManager.registerTask('addAcceptedToken',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    //     const tokens = getTokens(networkConfig.networkName)
    //     const functionName = 'addAcceptedToken'
    //     const tokenIndex = await cliSelectItem('Select a token to add', tokens.map(token=>[token.symbol, token.address]), true)   
    //     const propertyNames= ['array:acceptedTokens']
    //     const propertyValues = [tokens[tokenIndex].address]
    //     await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
    //     return {
    //         functionName,
    //         propertyStructName: '',
    //         propertyNames,
    //         propertyValues
    //     }
    // })

    // taskManager.registerTask('addAcceptedTokens',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    //     const tokens = getTokens(networkConfig.networkName)
    //     const functionName = 'addAcceptedToken'
    //     const gmxUniques = await (data.gmxPlugin as ContractUtils).getArrayValues('uniqueTokens')
    //     let tokenIndex: number[] = []
    //     if(gmxUniques.length != 0) {
    //         console.log('Default Values (GMXPlugin uniqueTokens):')
    //         for (let token of gmxUniques) {
    //             console.log(`${cliGreen(tokens.filter(t=>t.address==token).map(t=>t.symbol)[0])}: ${cliCyan(token)}`)
    //         }
    //         if(await cliConfirmation('Do you want to use gmxPlugin uniqueTokens?', true)) {
    //             tokenIndex = tokens.map((t,i) => gmxUniques.includes(t.address) ? i : -1).filter(i => i !== -1)
    //         }
    //         else{
    //             tokenIndex = await cliSelectItems('Select a tokens to add', tokens.map(token=>[token.symbol, token.address]), true)   
    //         }
    //     }
    //     const propertyNames= ['array:acceptedTokens']
    //     const propertyValues:any[] = []
    //     for (let index of tokenIndex) {
    //         const token =tokens[index]
    //         const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('acceptedTokens')
    //         if(acceptedTokens.includes(token.address)){
    //             console.log(`${cliGreen(token.symbol)}:${cliBlue(token.address)} is already added`)
    //             continue
    //         }
    //         console.log(`Adding token ${cliGreen(token.symbol)}:${cliBlue(token.address)}`)
    //         await (data.contractUtil as ContractUtils).runContractFunction(functionName,token.address )
    //         propertyValues.push(token.address)
    //     }
    //     return {
    //         functionName,
    //         propertyStructName: '',
    //         propertyNames,
    //         propertyValues
    //     }
    // })
    

    taskManager.registerTask('addAcceptedTokens',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'addAcceptedTokens'
        const gmxUniques = await (data.gmxPlugin as ContractUtils).getArrayValues('uniqueTokens')
        let tokenIndex: number[] = []
        if(gmxUniques.length != 0) {
            console.log('Default Values (GMXPlugin uniqueTokens):')
            for (let token of gmxUniques) {
                console.log(`${cliGreen(tokens.filter(t=>t.address==token && !t.synthetic).map(t=>t.symbol)[0])}: ${cliCyan(token)}`)
            }
            if(await cliConfirmation('Do you want to use gmxPlugin uniqueTokens?', true)) {
                tokenIndex = tokens.map((t,i) => (gmxUniques.includes(t.address) && !t.synthetic) ? i : -1).filter(i => i !== -1)
            }
            else{
                tokenIndex = await cliSelectItems('Select a tokens to add', tokens.map(token=>[token.symbol, token.address]), true)   
            }
        }
        const propertyNames= ['acceptedTokens']
        const propertyValues:any[] = []
        const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues(propertyNames[0])
        for (let index of tokenIndex) {
            const token =tokens[index]
            if(acceptedTokens.includes(token.address)){
                console.log(`${cliGreen(token.symbol)}:${cliBlue(token.address)} is already added`)
                continue
            }
            console.log(`Adding token ${cliGreen(token.symbol)}:${cliBlue(token.address)}`)
            propertyValues.push(token.address)
        }
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('getAcceptedToken',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('acceptedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>acceptedTokens.includes(token.address)).map(token=>[token.symbol, token.address])
        console.log(cliBold('Accepted Tokens:'))
        tokens.forEach((token, index) => {
            console.log(`${index+1}. ${cliGreen(token[0])} - ${cliCyan(token[1])}`)
        });
    });
    

    taskManager.registerTask('removeAcceptedToken',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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
    

    // taskManager.registerTask('addDepositAllowedToken', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    //     const tokens = getTokens(networkConfig.networkName)
    //     const functionName = 'addDepositAllowedToken'
    //     const tokenIndex = await cliSelectItem('Select a token to add', tokens.map(token=>[token.symbol, token.address]), true)   
    //     const propertyNames= ['array:depositAllowedTokens']
    //     const propertyValues = [tokens[tokenIndex].address]
    //     await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
    //     return {
    //         functionName,
    //         propertyStructName: '',
    //         propertyNames,
    //         propertyValues
    //     }
    // })

    // taskManager.registerTask('addDepositAllowedTokens',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
    //     const tokens = getTokens(networkConfig.networkName)
    //     const functionName = 'addDepositAllowedToken'
    //     const gmxUniques = await (data.gmxPlugin as ContractUtils).getArrayValues('uniqueTokens')
    //     let tokenIndex: number[] = []
    //     if(gmxUniques.length != 0) {
    //         console.log('Default Values (GMXPlugin uniqueTokens):')
    //         for (let token of gmxUniques) {
    //             console.log(`${cliGreen(tokens.filter(t=>t.address==token).map(t=>t.symbol)[0])}: ${cliCyan(token)}`)
    //         }
    //         if(await cliConfirmation('Do you want to use gmxPlugin uniqueTokens?', true)) {
    //             tokenIndex = tokens.map((t,i) => gmxUniques.includes(t.address) ? i : -1).filter(i => i !== -1)
    //         }
    //         else{
    //             tokenIndex = await cliSelectItems('Select a tokens to add', tokens.map(token=>[token.symbol, token.address]), true)   
    //         }
    //     }  
    //     const propertyNames= ['array:depositAllowedTokens']
    //     const propertyValues:any[] = []
    //     for (let index of tokenIndex) {
    //         const token =tokens[index]
    //         const depositAllowedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('depositAllowedTokens')
    //         if(depositAllowedTokens.includes(token.address)){
    //             console.log(`${cliGreen(token.symbol)}:${cliBlue(token.address)} is already added`)
    //             continue
    //         }
    //         console.log(`Adding token ${cliGreen(token.symbol)}:${cliBlue(token.address)}`)
    //         await (data.contractUtil as ContractUtils).runContractFunction(functionName,token.address )
    //         propertyValues.push(token.address)
    //     }
    //     return {
    //         functionName,
    //         propertyStructName: '',
    //         propertyNames,
    //         propertyValues
    //     }
    // })

    
    taskManager.registerTask('addDepositAllowedTokens',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'addDepositAllowedTokens'
        const gmxUniques = await (data.gmxPlugin as ContractUtils).getArrayValues('uniqueTokens')
        let tokenIndex: number[] = []
        if(gmxUniques.length != 0) {
            console.log('Default Values (GMXPlugin uniqueTokens):')
            for (let token of gmxUniques) {
                console.log(`${cliGreen(tokens.filter(t=>t.address==token && !t.synthetic).map(t=>t.symbol)[0])}: ${cliCyan(token)}`)
            }
            if(await cliConfirmation('Do you want to use gmxPlugin uniqueTokens?', true)) {
                tokenIndex = tokens.map((t,i) => (gmxUniques.includes(t.address) && !t.synthetic) ? i : -1).filter(i => i !== -1)
            }
            else{
                tokenIndex = await cliSelectItems('Select a tokens to add', tokens.map(token=>[token.symbol, token.address]), true)   
            }
        }  
        const propertyNames= ['depositAllowedTokens']
        const propertyValues:any[] = []
        const depositAllowedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues(propertyNames[0])
        for (let index of tokenIndex) {
            const token =tokens[index]           
            if(depositAllowedTokens.includes(token.address)){
                console.log(`${cliGreen(token.symbol)}:${cliBlue(token.address)} is already added`)
                continue
            }
            console.log(`Adding token ${cliGreen(token.symbol)}:${cliBlue(token.address)}`)
            propertyValues.push(token.address)
        }
        await (data.contractUtil as ContractUtils).runContractFunction(functionName,propertyValues )
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('getDepositAllowedToken',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('depositAllowedTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>acceptedTokens.includes(token.address)).map(token=>[token.symbol, token.address])
        console.log(cliBold('Deposit Allowed Tokens:'))
        tokens.forEach((token, index) => {
            console.log(`${index+1}. ${cliGreen(token[0])} - ${cliCyan(token[1])}`)
        });
    })

    taskManager.registerTask('removeDepositAllowedToken',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('addPlugin',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('selectPluginAndPool',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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
        const pluginIndex = await cliSelectItem('Select a plugin to add', PluginAddresses)  
        
        const vpi = data.vpi as gmxPluginInfo
        let cliQuestionNumberResponse = await cliSelectItem('Enter the poolId of the pool you want to add', vpi.pools.map(pool => [pool.poolId, pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address]),true)
        const pool = vpi.pools[cliQuestionNumberResponse]

        const propertyNames= ['selectedPluginId', 'selectedPoolId']
        const propertyValues = [PluginAddresses[pluginIndex].id,pool.poolId ]
        const functionName = 'selectPluginAndPool'
        await (data.contractUtil as ContractUtils).setContractConfigValues(functionName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('getPlugins',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const contractPlugins = await (data.contractUtil as ContractUtils).getArrayValues('plugins')
        const plugins = Array.from(networkConfig.theseusVaultInfo?.vaultPlugins!).filter(entry => contractPlugins.some(p=>entry[1].pluginId == p.pluginId))
        console.log(cliBold('Plugins:'))
        plugins.forEach((plugin, index) => {
            console.log(`${index+1}. ${cliGreen(plugin[1].pluginName)} - ${cliCyan(plugin[1].pluginId.toString())}`)
        });
    });

    taskManager.registerTask('removePlugin',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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



    taskManager.registerTask('setVaultLockers',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('setVaultLocker as GMXCallBack',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultLockers = await (data.contractUtil as ContractUtils).getArrayValues('vaultLockers')
        if(vaultLockers.includes(dependencies.get(contractNames.Vaults.Theseus.GmxCallback))){
            console.log('GMXCallback is already added as vault locker')
            return
        }
        const propertyNames= ['array:vaultLockers']
        const propertyValues = [dependencies.get(contractNames.Vaults.Theseus.GmxCallback)]
        const functionName = 'setVaultLockers'
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('getVaultLockers',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    
    taskManager.registerTask('setVaultManagers',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    taskManager.registerTask('setVaultManager as GMXCallBack',true, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vaultManagers = await (data.contractUtil as ContractUtils).getArrayValues('vaultManagers')
        if(vaultManagers.includes(dependencies.get(contractNames.Vaults.Theseus.GmxCallback))){
            console.log('GMXCallback is already added as vault manager')
            return
        }
        const propertyNames= ['array:vaultManagers']
        const propertyValues = [dependencies.get(contractNames.Vaults.Theseus.GmxCallback)]
        const functionName = 'setVaultManagers'
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues)
        return {
            functionName,
            propertyStructName: '',
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('getVaultManagers',false, async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
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

    await taskManager.runInteractive()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });