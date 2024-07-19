import { networkNames } from './names/networkNames'
import { vaultPlugin } from './vaultPlugins/baseVaultPlugins'
import {avalancheFujiNetworkConfig} from './networkConfigs/avalancheFuji'
import { arbitrumSepoliaNetworkConfig } from './networkConfigs/arbitrumSepolia'
import { baseSepoliaNetworkConfig } from './networkConfigs/baseSepolia'
import { sepoliaNetworkConfig } from './networkConfigs/sepolia'
import { arbitrumOneNetworkConfig } from './networkConfigs/arbitrumOne'
import { arbitrumTwoNetworkConfig } from './networkConfigs/arbitrumTwo'
import { baseNetworkConfig } from './networkConfigs/base'


export type LZInfo = {
    layerZeroEndpointV2: string
    layerZeroEIDV2: number

}
export type TokensInfo = {
    mozTokenContractAddress?: string
    xMozTokenContractAddress?: string
    mozStakingContractAddress?: string
    treasuryAddress: string
    firstDeployment: boolean
    requireAdapter: boolean
    multiSigOwnerAddress : string
    version: number
}
export type VaultInfo = {
    name: string
    treasuryAddress: string
    multiSigOwnerAddress: string
    vaultMasterAddress: string
    vaultPlugins: Map<string, vaultPlugin>
    version: number,
    protocolFeePercentage: number
}

export type NetworkInfo = {
    networkName: networkNames
    layerZeroInfo?: LZInfo
    tokensInfo?: TokensInfo
    theseusVaultInfo?: VaultInfo
    testNet: boolean
}

export const networkConfigs = new Map<string, NetworkInfo>([
    //testnet
    [
        networkNames.arbitrumSepolia,
        arbitrumSepoliaNetworkConfig
    ],
    [
        networkNames.baseSepolia,
        baseSepoliaNetworkConfig
    ],
    [
        networkNames.sepolia,
        sepoliaNetworkConfig
    ],
    [
        networkNames.avalancheFuji,
        avalancheFujiNetworkConfig
    ],
    //VNet
    [
        networkNames.arbitrumTwo,
        arbitrumTwoNetworkConfig
    ],
    //Mainnet
    [
        networkNames.arbitrumOne,
        arbitrumOneNetworkConfig
    ],
    [
        networkNames.base,
        baseNetworkConfig
    ],
])
