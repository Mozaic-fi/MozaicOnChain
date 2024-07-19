import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo } from '../vaultPlugins/gmxVaultPlugins'
import { mockPluginInfo } from '../vaultPlugins/mockVaultPlugins'
import { getTokens, getToken, getGMXToken } from '../vaultTokens'


export const avalancheFujiNetworkConfig: NetworkInfo =  {
    networkName: networkNames.avalancheFuji,
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
    
};