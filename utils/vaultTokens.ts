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
    }
    // a constructor to build more vault tokens based on existing ones, this should accept a vault token and read the 3 base properties vaules from and then read other values from the user
    public static fromVaultToken(vaultToken: VaultToken): VaultToken {
        const newToken = new VaultToken(vaultToken.name, vaultToken.symbol, vaultToken.decimals!)
        newToken.address = vaultToken.address
        newToken.priceFeedAddress = vaultToken.priceFeedAddress
        newToken.heartBeatDuration = vaultToken.heartBeatDuration
        newToken.acceptedInVault = vaultToken.acceptedInVault
        newToken.depositAllowed = vaultToken.depositAllowed
        newToken.network = vaultToken.network
        return newToken
    }
}

const BaseTokens: VaultToken[] = [
    new VaultToken('Tether USD', tokenSymbols.USDT, 6),
    new VaultToken('USD Coin', tokenSymbols.USDC, 6),
    new VaultToken('Bridged USDC', tokenSymbols.USDCe, 6),
    new VaultToken('USD Coin', tokenSymbols.USDC, 6),
    new VaultToken('USD Coin', tokenSymbols.USDC, 6),
]
const vaultTokens: VaultToken[] = []

const arbitrumOneTokens: VaultToken[] = [
    {
        name: 'USD Coin',
        symbol: tokenSymbols.USDC,
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        decimals: 6,
        priceFeedAddress: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
        heartBeatDuration: 86400,
        acceptedInVault: true,
        depositAllowed: true,
        network: networkNames.arbitrumOne
    }
]
vaultTokens.push(...arbitrumOneTokens)
const arbitrumSepoliaTokens: VaultToken[] = [
    {
        name: 'USD Coin',
        symbol: tokenSymbols.USDC,
        address: '0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1',
        decimals: 6,
        priceFeedAddress: '0x0153002d20B96532C639313c2d54c3dA09109309',
        heartBeatDuration: 86400,
        acceptedInVault: true,
        depositAllowed: true,
        network: networkNames.arbitrumSepolia
    }
]
vaultTokens.push(...arbitrumSepoliaTokens)

const avalancheFujiTokens: VaultToken[] = [
    {
        name: 'USD Coin',
        symbol: tokenSymbols.USDC,
        address: '0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1',
        decimals: 6,
        priceFeedAddress: '0x0153002d20B96532C639313c2d54c3dA09109309',
        heartBeatDuration: 86400,
        acceptedInVault: true,
        depositAllowed: true,
        network: networkNames.arbitrumSepolia
    }
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