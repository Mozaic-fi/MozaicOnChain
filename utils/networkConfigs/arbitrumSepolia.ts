import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo } from '../vaultPlugins/gmxVaultPlugins'
import { mockPluginInfo } from '../vaultPlugins/mockVaultPlugins'
import { getTokens, getToken, getGMXToken } from '../vaultTokens'

export const arbitrumSepoliaNetworkConfig: NetworkInfo = {
    networkName: networkNames.arbitrumSepolia,
    layerZeroInfo:{
        layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
        layerZeroEIDV2: 40231
    },
    tokensInfo: {           
        treasuryAddress: '0xa3D6360C288551600B20A7992860766F9754e477',
        firstDeployment: true,
        requireAdapter: true,
        mozTokenContractAddress: '0x14E425DB3B55174E51926474b31983F45aA98f4b',
        xMozTokenContractAddress: '0x565a953d1CdfdB7958099AEaF346e5516bc0D907',
        mozStakingContractAddress: '0xf695C44b03Ac7cf0E1B19CC5B803Cb759Ca7a640',
        multiSigOwnerAddress: '0xa3D6360C288551600B20A7992860766F9754e477',
        version: 1
    },
    testNet: true,
    autoVerify: true,
};