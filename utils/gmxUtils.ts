import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

import { VaultToken, getTokenFromAddress } from './vaultTokens';
import { gmxPool } from './vaultPlugins/gmxVaultPlugins';
import { NetworkInfo, networkConfigs } from './networkConfigs';

interface DeploymentInfo {
    address: string;
    abi: any[];
}

export enum gmxContracts {
    dataStore = 'DataStore',
    reader = 'Reader',
}

export class GmxUtils {
    private deploymentPath: string;
    private networkInfo: NetworkInfo;   

    constructor(networkName: string) {
        this.networkInfo = networkConfigs.get(networkName)!;
        this.deploymentPath = path.join(process.cwd(), 'deployments', 'gmx','v2.1',networkName);
    }

    private loadDeploymentInfo(fileName: string): DeploymentInfo {
        const filePath = path.join(this.deploymentPath, `${fileName}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent) as DeploymentInfo;
    }

    async callContractFunction(
        contractName: gmxContracts, 
        functionName: string, 
        ...args: any[]
    ): Promise<any> {
        const deploymentInfo = this.loadDeploymentInfo(contractName);
        const contract = await ethers.getContractAt(deploymentInfo.abi, deploymentInfo.address)

        if (!(functionName in contract.functions)) {
            throw new Error(`Function ${functionName} not found in contract ${contractName}`);
        }

        return await contract[functionName](...args);
    }

    async getPools(): Promise<gmxPool[]> {
        const dataStore = this.loadDeploymentInfo(gmxContracts.dataStore);
        const markets = await this.callContractFunction(gmxContracts.reader, 'getMarkets', dataStore.address, 0, 1000);
        const pools:gmxPool[] = [];
        for (const market of markets) {
            pools.push({
                poolId: -1,
                indexToken: getTokenFromAddress(this.networkInfo.networkName ,market.indexToken),
                longToken: getTokenFromAddress(this.networkInfo.networkName ,market.longToken),
                shortToken: getTokenFromAddress(this.networkInfo.networkName ,market.shortToken),
                marketToken: getTokenFromAddress(this.networkInfo.networkName ,market.marketToken),
            })
        }
        return pools;
    }
}