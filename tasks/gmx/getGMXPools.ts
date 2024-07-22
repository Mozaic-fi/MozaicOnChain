import { GmxUtils } from '../../utils/gmxUtils';
import { networkConfigs } from '../../utils/networkConfigs';
import { tokenSymbols } from '../../utils/names/tokenSymbols';

import hre from 'hardhat';
import { gmxPluginInfo, gmxPool } from '../../utils/vaultPlugins/gmxVaultPlugins';

async function main() {
    getPoolByTokenSymbol(getConfigPools(), tokenSymbols.USDC);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });

function getConfigPools(): gmxPool[]{
    return (networkConfigs.get(hre.network.name)?.theseusVaultInfo?.vaultPlugins.get('gmx') as gmxPluginInfo).pools;
}

async function getContractPools(): Promise<gmxPool[]> {
    return (await new GmxUtils(hre.network.name).getPools());
}

function comparePools(allpools: gmxPool[], contractPools: gmxPool[]) {
    for (let pool of contractPools) {
        if (allpools.some(p => p.indexToken.address === pool.indexToken.address
            && p.longToken.address === pool.longToken.address
            && p.shortToken.address === pool.shortToken.address
            && p.marketToken.address === pool.marketToken.address)) {
            console.log('Pool found:', [pool.poolId, pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address]);
        }
        else {
            console.error('Pool not found:', [pool.poolId, pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address]);
        }
    }
}

function getSpecificPoolData(pool: gmxPool, poolAddress :string='0xD9535bB5f58A1a75032416F2dFe7880C30575a41') {
    if (pool.marketToken.address === poolAddress) {
        console.log('Pool found:', [pool.poolId, pool.indexToken.address, pool.longToken.address, pool.shortToken.address, pool.marketToken.address]);
    }
}

function getPoolByTokenSymbol(allpools: gmxPool[], tokenSymbol: string) {
    for(let pool of allpools){
        const p = pool;
        if (p.indexToken.symbol === tokenSymbol || p.longToken.symbol === tokenSymbol || p.shortToken.symbol === tokenSymbol) {
            console.log({
                poolId: pool.poolId,
                indexToken: `${pool.indexToken.symbol}: ${pool.indexToken.address}`,
                longToken: `${pool.longToken.symbol}: ${pool.longToken.address}`,
                shortToken: `${pool.shortToken.symbol}: ${pool.shortToken.address}`,
                marketToken: pool.marketToken.address
            });
            console.log('-------------------------------')
        }
        else {
            console.error('Pool not found:', tokenSymbol);
        }
    }
}
