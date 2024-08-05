import { vaultPlugin } from './baseVaultPlugins'
import { VaultToken } from '../vaultTokens'
import { networkNames } from '../names/networkNames'
import { GmxUtils,gmxContracts } from '../gmxUtils'

export type gmxPluginVaultInfo = {
    exchangeRouterAddress: string
    routerAddress: string
    depositVaultAddress: string
    withdrawVaultAddress: string
    orderVaultAddress: string
    readerAddress: string
    roleStoreAddress: string

}

export type gmxParams = {
    uiFeeReceiverAddress: string
    callbackGasLimit: number
    executionFee: string
    shouldUnwrapNativeToken: boolean
    pnlFactorType: string
}

export type gmxPool = {
    poolId : number
    indexToken: VaultToken
    longToken: VaultToken
    shortToken: VaultToken
    marketToken: VaultToken
}

export interface  gmxPluginInfo extends  vaultPlugin {
    vaultInfo: gmxPluginVaultInfo
    params: gmxParams
    pools: gmxPool[]
    executionDepositFee: number
    executionWithdrawFee: number
}

export const getGMXVaultInfo = (networkName: networkNames): gmxPluginVaultInfo => {
    const gmxUtils = new GmxUtils(networkName);
    return {
        exchangeRouterAddress: gmxUtils.getContractAddress(gmxContracts.exchangeRouter),
        routerAddress: gmxUtils.getContractAddress(gmxContracts.router),
        depositVaultAddress: gmxUtils.getContractAddress(gmxContracts.depositVault),
        orderVaultAddress: gmxUtils.getContractAddress(gmxContracts.orderVault),
        withdrawVaultAddress: gmxUtils.getContractAddress(gmxContracts.withdrawalVault),
        readerAddress: gmxUtils.getContractAddress(gmxContracts.reader),
        roleStoreAddress: gmxUtils.getContractAddress(gmxContracts.roleStore)   
    };
}