import { GmxUtils } from '../../utils/gmxUtils';
import { networkConfigs } from '../../utils/networkConfigs';

import hre from 'hardhat';
import { gmxPluginInfo } from '../../utils/vaultPlugins/gmxVaultPlugins';

async function main() {

    const allpools = (networkConfigs.get(hre.network.name)?.theseusVaultInfo?.vaultPlugins.get('gmx') as gmxPluginInfo).pools;

    const contractPools = (await new GmxUtils(hre.network.name).getPools());
    
    for(let pool of contractPools){
        if(pool.marketToken.address==='0xD9535bB5f58A1a75032416F2dFe7880C30575a41'){
            console.log('Pool found:',[pool.poolId,pool.indexToken.address, pool.longToken.address, pool.shortToken.address, pool.marketToken.address])
        }
        // if(allpools.some(p => p.indexToken.address === pool.indexToken.address
        //     && p.longToken.address === pool.longToken.address
        //     && p.shortToken.address === pool.shortToken.address
        //     && p.marketToken.address === pool.marketToken.address))
        // {
        //     console.log('Pool found:',[pool.poolId,pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address])
        // }
        // else {
        //     console.error('Pool not found:', [pool.poolId,pool.indexToken.symbol, pool.longToken.symbol, pool.shortToken.symbol, pool.marketToken.address])
        // }
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });