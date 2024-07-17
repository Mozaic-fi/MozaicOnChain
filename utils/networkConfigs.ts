import { networkNames } from './names/networkNames'
import { tokenSymbols } from './names/tokenSymbols'
import { gmxPluginInfo } from './vaultPlugins/gmxVaultPlugins'
import { vaultPlugin } from './vaultPlugins/baseVaultPlugins'
import { mockPluginInfo } from './vaultPlugins/mockVaultPlugins'
import { pluginNames } from './names/pluginNames'
import { getTokens, getToken, getGMXToken } from './vaultTokens'
import { contractNames } from './names/contractNames'
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
    chainId: number
    layerZeroInfo?: LZInfo
    tokensInfo?: TokensInfo
    theseusVaultInfo?: VaultInfo
    testNet: boolean
}

export const networkConfigs = new Map<string, NetworkInfo>([
    [
        networkNames.arbitrumSepolia,
        {
            networkName: networkNames.arbitrumSepolia,
            chainId: 421614,
            layerZeroInfo:{
                layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
                layerZeroEIDV2: 40231
            },
            tokensInfo: {           
                treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                firstDeployment: true,
                requireAdapter: true,
                mozTokenContractAddress: '0x14E425DB3B55174E51926474b31983F45aA98f4b',
                xMozTokenContractAddress: '0x565a953d1CdfdB7958099AEaF346e5516bc0D907',
                mozStakingContractAddress: '0xf695C44b03Ac7cf0E1B19CC5B803Cb759Ca7a640',
                multiSigOwnerAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                version: 1
            },
            testNet: true,
        },
    ],
    [
        networkNames.baseSepolia,
        {
            networkName: networkNames.baseSepolia,
            chainId: 84532,
            layerZeroInfo: {
                layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
                layerZeroEIDV2: 40245,
            },
            tokensInfo: {
                treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                firstDeployment: false,
                requireAdapter: false,
                multiSigOwnerAddress: '0x4D037D1faa356a8BCa7627cf188E6e6a16167756',
                version:1
            },
            testNet: true,
        },
    ],
    [
        networkNames.sepolia,
        {
            networkName: networkNames.sepolia,
            chainId: 11155111,
            layerZeroInfo: {
                layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
                layerZeroEIDV2: 40161,
            },
            tokensInfo:{
                treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                firstDeployment: false,
                requireAdapter: false,
                multiSigOwnerAddress: '0x4D037D1faa356a8BCa7627cf188E6e6a16167756',
                version: 1
            },
            testNet: true,
        },
    ],
    [
        networkNames.avalancheFuji,
        {
            networkName: networkNames.avalancheFuji,
            chainId: 43113,
            theseusVaultInfo:{
                name: 'theseusVault',
                treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                multiSigOwnerAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                vaultMasterAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                protocolFeePercentage: 1000,
                vaultPlugins: new Map<string, vaultPlugin>([
                    [
                        pluginNames.gmx.name,
                        {
                            pluginId: pluginNames.gmx.id,
                            pluginName: pluginNames.gmx.name,
                            pluginContractName: contractNames.Vaults.Theseus.GmxPlugin,
                            tokens: getTokens(networkNames.avalancheFuji),
                            handlerInfo:{
                                depositHandlerAddress: '0x3cD8Ac94471A52761666F14D9846cbCcF8FeeD69',
                                orderHandlerAddress: '0xC451e5A0cEf62aEcF94AeDc3c3B415a50ebA9C78',
                                withdrawHandlerAddress: '0x2c8779162fa256f828704d4a83f08aA94CAA990D',
                            },
                            vaultInfo:{
                                exchangeRouterAddress: '0xc9c1f8aff1035236223005742A95782B06f39E65',
                                routerAddress: '0x5e7d61e4C52123ADF651961e4833aCc349b61491',
                                depositVaultAddress: '0x2964d242233036C8BDC1ADC795bB4DeA6fb929f2',
                                orderVaultAddress: '0x25D23e8E655727F2687CC808BB9589525A6F599B',
                                withdrawVaultAddress: '0x74d49B6A630Bf519bDb6E4efc4354C420418A6A2',
                                readerAddress: '0xD52216D3A57F7eb1126498f00A4771553c737AE4'   
                            },
                            params:{
                                uiFeeReceiverAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
                                callbackGasLimit: 2000000,
                                executionFee: 5000000000000000,
                                shouldUnwrapNativeToken: false,
                                //keccak256(abi.encode("MAX_PNL_FACTOR_FOR_TRADERS"));
                                pnlFactorType: '0xab15365d3aa743e766355e2557c230d8f943e195dc84d9b2b05928a07b635ee1'
                            },
                            pools: [
                                {
                                    poolId: 1,
                                    indexToken: getToken(tokenSymbols.WAVAX, networkNames.avalancheFuji),
                                    longToken: getToken(tokenSymbols.WAVAX, networkNames.avalancheFuji),
                                    shortToken: getToken(tokenSymbols.USDC, networkNames.avalancheFuji),
                                    marketToken: getGMXToken(networkNames.avalancheFuji, '0xD996ff47A1F763E1e55415BC4437c59292D1F415')
                                },
                                {
                                    poolId: 2,
                                    indexToken: getToken(tokenSymbols.WETH, networkNames.avalancheFuji),
                                    longToken: getToken(tokenSymbols.WETH, networkNames.avalancheFuji),
                                    shortToken: getToken(tokenSymbols.USDC, networkNames.avalancheFuji),
                                    marketToken: getGMXToken(networkNames.avalancheFuji, '0xbf338a6C595f06B7Cfff2FA8c958d49201466374')
                                },
                                {
                                    poolId: 3,
                                    indexToken: getToken(tokenSymbols.WBTC, networkNames.avalancheFuji),
                                    longToken: getToken(tokenSymbols.WBTC, networkNames.avalancheFuji),
                                    shortToken: getToken(tokenSymbols.USDC, networkNames.avalancheFuji),
                                    marketToken: getGMXToken(networkNames.avalancheFuji, '0x79E6e0E454dE82fA98c02dB012a2A69103630B07')
                                },
                            ],
                            executionDepositFee: 0,
                            executionWithdrawFee: 0,
                        } as gmxPluginInfo
                    ],
                    [
                        'mock',
                        {
                            pluginId: -1,
                            pluginName: 'mock',
                            pluginContractName: 'mock',
                            tokens: [],
                            mockAddress: '0x'
                        } as mockPluginInfo
                    ]
                ]),
                version:1
            },
            testNet: true,
            
        },
    ],
    [
        networkNames.arbitrumOne,
        {
            networkName: networkNames.arbitrumOne,
            chainId: 42161,
            layerZeroInfo: {
                layerZeroEndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
                layerZeroEIDV2: 30110,
            },
            tokensInfo: {
                treasuryAddress: '0x0000000000000000000000000000000000000000',
                firstDeployment: true,
                requireAdapter: true,
                mozTokenContractAddress:'0x20547341e58fb558637fa15379c92e11f7b7f710',
                xMozTokenContractAddress:'0x288734c9d9db21C5660B6b893F513cb04B6cD2d6',
                mozStakingContractAddress:'0xe08eFb59e053a586415272c15cDF62758c698739',
                multiSigOwnerAddress: '0xcba641A83D03b979df63b1E5849e0dE0F1831357',
                version: 1
            },
            testNet: false,
        },
    ],
    [
        networkNames.base,
        {
            networkName: networkNames.base,
            chainId: 8453,
            layerZeroInfo: {
                layerZeroEndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
                layerZeroEIDV2: 30184,
            },
            tokensInfo: {          
                treasuryAddress: '0x05806526629efCBcd8B81b9406d6E1d13E4bA265',
                firstDeployment: false,
                requireAdapter: false,
                multiSigOwnerAddress: '0x76aA2d60De952D7d92FaE1ed10babfFB383784f2',
                version: 1
            },
            testNet: false,
        },
    ],
])
