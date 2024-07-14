import { vaultToken } from './vaultTokens'

export type vaultPlugin = {
    pluginId: number
    pluginName: string
    tokens: vaultToken[]

}
export type gmxPluginInfo = vaultPlugin & {
    depositHandlerAddress: string
    withdrawHandlerAddress: string
    orderHandlerAddress: string
    exchangeRouterAddress: string
}

