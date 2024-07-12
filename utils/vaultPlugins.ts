import { vaultToken } from './vaultTokens'

export const pluginNames = {
    gmx : {name :'gmx', id: 1}
}
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

