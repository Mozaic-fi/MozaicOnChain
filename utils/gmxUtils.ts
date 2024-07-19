import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

import { getTokenFromAddress } from './vaultTokens';
import { gmxPool } from './vaultPlugins/gmxVaultPlugins';
import {getNetworkName, networkNames} from './names/networkNames'

interface DeploymentInfo {
    address: string;
    abi: any[];
}

export enum gmxContracts {
    dataStore = 'DataStore',
    reader = 'Reader',
    depositHandler = 'DepositHandler',
    depositVault = 'DepositVault',
    orderHandler = 'OrderHandler',
    orderVault = 'OrderVault',
    withdrawalHandler = 'WithdrawalHandler',
    withdrawalVault = 'WithdrawalVault',
    exchangeRouter = 'ExchangeRouter',
    router = 'Router'
}

export class GmxUtils {
    private deploymentPath: string;
    private networkName: networkNames;   

    constructor(networkName: string) {
        if(networkName == networkNames.arbitrumTwo) networkName = networkNames.arbitrumOne;
        this.networkName = getNetworkName(networkName);
        this.deploymentPath = path.join(process.cwd(), 'deployments', 'gmx','v2.1',networkName);
    }

    private loadDeploymentInfo(fileName: string): DeploymentInfo {
        const filePath = path.join(this.deploymentPath, `${fileName}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent) as DeploymentInfo;
    }

    getContractAddress(contractName: gmxContracts): string {
        return this.loadDeploymentInfo(contractName).address;
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
                indexToken: getTokenFromAddress(this.networkName ,market.indexToken),
                longToken: getTokenFromAddress(this.networkName ,market.longToken),
                shortToken: getTokenFromAddress(this.networkName ,market.shortToken),
                marketToken: getTokenFromAddress(this.networkName ,market.marketToken),
            })
        }
        return pools;
    }
}