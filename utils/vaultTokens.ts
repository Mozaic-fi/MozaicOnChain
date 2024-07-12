import { networkNames } from './networkConfigs'
import { pluginNames } from './vaultPlugins'
export type vaultToken= {
    tokenAddress: string
    tokenDecimals?: number
    tokenPriceFeedAddress: string
    tokenHeartbeatDuration: number
    tokenSequencerStatusReportedAddress?: string  
    acceptedInVault: boolean
    depositAllowed: boolean
    network: string
    pluginId: number
}
export const vaultTokens: vaultToken[] = []
export const arbitrumOneGMXVaultTokens: vaultToken[] = vaultTokens.filter((token) => token.network === networkNames.arbitrumOne && token.pluginId === pluginNames.gmx.id)
export const arbitrumSepoliaGMXVaultTokens: vaultToken[] = vaultTokens.filter((token) => token.network === networkNames.arbitrumSepolia && token.pluginId === pluginNames.gmx.id)   