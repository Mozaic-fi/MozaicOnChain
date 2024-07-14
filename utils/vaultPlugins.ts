import { vaultToken } from './vaultTokens'

export interface vaultPlugin {
    pluginId: number
    pluginName: string
    tokens: vaultToken[]

}
export interface  gmxPluginInfo extends  vaultPlugin {
    depositHandlerAddress: string
    withdrawHandlerAddress: string
    orderHandlerAddress: string
    exchangeRouterAddress: string
}


export interface  mockPluginInfo extends  vaultPlugin {
    mockAddress: string
}
