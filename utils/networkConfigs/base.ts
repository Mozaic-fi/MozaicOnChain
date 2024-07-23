import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo } from '../vaultPlugins/gmxVaultPlugins'
import { mockPluginInfo } from '../vaultPlugins/mockVaultPlugins'
import { getTokens, getToken, getGMXToken } from '../vaultTokens'

export const baseNetworkConfig: NetworkInfo = {
    networkName: networkNames.base,
    layerZeroInfo: {
        layerZeroEndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
        layerZeroEIDV2: 30184,
    },
    tokensInfo: {          
        treasuryAddress: '0x05806526629efCBcd8B81b9406d6E1d13E4bA265',
        firstDeployment: false,
        requireAdapter: false,
        multiSigOwnerAddress: '0x76aA2d60De952D7d92FaE1ed10babfFB383784f2',
        version: 1
    },
    testNet: false,
    autoVerify: true,
};