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
        treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde'
    },
    theseusVaultInfo: arbitrumOneNetworkConfig.theseusVaultInfo,
    testNet: true,
    autoVerify: false
};