import { ethers  } from 'hardhat'
import {networkConfigs} from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import {cliSelectItem, cliSelectItems, cliCyan, cliBold, cliGreen} from '../../../utils/cliUtils'
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxPluginInfo, gmxPool } from '../../../utils/vaultPlugins/gmxVaultPlugins'
import { ContractUtils } from '../../../utils/contractUtils'
import { TaskManagerUtils } from '../../../utils/taskManagerUtils'
import { getTokens, getTokenFromAddress } from '../../../utils/vaultTokens'


import hre from 'hardhat';

export const main = async () => {
    const contractName = contractNames.Vaults.Theseus.GmxPlugin
    
    const taskManager = new TaskManagerUtils(hre, contractName, [contractNames.Vaults.TokenPriceConsumer, contractNames.Vaults.Theseus.GmxCallback])
    taskManager.registerInitCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Initializing ${contractName} on ${hre.network.name}`)
        data.vaultInfo = networkConfig?.theseusVaultInfo!
        //Note: this is fine since this script is only for gmx plugin
        data.vpi = data.vaultInfo.vaultPlugins.get(pluginNames.gmx.name) as gmxPluginInfo
        data.contractUtil = new ContractUtils(hre, contractName, [], true, contractAddress)
    })

    taskManager.registerFinalizeCallback(async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        console.log(`Finalizing ${contractName} on ${hre.network.name}`)
    });

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
   
    taskManager.registerTask('setRouterConfig', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const propertyNames= ['exchangeRouter', 'router', 'depositVault', 'withdrawVault', 'orderVault', 'reader']
        const propertyValues = [data.vpi.vaultInfo.exchangeRouterAddress, data.vpi.vaultInfo.routerAddress, data.vpi.vaultInfo.depositVaultAddress, data.vpi.vaultInfo.withdrawVaultAddress, data.vpi.vaultInfo.orderVaultAddress, data.vpi.vaultInfo.readerAddress]
        const functionName = 'setRouterConfig'
        const propertyStructName = 'routerConfig'
        await (data.contractUtil as ContractUtils).setContractConfigValuesStruct(functionName, propertyStructName, propertyNames, propertyValues)
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setGmxParams', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo
        const propertyNames= ['uiFeeReceiver', 'callbackContract', 'callbackGasLimit', 'executionFee', 'shouldUnwrapNativeToken', 'pnlFactorType']
        const propertyValues = [vpi.params.uiFeeReceiverAddress, dependencies.get(contractNames.Vaults.Theseus.GmxCallback), vpi.params.callbackGasLimit, vpi.params.executionFee, vpi.params.shouldUnwrapNativeToken, vpi.params.pnlFactorType]
        const functionName = 'setGmxParams'
        const propertyStructName = 'gmxParams'
        await (data.contractUtil as ContractUtils).setContractConfigValuesStruct(functionName, propertyStructName, propertyNames, propertyValues) 
        return {
            functionName,
            propertyStructName,
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

    taskManager.registerTask('getContractBasicStorage', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const treasury = await (data.contractUtil as ContractUtils).getVariableValues('treasury')
        console.log(`treasury: ${cliCyan(treasury)}`)

        const routerConfig = await (data.contractUtil as ContractUtils).getVariableValues('routerConfig')
        console.log(`routerConfig: ${cliCyan(routerConfig)}`)

        const gmxParams = await (data.contractUtil as ContractUtils).getVariableValues('gmxParams')
        console.log(`gmxParams: ${cliCyan(gmxParams)}`)

        const localVault = await (data.contractUtil as ContractUtils).getVariableValues('localVault')
        console.log(`localVault address: ${cliCyan(localVault)}`)

        const tokenPriceConsumer = await (data.contractUtil as ContractUtils).getVariableValues('tokenPriceConsumer')
        console.log(`Token Price Consumer: ${cliCyan(tokenPriceConsumer)}`)
    })

    taskManager.registerTask('getUniqueTokens', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('uniqueTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>acceptedTokens.includes(token.address)).map(token=>[token.symbol, token.address])
        console.log(cliBold('Unique Tokens:'))
        tokens.forEach((token, index) => {
            console.log(`${index+1}. ${cliGreen(token[0])} - ${cliCyan(token[1])}`)
        });
    });

    taskManager.registerTask('setTokenDecimals', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo
        const tokenAddresses= vpi.tokens.map(token => token.address)
        const tokenDecimals = vpi.tokens.map(token => token.decimals)
        const functionName = 'setTokenDecimalsBatch'
        const propertyStructName = 'mapping'
        const propertyValues = [tokenAddresses, tokenDecimals]
        const propertyNames = ['decimals']
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, tokenAddresses, tokenDecimals)
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    });

    taskManager.registerTask('setRewardTokens', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const tokens = getTokens(networkConfig.networkName)
        const functionName = 'setRewardTokens'
        const tokenIndex = await cliSelectItems('Select a tokens to add', tokens.map(token=>[token.symbol, token.address]), true)   
        const propertyNames= ['array:setRewardTokens']
        const propertyValues = [tokenIndex.map(index=>tokens[index].address)]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues)
        return {
            functionName,
            propertyStructName: 'mapping',
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('getRewardTokens', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const acceptedTokens: string[] = await (data.contractUtil as ContractUtils).getArrayValues('rewardTokens')
        const tokens = getTokens(networkConfig.networkName).filter(token=>acceptedTokens.includes(token.address)).map(token=>[token.symbol, token.address])
        console.log(cliBold('Reward Tokens:'))
        tokens.forEach((token, index) => {
            console.log(`${index+1}. ${cliGreen(token[0])} - ${cliCyan(token[1])}`)
        });
    });

    taskManager.registerTask('addPools', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo
        const functionName = 'addPool'
        const propertyStructName = 'pools'
        let propertyNames = ['poolId', 'indexToken', 'longToken', 'shortToken', 'marketToken']
        let propertyValues: any[][] = []
        let cliQuestionNumberResponses = await cliSelectItems('Enter the poolId of the pools you want to add', vpi.pools.map(pool => [pool.poolId, pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address]), true)
        for (let pindex in cliQuestionNumberResponses)
        {
            const pool = vpi.pools[pindex]
            console.log(`Adding pool ${[pool.poolId, pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address]}`)
            const propertyValuesInner = [pool.poolId, pool.indexToken.address, pool.longToken.address, pool.shortToken.address, pool.marketToken.address]
            await (data.contractUtil as ContractUtils).setContractConfigValuesArray(functionName, propertyStructName, propertyNames, propertyValuesInner) 
            propertyValues.push(propertyValuesInner)
        }
 
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('getPools', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const pools = await (data.contractUtil as ContractUtils).getArrayValues('pools')
        const poolsInfo:gmxPool[] = []
        for(let i =0; i<pools.length; i++){
            poolsInfo.push({
                poolId: pools[i][0] as number,
                indexToken: getTokenFromAddress(networkConfig.networkName, pools[i][1] as string),
                longToken: getTokenFromAddress(networkConfig.networkName,pools[i][2]as string),
                shortToken: getTokenFromAddress(networkConfig.networkName,pools[i][3]as string),
                marketToken: getTokenFromAddress(networkConfig.networkName,pools[i][4]as string)
            })
        }
        console.log(cliBold('Pools:'))
        poolsInfo.forEach((pool, index) => {
            console.log(`${index+1}. ${cliGreen([pool.poolId,pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address].toString())}`)
        });
    });

    taskManager.registerTask('addPool (Single Pool)', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const vpi = data.vpi as gmxPluginInfo

        const functionName = 'addPool'
        const propertyStructName = 'pools'
        const propertyNames = ['poolId', 'indexToken', 'longToken', 'shortToken', 'marketToken']

        let cliQuestionNumberResponse = await cliSelectItem('Enter the poolId of the pool you want to add', vpi.pools.map(pool => [pool.poolId, pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address]),true)
        const pool = vpi.pools[cliQuestionNumberResponse]
        const propertyValues = [pool.poolId, pool.indexToken.address, pool.longToken.address, pool.shortToken.address, pool.marketToken.address]
        await (data.contractUtil as ContractUtils).setContractConfigValuesArray(functionName, propertyStructName, propertyNames, propertyValues) 
        return {
            functionName,
            propertyStructName,
            propertyNames,
            propertyValues
        }
    })

    taskManager.registerTask('removePool', async( hre, contractName, signer, contractAddress, networkConfig,  dependencies, data) => {
        const pools = await (data.contractUtil as ContractUtils).getArrayValues('pools')
        const poolsInfo:gmxPool[] = []
        for(let i =0; i<pools.length; i++){
            poolsInfo.push({
                poolId: pools[i][0] as number,
                indexToken: getTokenFromAddress(networkConfig.networkName, pools[i][1] as string),
                longToken: getTokenFromAddress(networkConfig.networkName,pools[i][2]as string),
                shortToken: getTokenFromAddress(networkConfig.networkName,pools[i][3]as string),
                marketToken: getTokenFromAddress(networkConfig.networkName,pools[i][4]as string)
            })
        }
        const poolIndex = await await cliSelectItem('Select a pool to remove',poolsInfo.map(pool=>[pool.poolId,pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address]), true)  
        const functionName = 'removePool'
        const propertyNames= ['array:pools']
        const propertyValues = [poolsInfo[poolIndex].poolId]
        await (data.contractUtil as ContractUtils).runContractFunction(functionName, propertyValues[0])
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