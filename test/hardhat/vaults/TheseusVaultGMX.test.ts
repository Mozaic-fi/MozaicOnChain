import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, Contract } from 'ethers'

import hre, { ethers } from 'hardhat'
import { ContractUtils } from '../../../utils/contractUtils'
import { GmxUtils } from '../../../utils/gmxUtils'
import { NetworkInfo, networkConfigs } from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import { getToken, VaultToken, getTokenFromAddress } from '../../../utils/vaultTokens'
import { tokenSymbols } from '../../../utils/names/tokenSymbols'
import { erc20ABI } from '../../../utils/erc20ABI'
import { gmxPool } from '../../../utils/vaultPlugins/gmxVaultPlugins'
import { networkNames } from '../../../utils/names/networkNames'

describe('TheseusVault Test', () => {

  let network: NetworkInfo
  let owner: SignerWithAddress
  let master: SignerWithAddress
  let user2: SignerWithAddress
  let vault: ContractUtils
  let gmxPlugin: ContractUtils
  let gmxCallBack: ContractUtils
  let gmxUtils: GmxUtils
  let WETHToken: VaultToken
  let USDCToken: VaultToken
  let WETHPool: gmxPool
  let tokenPriceConsumer: ContractUtils
  let ethAmount01: BigNumber
  let ethAmount1: BigNumber
  let ethAmount2: BigNumber
  let ethAmount05: BigNumber
  let ethAmount001: BigNumber
  let deposit: (token: VaultToken, user: SignerWithAddress) => Promise<void>

  before(async () => { 
    network = networkConfigs.get(hre.network.name)!
    owner = (await hre.ethers.getSigners()).at(0)!
    master = owner
    user2 = (await hre.ethers.getSigners()).at(1)!
    vault = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.Vault)
    gmxPlugin = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxPlugin)
    gmxCallBack = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxCallback)
    tokenPriceConsumer = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.TokenPriceConsumer)
    gmxUtils = new GmxUtils(network.networkName)
    WETHToken = getToken(tokenSymbols.WETH,network.networkName)
    USDCToken = getToken(tokenSymbols.USDC,network.networkName)
    ethAmount01 = ethers.utils.parseEther('0.1'); // 0.1 Ether
    ethAmount1 = ethers.utils.parseEther('1'); // 1 Ether
    ethAmount2 = ethers.utils.parseEther('2'); // 2 Ether
    ethAmount05 = ethers.utils.parseEther('0.5'); // 0.5 Ether
    ethAmount001 = ethers.utils.parseEther('0.001'); // 0.001 Ether

    //fuji or arbi
    let gmxaddress= network.networkName===networkNames.avalancheFuji? '0xbf338a6C595f06B7Cfff2FA8c958d49201466374':'0x70d95587d40A2caf56bd97485aB3Eec10Bee6336'
    WETHPool = {
        poolId: 2,
        indexToken: getToken(tokenSymbols.WETH,network.networkName),
        longToken: getToken(tokenSymbols.WETH,network.networkName),
        shortToken: getToken(tokenSymbols.USDC,network.networkName),
        marketToken: getTokenFromAddress(network.networkName,gmxaddress)
    }

    deposit = async (token: VaultToken, user: SignerWithAddress)=>{
      const tokenContract = await hre.ethers.getContractAt(erc20ABI,token.address)
      let pluginBalance = await ethers.provider.getBalance(gmxPlugin.contractAddress)
      if(pluginBalance.lt(ethAmount05)){
        //console.log('funding the gmx plugin')
        await owner.sendTransaction({
            to: gmxPlugin.contractAddress,
            value: ethAmount2,
        });
      }
    
      const amount = ethers.utils.parseUnits('100', token.decimals)
      await tokenContract.connect(user).mint(user.address, amount)
      await tokenContract.connect(user).approve(vault.contractAddress, amount)
      //console.log('waiting for 3 seconds')
      await sleep(1000)
      //console.log('checking approval')
      expect(amount.eq(await tokenContract.allowance(user.address, vault.contractAddress)), 'token approval failed').to.be.equal(true)
      const vaultContract = await  vault.getDeployedContract()
      const minGMAmount = ethers.utils.parseEther("0");
      const payload = ethers.utils.defaultAbiCoder.encode(['uint256'], [minGMAmount]);
      expect(await vaultContract.getVaultStatus(), 'vault closed').to.be.equal(true);
      expect(await vaultContract.isDepositAllowedToken(token.address), 'cant deposit this token').to.be.equal(true);
      let lpTokenBalanceBefore = await vaultContract.balanceOf(user.address);
      const tx = await vaultContract.connect(user).addDepositRequest(token.address, amount, user.address, payload, {value: ethAmount001, gasLimit: 5000000} )
    
      //console.log('waiting for 10 seconds')
      await sleep(10000)
      //console.log('calling balanceOf')
      let lpTokenBalanceAfter = await vaultContract.balanceOf(user.address);
      let lpTokenBalance = lpTokenBalanceAfter.sub(lpTokenBalanceBefore)
      //console.log('calling calculateTokenValueInUsd')
      let usdAmount = await vaultContract.calculateTokenValueInUsd(token.address, amount)
      //console.log('calling convertAssetToLP')
      const expectedLP = await vaultContract.convertAssetToLP(usdAmount)
      expect(ethers.utils.parseUnits('1', token.decimals).gt(Math.abs(lpTokenBalance.sub(expectedLP))), 'wrong LP amount').to.be.eq(true);
    }
  }) 

  it('user should be able to deposit USDC', async () => { 
    console.log('depositing USDC')
    await deposit(USDCToken, owner)
    console.log('depositing USDC successful')
  })

  it('user should be able to deposit WETH', async () => { 
    await sleep(3000)
    console.log('depositing WETH')
    await deposit(WETHToken, user2)
    console.log('depositing WETH successful')
  })


})

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}