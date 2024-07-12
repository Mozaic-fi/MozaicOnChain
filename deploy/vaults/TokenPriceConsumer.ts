import {networkConfigs, networkNames} from '../../utils/networkConfigs'
import {pluginNames} from '../../utils/vaultPlugins'
import {DeploymentUtils} from '../../utils/deploymentUtils'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'TokenPriceConsumer'

const deploy: DeployFunction = async (hre) => {

    let networkConfig = networkConfigs.get(hre.network.name)
}

deploy.tags = [contractName]

export default deploy