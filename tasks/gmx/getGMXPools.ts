import { GmxUtils } from '../../utils/gmxUtils';

import hre from 'hardhat';

async function main() {

    const pools = (await new GmxUtils(hre.network.name).getPools()).map(pool => {
        pool.indexToken.address,
        pool.longToken.address,
        pool.shortToken.address,
        pool.marketToken.address    
    });
    
    console.log(pools);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });