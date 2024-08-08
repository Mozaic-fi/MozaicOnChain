import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo } from '../vaultPlugins/gmxVaultPlugins'
import { mockPluginInfo } from '../vaultPlugins/mockVaultPlugins'
import { getTokens, getToken, getGMXToken } from '../vaultTokens'
import {arbitrumOneNetworkConfig} from './arbitrumOne'

export const arbitrumTwoNetworkConfig: NetworkInfo =  {
    networkName: networkNames.arbitrumTwo,
    layerZeroInfo: arbitrumOneNetworkConfig.layerZeroInfo,
    tokensInfo: {
        ...arbitrumOneNetworkConfig.tokensInfo!,
        treasuryAddress: '0xa3D6360C288551600B20A7992860766F9754e477'
    },
    theseusVaultInfo: arbitrumOneNetworkConfig.theseusVaultInfo,
    testNet: true,
    autoVerify: false
};