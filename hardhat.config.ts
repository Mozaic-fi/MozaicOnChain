import 'dotenv/config'

import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import '@nomicfoundation/hardhat-verify'


import { EndpointId } from '@layerzerolabs/lz-definitions'

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY


const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY
const SEPOLIA_ARBISCAN_API_KEY = process.env.SEPOLIA_ARBISCAN_API_KEY
const SEPOLIA_BASESCAN_API_KEY = process.env.SEPOLIA_BASESCAN_API_KEY
const SEPOLIA_API_KEY = process.env.SEPOLIA_API_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = [PRIVATE_KEY!]

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.24',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        arbitrumSepolia: {
            eid: EndpointId.ARBSEP_V2_TESTNET,
            url: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            chainId: 421614,
            accounts: accounts,
        },
        baseSepolia: {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            chainId: 84532,
            accounts: accounts,
        },
        sepolia: {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            chainId: 11155111,
            accounts: accounts,
        },
        avalancheFuji:{
            eid: EndpointId.AVALANCHE_V2_TESTNET,
            url: `https://avalanche-fuji-c-chain-rpc.publicnode.com`,
            chainId: 43113,
            accounts: accounts,
        },
        //Mainnet
        arbitrumOne: {
            eid: EndpointId.ARBITRUM_V2_MAINNET,
            url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            chainId: 42161,
            accounts: accounts,
        },
        base: {
            eid: EndpointId.BASE_V2_MAINNET,
            url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            chainId: 8453,
            accounts: accounts
        },
    },
    etherscan: {
        apiKey: {
            arbitrumSepolia: SEPOLIA_ARBISCAN_API_KEY!,
            baseSepolia: SEPOLIA_BASESCAN_API_KEY!,
            sepolia: SEPOLIA_API_KEY!,
            arbitrumOne: ARBISCAN_API_KEY!,
            base: BASESCAN_API_KEY!,
            avalancheFuji:'avascan'
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
}

export default config
