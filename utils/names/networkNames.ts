export enum networkNames {
    arbitrumSepolia = 'arbitrumSepolia',
    baseSepolia = 'baseSepolia',
    sepolia = 'sepolia',
    arbitrumOne = 'arbitrumOne',
    base = 'base',
    avalancheFuji = 'avalancheFuji',
    arbitrumTwo = 'arbitrumTwo',
}

export const getNetworkName = (networkName: string): networkNames => {
    return networkNames[networkName as keyof typeof networkNames];
}