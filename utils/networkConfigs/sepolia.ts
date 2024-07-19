import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo } from '../vaultPlugins/gmxVaultPlugins'
import { mockPluginInfo } from '../vaultPlugins/mockVaultPlugins'
import { getTokens, getToken, getGMXToken } from '../vaultTokens'

export const sepoliaNetworkConfig: NetworkInfo = {
    networkName: networkNames.sepolia,
    layerZeroInfo: {
        layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
        layerZeroEIDV2: 40161,
    },
    tokensInfo:{
        treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
        firstDeployment: false,
        requireAdapter: false,
        multiSigOwnerAddress: '0x4D037D1faa356a8BCa7627cf188E6e6a16167756',
        version: 1
    },
    testNet: true,
    autoVerify: true,
};