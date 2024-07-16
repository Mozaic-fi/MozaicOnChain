import { vaultPlugin } from './baseVaultPlugins'
import { vaultToken } from '../vaultTokens'

export type gmxPluginHandlerInfo = {
    depositHandlerAddress: string
    withdrawHandlerAddress: string
    orderHandlerAddress: string
}

export type gmxPluginVaultInfo = {
    exchangeRouterAddress: string
    routerAddress: string
    depositVaultAddress: string
    withdrawVaultAddress: string
    orderVaultAddress: string
    readerAddress: string

}

export type gmxParams = {
    uiFeeReceiverAddress: string
    callbackGasLimit: number
    executionFee: number
    shouldUnwrapNativeToken: boolean
}

export type gmxPool = {
    poolId : number
    indexToken: vaultToken
    longToken: vaultToken
    shortToken: vaultToken
    marketToken: vaultToken
}

export interface  gmxPluginInfo extends  vaultPlugin {
    handlerInfo: gmxPluginHandlerInfo
    vaultInfo: gmxPluginVaultInfo
    params: gmxParams
    pools: gmxPool[]
}
