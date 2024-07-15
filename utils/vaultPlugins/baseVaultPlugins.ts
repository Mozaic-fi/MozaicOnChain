import { vaultToken } from '../vaultTokens';


export interface vaultPlugin {
    pluginId: number
    pluginName: string
    tokens: vaultToken[]

}
