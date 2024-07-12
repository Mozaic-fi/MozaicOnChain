import { EndpointId } from '@layerzerolabs/lz-definitions'
import { contractNames } from './utils/contractNames'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';

//Testnet
const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: contractNames.Tokens.MozToken,
}

const arbitrumSepoliaContract: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: contractNames.Tokens.MozTokenAdapter,
    
}

const baseSepoliaContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: contractNames.Tokens.MozToken
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: sepoliaContract,
        },
        {
            contract: arbitrumSepoliaContract,       
        },
        {
            contract: baseSepoliaContract,
        }
    ],
    connections: [
        {
            from: sepoliaContract,
            to: arbitrumSepoliaContract,
            config:{
                enforcedOptions:[
                    {
                        msgType: 1,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 100000,
                        value: 0,
                    }
                ]          
            }
        },
        {
            from: sepoliaContract,
            to: baseSepoliaContract,
            config:{
                enforcedOptions:[
                    {
                        msgType: 1,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 100000,
                        value: 0,
                    }
                ]          
            }
        },
        {
            from: arbitrumSepoliaContract,
            to: sepoliaContract,
            config:{
                enforcedOptions:[
                    {
                        msgType: 1,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 100000,
                        value: 0,
                    }
                ]          
            }
        },
        {
            from: arbitrumSepoliaContract,
            to: baseSepoliaContract,
            config:{
                enforcedOptions:[
                    {
                        msgType: 1,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 100000,
                        value: 0,
                    }
                ]          
            }
        },
        {
            from: baseSepoliaContract,
            to: sepoliaContract,
            config:{
                enforcedOptions:[
                    {
                        msgType: 1,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 100000,
                        value: 0,
                    }
                ]          
            }
        },
        {
            from: baseSepoliaContract,
            to: arbitrumSepoliaContract,
            config:{
                enforcedOptions:[
                    {
                        msgType: 1,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 100000,
                        value: 1,
                    }
                ]          
            }
        }
    ],
}

export default config