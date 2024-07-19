import { networkNames } from './names/networkNames'
import { tokenSymbols } from './names/tokenSymbols'

export class VaultToken {
    public name: string
    public symbol: tokenSymbols
    public address: string
    public decimals?: number
    public priceFeedAddress: string
    public heartBeatDuration: number
    public sequencerStatusReportedAddress?: string  
    public acceptedInVault: boolean
    public depositAllowed: boolean
    public network: networkNames
    public synthetic: boolean

    constructor(name: string, symbol: tokenSymbols, decimals?: number, synthetic: boolean = false) {
        this.name = name
        this.symbol = symbol
        this.decimals = decimals
        this.synthetic = synthetic
        this.address = ''
        this.priceFeedAddress = ''
        this.heartBeatDuration = 0
        this.acceptedInVault = false
        this.depositAllowed = false
        this.network = networkNames.arbitrumOne
    }

    public static fromAddress(address: string, network: networkNames): VaultToken {
        const newToken = new VaultToken('', tokenSymbols.None)
        newToken.address = address
        newToken.network = network
        return newToken
    }
    public static fromVaultToken(tokens:  VaultToken[],symbol: tokenSymbols,address: string,
            priceFeedAddress: string,heartBeatDuration: number,acceptedInVault: boolean,depositAllowed: boolean,network: networkNames): VaultToken 
        {
        const token = tokens.find(token => token.symbol === symbol)!
        const newToken = new VaultToken(token.name, token.symbol, token.decimals, token.synthetic)
        newToken.address = address
        newToken.priceFeedAddress = priceFeedAddress
        newToken.heartBeatDuration = heartBeatDuration
        newToken.acceptedInVault = token.synthetic ? false: acceptedInVault
        newToken.depositAllowed = token.synthetic ? false: depositAllowed
        newToken.network = network
        return newToken
    }

    public static fromVaultToken2(token: VaultToken, network: networkNames) : VaultToken{
        const newToken = new VaultToken(token.name, token.symbol, token.decimals, token.synthetic)
        newToken.address = token.address
        newToken.priceFeedAddress = token.priceFeedAddress
        newToken.heartBeatDuration = token.heartBeatDuration
        newToken.acceptedInVault = token.acceptedInVault
        newToken.depositAllowed = token.depositAllowed
        newToken.network = network
        return newToken
    }
}

const baseTokens: VaultToken[] =Array.from(new Set<VaultToken>([
    new VaultToken('ZERO Address', tokenSymbols.ZERO, 0)
    , new VaultToken('Tether USD', tokenSymbols.USDT, 6)
    , new VaultToken('USD Coin', tokenSymbols.USDC, 6)
    , new VaultToken('Bridged USDC', tokenSymbols.USDCe, 6)
    , new VaultToken('Dai Stablecoin', tokenSymbols.DAI, 18)
    , new VaultToken('Wrapped BTC', tokenSymbols.WBTC, 8)
    , new VaultToken('BTC', tokenSymbols.BTC, 8, true)
    , new VaultToken('Wrapped ETH', tokenSymbols.WETH, 18)
    , new VaultToken('Wrapped AVAX', tokenSymbols.WAVAX, 8)
    , new VaultToken('GMX Market', tokenSymbols.GMToken, 18)
    , new VaultToken('DOGE', tokenSymbols.DOGE, 8, true)
    , new VaultToken('Wrapped SOL', tokenSymbols.SOL, 9)
    , new VaultToken('Uniswap', tokenSymbols.UNI, 18)
    , new VaultToken('ChainLink Token', tokenSymbols.LINK, 18)
    , new VaultToken('Arbitrum', tokenSymbols.ARB, 18)
    , new VaultToken('XRP', tokenSymbols.XRP, 6, true)
    , new VaultToken('Wrapped BNB', tokenSymbols.WBNB, 18)
    , new VaultToken('Aave Token', tokenSymbols.AAVE, 18)
    , new VaultToken('Optimism', tokenSymbols.OP, 18)
    , new VaultToken('GMX', tokenSymbols.GMX, 18)
    , new VaultToken('Pepe', tokenSymbols.PEPE, 18)
]))

const vaultTokens: VaultToken[] = [
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.ZERO, '0x0000000000000000000000000000000000000000', '', 0, false, false, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.ZERO, '0x0000000000000000000000000000000000000000', '', 0, false, false, networkNames.avalancheFuji),
]

const arbitrumOneTokens: VaultToken[] = [
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.BTC, '0x47904963fc8b2340414262125aF798B9655E58Cd', '0x6ce185860a4963106506C203335A2910413708e9', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.WBTC, '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', '0x6ce185860a4963106506C203335A2910413708e9', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.USDC, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.WETH, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.DOGE, '0xC4da4c24fd591125c3F47b340b6f4f76111883d8', '0x9A7FB1b3950837a8D9b40517626E11D4127C098C', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.SOL, '0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07', '0x24ceA4b8ce57cdA5058b924B9B9987992450590c', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.UNI, '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', '0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.LINK, '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', '0x86E53CF1B870786351Da77A57575e79CB55812CB', 3600, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.ARB, '0x912CE59144191C1204E64559FE8253a0e49E6548', '0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.USDCe, '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3', 86400, false, false, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.USDT, '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.DAI, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.XRP, '0xc14e065b0067dE91534e032868f5Ac6ecf2c6868', '0xB4AD57B52aB9141de9926a3e0C8dc6264c2ef205', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.WBNB, '0xa9004A5421372E1D83fB1f85b0fc986c912f91f3', '0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.AAVE, '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196', '0xaD1d5344AaDE45F43E596773Bcc4c423EAbdD034', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.WAVAX, '0x565609fAF65B92F7be02468acF86f8979423e514', '0x8bf61728eeDCE2F32c456454d87B5d6eD6150208', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.OP, '0xaC800FD6159c2a2CB8fC31EF74621eB430287a5A', '0x205aaD468a11fd5D34fA7211bC6Bad5b3deB9b98', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMX, '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', '0xDB98056FecFff59D032aB628337A4887110df3dB', 86400, true, true, networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.PEPE, '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00', '0x02DEd5a7EDDA750E3Eb240b54437a54d57b74dBE', 3600, true, true, networkNames.arbitrumOne),
    //GM market tokens
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x47c031236e19d024b42f8AE6780E44A573170703','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x70d95587d40A2caf56bd97485aB3Eec10Bee6336','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x09400D9DB990D5ed3f35D7be61DfAEB900Af03C9','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0xD9535bB5f58A1a75032416F2dFe7880C30575a41','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0xc7Abb2C5f3BF3CEB389dF0Eecd6120D451170B50','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x7f1fa204bb700853D36994DA19F830b6Ad18455C','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x9C2433dFD71096C435Be9465220BB2B189375eA7','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0xB686BcB112660343E6d15BDb65297e110C8311c4','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0xe2fEDb9e6139a182B98e7C2688ccFa3e9A53c665','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x0CCB4fAa6f1F1B30911619f1184082aB4E25813c','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x2d340912Aa47e33c90Efb078e69E70EFe2B34b9B','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x1CbBa6346F110c8A5ea739ef2d1eb182990e4EB2','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x248C35760068cE009a13076D573ed3497A47bCD4','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x63Dc80EE90F26363B3FCD609007CC9e14c8991BE','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x7BbBf946883a5701350007320F525c5379B8178A','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x4fDd333FF9cA409df583f306B6F5a7fFdE790739','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x7C11F78Ce78768518D743E81Fdfa2F860C6b9A77','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x450bb6774Dd8a756274E0ab4107953259d2ac541','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x55391D178Ce46e7AC8eaAEa50A72D1A5a8A622Da','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x2b477989A149B17073D9C9C82eC9cB03591e20c6','',0,false,false,networkNames.arbitrumOne),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x0418643F94Ef14917f1345cE5C460C37dE463ef7','',0,false,false,networkNames.arbitrumOne),
]

vaultTokens.push(...arbitrumOneTokens)

const arbitrumTwoTokens: VaultToken[] = []
for (let i =0; i< arbitrumOneTokens.length; i++){
    arbitrumTwoTokens.push(VaultToken.fromVaultToken2(arbitrumOneTokens[i], networkNames.arbitrumTwo))
}

vaultTokens.push(...arbitrumOneTokens)


const avalancheFujiTokens: VaultToken[] = [
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.USDC, '0x3eBDeaA0DB3FfDe96E7a0DBBAFEC961FC50F725F', '0x97FE42a7E96640D932bbc0e1580c73E705A8EB73', 86400, true, true, networkNames.avalancheFuji),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.USDT, '0x50df4892Bd13f01E4e1Cd077ff394A8fa1A3fD7c', '0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad', 86400, true, true, networkNames.avalancheFuji),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.WBTC, '0x3Bd8e00c25B12E6E60fc8B6f1E1E2236102073Ca', '0x31CF013A08c6Ac228C94551d535d5BAfE19c602a', 86400, true, true, networkNames.avalancheFuji),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.WAVAX, '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3', '0x5498BB86BC934c8D34FDA08E81D444153d0D06aD', 600, true, true, networkNames.avalancheFuji),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.WETH, '0x82F0b3695Ed2324e55bbD9A9554cB4192EC3a514', '0x86d67c3D38D2bCeE722E601025C25a575021c6EA', 86400, true, true, networkNames.avalancheFuji),
    //GMTokens
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0xD996ff47A1F763E1e55415BC4437c59292D1F415','',0,false,false,networkNames.avalancheFuji),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0xbf338a6C595f06B7Cfff2FA8c958d49201466374','',0,false,false,networkNames.avalancheFuji),
    VaultToken.fromVaultToken(baseTokens,tokenSymbols.GMToken,'0x79E6e0E454dE82fA98c02dB012a2A69103630B07','',0,false,false,networkNames.avalancheFuji),
]

vaultTokens.push(...avalancheFujiTokens)

export const getTokens = (network: networkNames): VaultToken[] => {
    return vaultTokens.filter(token => token.network === network)
}
export const getToken = (symbol: tokenSymbols, network: networkNames): VaultToken => {
    return vaultTokens.find(token => token.symbol === symbol && token.network === network)!
}

export const getGMXToken = (network: networkNames, address: string): VaultToken => {
    return  vaultTokens.find(token => token.symbol === tokenSymbols.GMToken && token.network === network && token.address == address)!
}


export const getTokenFromAddress = (network: networkNames, address: string) : VaultToken =>{
    const token = vaultTokens.find(token => token.network === network && token.address == address)
    if( token == undefined)
        return VaultToken.fromAddress(address,network)
    else return token

}
