import { EndpointId } from '@layerzerolabs/lz-definitions'
import { contractNames } from './utils/names/contractNames'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';

const arbitrumOneContract: OmniPointHardhat = {
    eid: EndpointId.ARBITRUM_V2_MAINNET,
    contractName: contractNames.Tokens.MozTokenAdapter,
}

const baseContract: OmniPointHardhat = {
    eid: EndpointId.BASE_V2_MAINNET,
    contractName: contractNames.Tokens.MozToken,
}
const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: arbitrumOneContract,
        },
        {
            contract: baseContract,
        }
    ],
    connections: [
        {
            from: arbitrumOneContract,
            to: baseContract,
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
            from: baseContract,
            to: arbitrumOneContract,
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
    ],
}

export default config
