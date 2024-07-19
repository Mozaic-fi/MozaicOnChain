import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo, getGMXHandlerInfo, getGMXVaultInfo } from '../vaultPlugins/gmxVaultPlugins'
import { mockPluginInfo } from '../vaultPlugins/mockVaultPlugins'
import { getTokens, getToken, getGMXToken } from '../vaultTokens'
import { get } from 'http'

export const arbitrumOneNetworkConfig: NetworkInfo = {
    networkName: networkNames.arbitrumOne,
    layerZeroInfo: {
        layerZeroEndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
        layerZeroEIDV2: 30110,
    },
    tokensInfo: {
        treasuryAddress: '0x0000000000000000000000000000000000000000',
        firstDeployment: true,
        requireAdapter: true,
        mozTokenContractAddress:'0x20547341e58fb558637fa15379c92e11f7b7f710',
        xMozTokenContractAddress:'0x288734c9d9db21C5660B6b893F513cb04B6cD2d6',
        mozStakingContractAddress:'0xe08eFb59e053a586415272c15cDF62758c698739',
        multiSigOwnerAddress: '0xcba641A83D03b979df63b1E5849e0dE0F1831357',
        version: 1
    },
    theseusVaultInfo:{
        name: 'theseusVault',
        //TODO: update addresses
        treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
        multiSigOwnerAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
        vaultMasterAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
        protocolFeePercentage: 1000,
        version: 1,
        vaultPlugins: new Map<string, vaultPlugin>([
            [
                pluginNames.gmx.name,
                {
                    pluginId: pluginNames.gmx.id,
                    pluginName: pluginNames.gmx.name,
                    pluginContractName: contractNames.Vaults.Theseus.GmxPlugin,
                    tokens: getTokens(networkNames.arbitrumOne),
                    handlerInfo: getGMXHandlerInfo(networkNames.arbitrumOne),
                    vaultInfo: getGMXVaultInfo(networkNames.arbitrumOne),
                    params:{
                        uiFeeReceiverAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                        callbackGasLimit: 2000000,
                        executionFee: 5000000000000000,
                        shouldUnwrapNativeToken: false,
                        //keccak256(abi.encode("MAX_PNL_FACTOR_FOR_TRADERS"));
                        pnlFactorType: '0xab15365d3aa743e766355e2557c230d8f943e195dc84d9b2b05928a07b635ee1'
                    },
                    pools: [],
                    executionDepositFee: 0,
                    executionWithdrawFee: 0,
                } as gmxPluginInfo
            ]
        ])
    },
    testNet: false,
};