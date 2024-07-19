import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo } from '../vaultPlugins/gmxVaultPlugins'
import { mockPluginInfo } from '../vaultPlugins/mockVaultPlugins'
import { getTokens, getToken, getGMXToken } from '../vaultTokens'

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
    testNet: false,
};