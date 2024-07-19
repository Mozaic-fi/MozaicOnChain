import { GmxUtils } from '../../utils/gmxUtils';
import { cliConfirmation } from '../../utils/cliUtils';

import hre from 'hardhat';

async function main() {
    const tokens = (await new GmxUtils(hre.network.name).getPools());
    console.log(tokens);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });