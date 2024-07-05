export type NetworkInfo = {
    networkName: string
    chainId: number
    layerZeroEndpointV1: string
    layerZeroEndpointV2: string
    layerZeroEIDV1: number
    layerZeroEIDV2: number
    treasuryAddress: string
    testNet: boolean
    firstDeployment: boolean,
    requireAdapter: boolean,
    mozTokenContractAddress?: string,
    xMozTokenContractAddress?: string,
    mozStakingContractAddress?: string,
    multiSigDeployer: boolean
}
export const networkConfigs = new Map<string, NetworkInfo>([
    [
        'arbitrumSepolia',
        {
            networkName: 'arbitrumSepolia',
            chainId: 421614,
            layerZeroEndpointV1: '0x6098e96a28E02f27B1e6BD381f870F1C8Bd169d3',
            layerZeroEIDV1: 10231,
            layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            layerZeroEIDV2: 40231,
            treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
            testNet: true,
            firstDeployment: true,
            requireAdapter: true,
            mozTokenContractAddress: '0x14E425DB3B55174E51926474b31983F45aA98f4b',
            xMozTokenContractAddress: '0x565a953d1CdfdB7958099AEaF346e5516bc0D907',
            mozStakingContractAddress: '0xf695C44b03Ac7cf0E1B19CC5B803Cb759Ca7a640',
            multiSigDeployer: false
        },
    ],
    [
        'baseSepolia',
        {
            networkName: 'baseSepolia',
            chainId: 84532,
            layerZeroEndpointV1: '0x55370E0fBB5f5b8dAeD978BA1c075a499eB107B8',
            layerZeroEIDV1: 10245,
            layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            layerZeroEIDV2: 40245,
            treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
            testNet: true,
            firstDeployment: false,
            requireAdapter: false,
            multiSigDeployer: true
        },
    ],
    [
        'sepolia',
        {
            networkName: 'sepolia',
            chainId: 11155111,
            layerZeroEndpointV1: '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
            layerZeroEIDV1: 10161,
            layerZeroEndpointV2: '0x6EDCE65403992e310A62460808c4b910D972f10f',
            layerZeroEIDV2: 40161,
            treasuryAddress: '0x7E9BA79614FeC2C52e85842502df66A6dB107fde',
            testNet: true,
            firstDeployment: false,
            requireAdapter: false,
            multiSigDeployer: true
        },
    ],
    [
        'arbitrumOne',
        {
            networkName: 'arbitrumOne',
            chainId: 42161,
            layerZeroEndpointV1: '0x3c2269811836af69497E5F486A85D7316753cf62',
            layerZeroEIDV1: 110,
            layerZeroEndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
            layerZeroEIDV2: 30110,
            treasuryAddress: '0x0000000000000000000000000000000000000000',
            testNet: false,
            firstDeployment: true,
            requireAdapter: true,
            mozTokenContractAddress:'0x20547341e58fb558637fa15379c92e11f7b7f710',
            xMozTokenContractAddress:'0x288734c9d9db21C5660B6b893F513cb04B6cD2d6',
            mozStakingContractAddress:'0xe08eFb59e053a586415272c15cDF62758c698739',
            multiSigDeployer: true
        },
    ],
    [
        'base',
        {
            networkName: 'base',
            chainId: 8453,
            layerZeroEndpointV1: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
            layerZeroEIDV1: 184,
            layerZeroEndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
            layerZeroEIDV2: 30184,
            treasuryAddress: '0x05806526629efCBcd8B81b9406d6E1d13E4bA265',
            testNet: false,
            firstDeployment: false,
            requireAdapter: false,
            multiSigDeployer: true
        },
    ],
])
