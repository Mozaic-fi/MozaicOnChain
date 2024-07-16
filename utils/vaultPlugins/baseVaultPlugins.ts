import { VaultToken } from '../vaultTokens';

export interface vaultPlugin {
    pluginId: number
    pluginName: string
    pluginContractName: string
    tokens: VaultToken[]
}
