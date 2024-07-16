import { GmxUtils, gmxContracts } from '../utils/gmxUtils';

import hre from 'hardhat';

async function main() {
    console.log(await new GmxUtils(hre.network.name).getPools());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });