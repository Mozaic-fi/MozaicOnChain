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
    private static tokens: VaultToken[]
    constructor(name: string, symbol: tokenSymbols, decimals?: number) {
        this.name = name
        this.symbol = symbol
        this.decimals = decimals
        this.address = ''
        this.priceFeedAddress = ''
        this.heartBeatDuration = 0
        this.acceptedInVault = false
        this.depositAllowed = false
        this.network = networkNames.arbitrumOne
        VaultToken.tokens.push(this)
    }
    public static fromVaultToken(symbol: tokenSymbols,address: string,
            priceFeedAddress: string,heartBeatDuration: number,acceptedInVault: boolean,depositAllowed: boolean,network: networkNames): VaultToken 
        {
        const token = VaultToken.tokens.find(token => token.symbol === symbol)!
        const newToken = new VaultToken(token.name, token.symbol, token.decimals)
        newToken.address = address
        newToken.priceFeedAddress = priceFeedAddress
        newToken.heartBeatDuration = heartBeatDuration
        newToken.acceptedInVault = acceptedInVault
        newToken.depositAllowed = depositAllowed
        newToken.network = network
        return newToken
    }
}

new VaultToken('Tether USD', tokenSymbols.USDT, 6)
new VaultToken('USD Coin', tokenSymbols.USDC, 6)
new VaultToken('Bridged USDC', tokenSymbols.USDCe, 6)
new VaultToken('Dai Stablecoin', tokenSymbols.DAI, 18)
new VaultToken('Wrapped BTC', tokenSymbols.WBTC, 8)
new VaultToken('Wrapped ETH', tokenSymbols.WETH, 18)
new VaultToken('Wrapped AVAX', tokenSymbols.WAVAX, 8)

const vaultTokens: VaultToken[] = []

const arbitrumOneTokens: VaultToken[] = [
    VaultToken.fromVaultToken(tokenSymbols.USDC, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3', 86400, true, true, networkNames.arbitrumOne)
]

vaultTokens.push(...arbitrumOneTokens)
const arbitrumSepoliaTokens: VaultToken[] = [
    VaultToken.fromVaultToken(tokenSymbols.USDC, '0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1', '0x0153002d20B96532C639313c2d54c3dA09109309', 86400, true, true, networkNames.arbitrumSepolia)
]
vaultTokens.push(...arbitrumSepoliaTokens)

const avalancheFujiTokens: VaultToken[] = [
    VaultToken.fromVaultToken(tokenSymbols.USDC, '0x3eBDeaA0DB3FfDe96E7a0DBBAFEC961FC50F725F', '0x97FE42a7E96640D932bbc0e1580c73E705A8EB73', 86400, true, true, networkNames.avalancheFuji),
    VaultToken.fromVaultToken(tokenSymbols.USDT, '0x50df4892Bd13f01E4e1Cd077ff394A8fa1A3fD7c', '0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad', 86400, true, true, networkNames.avalancheFuji),
    VaultToken.fromVaultToken(tokenSymbols.WBTC, '0x3Bd8e00c25B12E6E60fc8B6f1E1E2236102073Ca', '0x31CF013A08c6Ac228C94551d535d5BAfE19c602a', 86400, true, true, networkNames.avalancheFuji),
    VaultToken.fromVaultToken(tokenSymbols.WAVAX, '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3', '0x5498BB86BC934c8D34FDA08E81D444153d0D06aD', 600, true, true, networkNames.avalancheFuji),
]

export const getTokens = (network: networkNames): VaultToken[] => {
    return vaultTokens.filter(token => token.network === network)
}
export const getToken = (symbol: tokenSymbols, network: networkNames): VaultToken => {
    return vaultTokens.find(token => token.symbol === symbol && token.network === network)!
}


// -----Decoded View---------------
// Arg [0] : tokenAddresses (address[]): 0xaf88d065e77c8cC2239327C5EDb3A432268e5831,0x82aF49447D8a07e3bd95BD0d56f35241523fBab1,0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07,0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0,0xf97f4df75117a78c1A5a0DBb814Af92458539FB4,0x912CE59144191C1204E64559FE8253a0e49E6548
// Arg [1] : priceFeedAddresses (address[]): 0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3,0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612,0x24ceA4b8ce57cdA5058b924B9B9987992450590c,0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720,0x86E53CF1B870786351Da77A57575e79CB55812CB,0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6
// Arg [2] : heartbeatDurations (uint256[]): 86400,86400,86400,86400,3600,86400