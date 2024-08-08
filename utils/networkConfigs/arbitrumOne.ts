import { NetworkInfo } from '../networkConfigs'
import { networkNames } from '../names/networkNames'
import { contractNames } from '../names/contractNames'
import { pluginNames } from '../names/pluginNames' 
import { tokenSymbols } from '../names/tokenSymbols'
import { vaultPlugin } from '../vaultPlugins/baseVaultPlugins'
import { gmxPluginInfo, getGMXVaultInfo, gmxPool } from '../vaultPlugins/gmxVaultPlugins'
import { getTokens, getToken, getGMXToken, getTokenFromAddress } from '../vaultTokens'


const getOriginalPools = (): gmxPool[] =>{
    const importedPools = [
        [ 1,'0x47904963fc8b2340414262125aF798B9655E58Cd','0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x47c031236e19d024b42f8AE6780E44A573170703'],//a
        [ 2,'0x82aF49447D8a07e3bd95BD0d56f35241523fBab1','0x82aF49447D8a07e3bd95BD0d56f35241523fBab1','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x70d95587d40A2caf56bd97485aB3Eec10Bee6336'],//a
        [ 3,'0xC4da4c24fd591125c3F47b340b6f4f76111883d8','0x82aF49447D8a07e3bd95BD0d56f35241523fBab1','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4'],//a
        [ 4,'0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07','0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x09400D9DB990D5ed3f35D7be61DfAEB900Af03C9'],//a
        [ 5,'0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0','0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0xc7Abb2C5f3BF3CEB389dF0Eecd6120D451170B50'],//a
        [ 6,'0xf97f4df75117a78c1A5a0DBb814Af92458539FB4','0xf97f4df75117a78c1A5a0DBb814Af92458539FB4','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x7f1fa204bb700853D36994DA19F830b6Ad18455C'],//a
        [ 7,'0x912CE59144191C1204E64559FE8253a0e49E6548','0x912CE59144191C1204E64559FE8253a0e49E6548','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407'],//a
        [ 8,'0xc14e065b0067dE91534e032868f5Ac6ecf2c6868','0x82aF49447D8a07e3bd95BD0d56f35241523fBab1','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x0CCB4fAa6f1F1B30911619f1184082aB4E25813c'],//a
        [ 9,'0xa9004A5421372E1D83fB1f85b0fc986c912f91f3','0xa9004A5421372E1D83fB1f85b0fc986c912f91f3','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x2d340912Aa47e33c90Efb078e69E70EFe2B34b9B'],//a
        [10,'0x1FF7F3EFBb9481Cbd7db4F932cBCD4467144237C','0x82aF49447D8a07e3bd95BD0d56f35241523fBab1','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x63Dc80EE90F26363B3FCD609007CC9e14c8991BE'],//a
        [11,'0x7D7F1765aCbaF847b9A1f7137FE8Ed4931FbfEbA','0x82aF49447D8a07e3bd95BD0d56f35241523fBab1','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x248C35760068cE009a13076D573ed3497A47bCD4'],//a
        [12,'0xba5DdD1f9d7F570dc94a51479a000E3BCE967196','0xba5DdD1f9d7F570dc94a51479a000E3BCE967196','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x1CbBa6346F110c8A5ea739ef2d1eb182990e4EB2'],//a
        [13,'0x565609fAF65B92F7be02468acF86f8979423e514','0x565609fAF65B92F7be02468acF86f8979423e514','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x7BbBf946883a5701350007320F525c5379B8178A'],//a
        [14,'0xaC800FD6159c2a2CB8fC31EF74621eB430287a5A','0xaC800FD6159c2a2CB8fC31EF74621eB430287a5A','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0x4fDd333FF9cA409df583f306B6F5a7fFdE790739'],//a
        [15,'0x0000000000000000000000000000000000000000','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9','0xB686BcB112660343E6d15BDb65297e110C8311c4'],//a
        [16,'0x0000000000000000000000000000000000000000','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8','0x9C2433dFD71096C435Be9465220BB2B189375eA7'],//a
        [17,'0x0000000000000000000000000000000000000000','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1','0xe2fEDb9e6139a182B98e7C2688ccFa3e9A53c665'],//a
        [18,'0xB46A094Bc4B0adBD801E14b9DB95e05E28962764','0x82aF49447D8a07e3bd95BD0d56f35241523fBab1','0xaf88d065e77c8cC2239327C5EDb3A432268e5831','0xD9535bB5f58A1a75032416F2dFe7880C30575a41'] //a
    ]
    const network =networkNames.arbitrumOne

    const pools:gmxPool[] = []
    let i = 0
    for (const pool of importedPools){
        const poolToAdd:gmxPool = {
            poolId: pool[0] as number,
            indexToken: getTokenFromAddress(network,pool[1] as string),
            longToken: getTokenFromAddress(network,pool[2] as string),
            shortToken: getTokenFromAddress(network,pool[3] as string),
            marketToken: getTokenFromAddress(network,pool[4] as string)
        }
        pools.push(poolToAdd)
    }
    return pools
}
let pools:gmxPool[] = getOriginalPools()

export const arbitrumOneNetworkConfig: NetworkInfo = {
    networkName: networkNames.arbitrumOne,
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
    theseusVaultInfo:{
        name: 'theseusVault',
        //TODO: update addresses
        treasuryAddress: '0xa3D6360C288551600B20A7992860766F9754e477',
        multiSigOwnerAddress: '0xa3D6360C288551600B20A7992860766F9754e477',
        vaultMasterAddress: '0xa3D6360C288551600B20A7992860766F9754e477',
        vaultAdminAddress: '0xa3D6360C288551600B20A7992860766F9754e477',
        protocolFeePercentage: 1000,
        version: 1,
        vaultPlugins: new Map<string, vaultPlugin>([
            [
                pluginNames.gmx.name,
                {
                    pluginId: pluginNames.gmx.id,
                    pluginName: pluginNames.gmx.name,
                    pluginContractName: contractNames.Vaults.Theseus.GmxPlugin,
                    vaultInfo: getGMXVaultInfo(networkNames.arbitrumOne),
                    params:{
                        uiFeeReceiverAddress: '0xa3D6360C288551600B20A7992860766F9754e477',
                        callbackGasLimit: 2000000,
                        executionFee: '0.005',
                        shouldUnwrapNativeToken: false,
                        //keccak256(abi.encode("MAX_PNL_FACTOR_FOR_TRADERS"));
                        pnlFactorType: '0xab15365d3aa743e766355e2557c230d8f943e195dc84d9b2b05928a07b635ee1'
                    },
                    pools: [
                        ...pools
                    ],
                    executionDepositFee: 0,
                    executionWithdrawFee: 0,
                } as gmxPluginInfo
            ]
        ])
    },
    testNet: false,
    autoVerify: true,
};