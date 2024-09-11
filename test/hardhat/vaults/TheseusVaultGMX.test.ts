import axios from 'axios';
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
import { pluginNames } from '../../../utils/names/pluginNames'
import { gmxContracts } from '../../../utils/gmxUtils'

enum ActionType {
  // Action types
  Stake,
  Unstake,
  SwapTokens,
  ClaimRewards,
  CancelAction
}

const OrderType = {
  MarketSwap: 0,
  LimitSwap: 1,
  MarketIncrease: 2,
  LimitIncrease: 3,
  MarketDecrease: 4,
  LimitDecrease: 5,
  StopLossDecrease: 6,
  Liquidation: 7,
};

const DecreasePositionSwapType = {
NoSwap: 0,
SwapPnlTokenToCollateralToken: 1,
SwapCollateralTokenToPnlToken: 2,
};

describe('TheseusVault Test', () => {

  let network: NetworkInfo
  let owner: SignerWithAddress
  let master: SignerWithAddress
  let user2: SignerWithAddress
  let vault: ContractUtils
  let gmxPlugin: ContractUtils
  let gmxCallBack: ContractUtils
  let multiCallVaultMasterContract: ContractUtils
  let gmxUtils: GmxUtils
  let WETHToken: VaultToken
  let USDCToken: VaultToken
  let WBTCToken: VaultToken
  let USDTToken: VaultToken
  let WETHPool: gmxPool
  let WBTCPool: gmxPool
  let tokenPriceConsumer: ContractUtils
  let ethAmount01: BigNumber
  let ethAmount1: BigNumber
  let ethAmount2: BigNumber
  let ethAmount05: BigNumber
  let ethAmount001: BigNumber
  let gasAmount: number
  let deposit: (token: VaultToken, user: SignerWithAddress, _amount: string, _amountBack: string) => Promise<void>
  let withdraw: (token1: VaultToken, token2: VaultToken, user: SignerWithAddress, _amount: number) => Promise<void>
  let swapTokens: (tokenIn: VaultToken, tokenOut: VaultToken, _amount: string, user: SignerWithAddress, runCancelation: boolean) => Promise<void>
  let cancelOrderAction: (user: SignerWithAddress) => Promise<void>
  let reBalance: (poolOut: gmxPool, poolIn: gmxPool, _amount: string, user: SignerWithAddress) => Promise<void>
  let gmxBalanceTopUp: () => Promise<void>
  let emptyPlugin: () => Promise<void>
  
  
  before(async () => { 
    network = networkConfigs.get(hre.network.name)!
    owner = (await hre.ethers.getSigners()).at(0)!
    master = owner
    user2 = (await hre.ethers.getSigners()).at(1)!
    vault = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.Vault)
    gmxPlugin = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxPlugin)
    gmxCallBack = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxCallback)
    tokenPriceConsumer = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.TokenPriceConsumer)
    multiCallVaultMasterContract = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.MultiCallVaultMaster)
    gmxUtils = new GmxUtils(network.networkName)
    WETHToken = getToken(tokenSymbols.WETH,network.networkName)
    USDCToken = getToken(tokenSymbols.USDC,network.networkName)
    WBTCToken = getToken(tokenSymbols.WBTC,network.networkName)
    USDTToken = getToken(tokenSymbols.USDT,network.networkName)
    ethAmount01 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('0.1') : ethers.utils.parseEther('0.001'); // 0.1 Ether
    ethAmount1 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('1'): ethers.utils.parseEther('0.001'); // 1 Ether
    ethAmount2 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('2'): ethers.utils.parseEther('0.002'); // 2 Ether
    ethAmount05 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('0.5'): ethers.utils.parseEther('0.0005'); // 0.5 Ether
    ethAmount001 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('0.001'):ethers.utils.parseEther('0'); // 0.001 Ether
    gasAmount = network.networkName===networkNames.avalancheFuji?5000000: 25000000; 

    //fuji or arbi
    let wethgmxaddress= network.networkName===networkNames.avalancheFuji? '0xbf338a6C595f06B7Cfff2FA8c958d49201466374':'0x70d95587d40A2caf56bd97485aB3Eec10Bee6336'
    WETHPool = {
        poolId: 2,
        indexToken: getToken(tokenSymbols.WETH,network.networkName),
        longToken: getToken(tokenSymbols.WETH,network.networkName),
        shortToken: getToken(tokenSymbols.USDC,network.networkName),
        marketToken: getTokenFromAddress(network.networkName,wethgmxaddress)
    }

    let wbtcgmxaddress= network.networkName===networkNames.avalancheFuji? '0x79E6e0E454dE82fA98c02dB012a2A69103630B07':'0x47c031236e19d024b42f8AE6780E44A573170703'
    WBTCPool = {
        poolId: 3,
        indexToken: network.networkName===networkNames.avalancheFuji? getToken(tokenSymbols.WBTC,network.networkName): getToken(tokenSymbols.BTC,network.networkName),
        longToken: getToken(tokenSymbols.WBTC,network.networkName),
        shortToken: getToken(tokenSymbols.USDC,network.networkName),
        marketToken: getTokenFromAddress(network.networkName,wbtcgmxaddress)
    }

    deposit = async (token: VaultToken, user: SignerWithAddress, _amount: string, _amountBack: string)=>{
      const tokenContract = await hre.ethers.getContractAt(erc20ABI,token.address)
    
      const amount = ethers.utils.parseUnits(_amount, token.decimals)
      if(network.networkName==networkNames.avalancheFuji)await (await tokenContract.connect(user).mint(user.address, amount)).wait()
      await (await tokenContract.connect(user).approve(vault.contractAddress, amount)).wait()
      
      expect(amount.lte(await tokenContract.allowance(user.address, vault.contractAddress)), 'token approval failed').to.be.equal(true)

      const vaultContract = await  vault.getDeployedContract()
      expect(await vaultContract.getVaultStatus(), 'vault closed').to.be.equal(true);
      expect(await vaultContract.isDepositAllowedToken(token.address), 'cant deposit this token').to.be.equal(true);

      const minGMAmount = ethers.utils.parseEther(_amountBack);
      const payload = ethers.utils.defaultAbiCoder.encode(['uint256'], [minGMAmount]);
      let lpTokenBalanceBefore = await vaultContract.balanceOf(user.address);

      const tx = await vaultContract.connect(user).addDepositRequest(token.address, amount, user.address, payload, { gasLimit: gasAmount} )
      await tx.wait()
      await sleep(10000)

      let lpTokenBalanceAfter = await vaultContract.balanceOf(user.address);

      let lpTokenBalance = lpTokenBalanceAfter.sub(lpTokenBalanceBefore)
      let usdAmount = await vaultContract.calculateTokenValueInUsd(token.address, amount)
      const expectedLP = await vaultContract.convertAssetToLP(usdAmount)
      expect(ethers.utils.parseUnits('1', token.decimals).gt(Math.abs(lpTokenBalance.sub(expectedLP))), 'wrong LP amount').to.be.eq(true);

      if(minGMAmount.gt(0)){
        let vaultTokenBalance = await tokenContract.balanceOf(vault.contractAddress)
        expect(vaultTokenBalance.gte(amount), 'Transaction was not canceled').to.be.equal(true)
      }
    }

    withdraw = async (token1: VaultToken, token2: VaultToken, user: SignerWithAddress, _amount: number)=>{

      const vaultContract = await  vault.getDeployedContract()
      const token1Contract = await hre.ethers.getContractAt(erc20ABI,token1.address)
      const token2Contract = await hre.ethers.getContractAt(erc20ABI,token2.address)

      const userBalance1Before = await token1Contract.balanceOf(user.address)
      const userBalance2Before = await token2Contract.balanceOf(user.address)
      const lpTokenBalanceBefore = await vaultContract.balanceOf(user.address)
      const amountToWithdraw = lpTokenBalanceBefore.div(_amount)


      await (await vaultContract.connect(user).approve(vault.contractAddress, amountToWithdraw)).wait()
      const payload = ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256'],[0, 0]);

      const tx = await vaultContract.connect(user).addWithdrawalRequest(amountToWithdraw,1, WETHPool.poolId, user.address, payload, {value: ethAmount001, gasLimit: gasAmount})
      await tx.wait()

      await sleep(10000)

      const userBalance1After = await token1Contract.balanceOf(user.address)
      const userBalance2After = await token2Contract.balanceOf(user.address)
      const lpTokenBalanceAfter = await vaultContract.balanceOf(user.address);


      expect(userBalance1After.gt(userBalance1Before), 'withdraw failed balance1').to.be.equal(true);
      expect(userBalance2After.gt(userBalance2Before), 'withdraw failed balance2').to.be.equal(true);
      expect(lpTokenBalanceAfter.lt(lpTokenBalanceBefore), 'withdraw failed lp').to.be.equal(true);
    }

    swapTokens = async (tokenIn: VaultToken, tokenOut: VaultToken, _amount: string, user: SignerWithAddress, runCancelation: boolean)=> {
      const tokenInContract = await hre.ethers.getContractAt(erc20ABI,tokenIn.address)
      const tokenOutContract = await hre.ethers.getContractAt(erc20ABI,tokenOut.address)
      const amount = ethers.utils.parseUnits(_amount, tokenIn.decimals)
      await (await tokenInContract.connect(user).mint(vault.contractAddress, amount)).wait()
      const usdtBalanceBefore = await tokenInContract.balanceOf(vault.contractAddress)
      expect(amount.lte(usdtBalanceBefore), 'mint failed').to.be.equal(true)
  
      
      const vaultContract = await  vault.getDeployedContract()
      await (await vaultContract.connect(user).approveTokens(pluginNames.gmx.id, [tokenIn.address], [amount])).wait()
      expect(amount.lte(await tokenInContract.allowance(vault.contractAddress, gmxPlugin.contractAddress)), 'token approval failed').to.be.equal(true)

      const wethBalanceBefore = await tokenOutContract.balanceOf(vault.contractAddress)

      const tx = await vaultContract.connect(user).execute(pluginNames.gmx.id, ActionType.SwapTokens, getGMXSwapParams(vault,tokenIn, WETHPool, amount), {gasLimit: gasAmount} )
      await tx.wait()
      if(runCancelation){
        await cancelOrderAction(user)
      } else {
        await sleep(10000)
        const usdtBalanceAfter = await tokenInContract.balanceOf(vault.contractAddress)
        const wethBalanceAfter = await tokenOutContract.balanceOf(vault.contractAddress)
        
        expect(usdtBalanceAfter.lte(usdtBalanceBefore), 'swap failed usdt').to.be.equal(true)
        expect(wethBalanceAfter.gt(wethBalanceBefore), 'swap failed weth').to.be.equal(true)
      }
    }

    cancelOrderAction = async (user: SignerWithAddress)=> {
      // let depositKeys = await gmxCallBack.getArrayValues('depositKeys')
      // let withdrawKeys = await gmxCallBack.getArrayValues('withdrawalKeys')
      let orderKeys = await gmxCallBack.getArrayValues('orderKeys')
      
      expect(orderKeys.length > 0, 'no orders to cancel').to.be.equal(true)

      const vaultContract = await  vault.getDeployedContract()

      // for(let i=0; i<depositKeys.length; i++){
      //   const payload = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes32'],[1, depositKeys[i]]);
      //   await (await gmxPluginContract.connect(user).cancelAction(payload)).wait()
      // }
      

      // for(let i=0; i<withdrawKeys.length; i++){
      //   const payload = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes32'],[1, withdrawKeys[i]]);
      //   await (await gmxPluginContract.connect(user).cancelAction(payload)).wait()
      // }
      
      for(let i=0; i<orderKeys.length; i++) {
        const payload = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes32'],[2, orderKeys[i]]);
        await (await vaultContract.connect(user).execute(pluginNames.gmx.id, ActionType.CancelAction, payload, {gasLimit: gasAmount} )).wait()
      }

      orderKeys = await gmxCallBack.getArrayValues('orderKeys')
      
      expect(orderKeys.length == 0, 'Pending Orders Canceled').to.be.equal(true)

    }

    gmxBalanceTopUp = async ()=> {
      let pluginBalance = await ethers.provider.getBalance(gmxPlugin.contractAddress)
      if(pluginBalance.lt(ethAmount1)){
        await (await owner.sendTransaction({
            to: gmxPlugin.contractAddress,
            value: ethAmount05,
        })).wait();
      }
    }

    emptyPlugin = async ()=> {
      let pluginBalance = await ethers.provider.getBalance(gmxPlugin.contractAddress)
      let pluginContract = await gmxPlugin.getDeployedContract()
      await (await pluginContract.connect(owner).withdrawFee(pluginBalance)).wait()
    }

    await gmxBalanceTopUp()
  }) 

  // describe('user should be able to deposit', async()=>{
  //   // it('USDC', async () => { 
  //   //   await deposit(USDCToken, owner, '5', '0')
  //   // })

  //   // it('Canceled-USDC', async () => { 
  //   //   await sleep(3000)
  //   //   await deposit(USDCToken, user2, '5', '100000')
  //   // })
  // })

  // describe('user should be able to withdraw', async()=>{
  //   it('USDC-WETH', async () => {
  //     await sleep(3000)
  //     await withdraw(USDCToken, WETHToken, user2, 2)
  //   })
  // })

  // describe('master should be able to swap tokens', async()=>{
  //   it('GMX: USDC-WETH', async () => {
  //     await sleep(3000)
  //     await swapTokens(USDCToken, WETHToken, '10', master, false)
  //   })
  // })

  // describe('master should be able to cancel operation', async()=>{
  //   it('Order Cancelation', async () => {
  //     await sleep(3000)
  //     await swapTokens(USDCToken, WETHToken, '10', master, true)
  //   })
  // })

  // describe('multicall admin should be able to use fallback', async()=>{
  //   it('transferExecutionFee', async () => {
  //     const functionSignature = "transferExecutionFee(uint8 _pluginId, uint256 _amount)";
  //     const values = ["1", "0"];
  //     const iface = new ethers.utils.Interface([`function ${functionSignature}`]);
  //     const data = iface.encodeFunctionData(functionSignature.split('(')[0], values);
  //     const master = await  multiCallVaultMasterContract.getDeployedContract()
  //     const tx = await owner.sendTransaction({
  //       to: master.address,
  //       data,
  //     });
  //     await tx.wait()
  //   })
  // })

  // describe('master should be able to rebalance', async()=>{
  //   // it('multicall unstake', async () => {
  //   //   const token1 = USDCToken
  //   //   const token2 = WETHToken
  //   //   const token3 = WBTCToken
  //   //   const token1Contract = await hre.ethers.getContractAt(erc20ABI,token1.address)
  //   //   const token2Contract = await hre.ethers.getContractAt(erc20ABI,token2.address)
  //   //   const token3Contract = await hre.ethers.getContractAt(erc20ABI,token3.address)
  //   //   const balance1Before = await token1Contract.balanceOf(vault.contractAddress)
  //   //   const balance2Before = await token2Contract.balanceOf(vault.contractAddress)
  //   //   const balance3Before = await token3Contract.balanceOf(vault.contractAddress)
  //   //   const market1 = await hre.ethers.getContractAt(gmxUtils.getContractAbi(gmxContracts.marketToken), WETHPool.marketToken.address)
  //   //   const market2 = await hre.ethers.getContractAt(gmxUtils.getContractAbi(gmxContracts.marketToken), WBTCPool.marketToken.address)
  //   //   const market1BalanceBefore = await market1.balanceOf(gmxPlugin.contractAddress)
  //   //   const market2BalanceBefore = await market2.balanceOf(gmxPlugin.contractAddress)
  //   //   const multicall = await multiCallVaultMasterContract.getDeployedContract()
  //   //   const basePayload = ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256'],[0, 0])
  //   //   const payloads = [ethers.utils.defaultAbiCoder.encode(['uint8', 'uint256', 'uint256', 'address', 'bytes'],[WETHPool.poolId, market1BalanceBefore.div(5), 0, vault.contractAddress, basePayload]), 
  //   //     ethers.utils.defaultAbiCoder.encode(['uint8', 'uint256', 'uint256', 'address', 'bytes'],[WBTCPool.poolId, market2BalanceBefore.div(5), 0, vault.contractAddress, basePayload])]
  //   //   await (await multicall.connect(master).executeMultiCall(pluginNames.gmx.id, ActionType.Unstake, payloads, [], {gasLimit: gasAmount})).wait()
  //   //   await sleep(10000)
  //   //   const market1BalanceAfter = await market1.balanceOf(gmxPlugin.contractAddress)
  //   //   const market2BalanceAfter = await market2.balanceOf(gmxPlugin.contractAddress)
  //   //   const balance1After = await token1Contract.balanceOf(vault.contractAddress)
  //   //   const balance2After = await token2Contract.balanceOf(vault.contractAddress)
  //   //   const balance3After = await token3Contract.balanceOf(vault.contractAddress)
  //   //   expect(market1BalanceBefore.gt(market1BalanceAfter), 'market1 unstake failed').to.be.equal(true)
  //   //   expect(market2BalanceBefore.gt(market2BalanceAfter), 'market2 unstake failed').to.be.equal(true)
  //   //   expect(balance1Before.lt(balance1After), 'balance1 unstake failed').to.be.equal(true)
  //   //   expect(balance2Before.lt(balance2After), 'balance2 unstake failed').to.be.equal(true)
  //   //   expect(balance3Before.lt(balance3After), 'balance3 unstake failed').to.be.equal(true)
      
  //   // })

  //   // it('multicall stake', async () => {
  //   //   await sleep(3000)
  //   //   const market1 = await hre.ethers.getContractAt(gmxUtils.getContractAbi(gmxContracts.marketToken), WETHPool.marketToken.address)
  //   //   const market2 = await hre.ethers.getContractAt(gmxUtils.getContractAbi(gmxContracts.marketToken), WBTCPool.marketToken.address)
  //   //   const market1BalanceBefore = await market1.balanceOf(gmxPlugin.contractAddress)
  //   //   const market2BalanceBefore = await market2.balanceOf(gmxPlugin.contractAddress)
  //   //   const token = USDCToken
  //   //   const tokenContract = await hre.ethers.getContractAt(erc20ABI,token.address)
  //   //   const balanceBefore = await tokenContract.balanceOf(vault.contractAddress)
  //   //   const multicall = await multiCallVaultMasterContract.getDeployedContract()
  //   //   const basePayload = ethers.utils.defaultAbiCoder.encode(['uint256'],[0])
  //   //   const payloads = [ethers.utils.defaultAbiCoder.encode(['uint8', 'address[]', 'uint256[]', 'bytes'],[WETHPool.poolId, [WETHPool.longToken.address, WETHPool.shortToken.address], [0, balanceBefore.div(3)], basePayload]), 
  //   //     ethers.utils.defaultAbiCoder.encode(['uint8', 'address[]', 'uint256[]', 'bytes'],[WBTCPool.poolId, [WBTCPool.longToken.address, WBTCPool.shortToken.address], [0, balanceBefore.div(3)], basePayload])]
  //   //   await (await multicall.connect(master).executeMultiCall(pluginNames.gmx.id, ActionType.Stake, payloads, [], {gasLimit: gasAmount})).wait()
  //   //   await sleep(10000)
  //   //   const market1BalanceAfter = await market1.balanceOf(gmxPlugin.contractAddress)
  //   //   const market2BalanceAfter = await market2.balanceOf(gmxPlugin.contractAddress)
  //   //   const balanceAfter = await tokenContract.balanceOf(vault.contractAddress)
  //   //   expect(market1BalanceBefore.lt(market1BalanceAfter), 'market1 unstake failed').to.be.equal(true)
  //   //   expect(market2BalanceBefore.lt(market2BalanceAfter), 'market2 unstake failed').to.be.equal(true)
  //   //   expect(balanceBefore.gt(balanceAfter), 'token stake failed').to.be.equal(true)

  //   // })

  //   // it('multicall swap lifi', async () => {
  //   //   const amount = '1000'
  //   //   const halfAmount = '500'
  //   //   const tokenIn = USDCToken
  //   //   const tokenOut1 = WETHToken
  //   //   const tokenOut2 = WBTCToken
  //   //   const tokenInContract = await hre.ethers.getContractAt(erc20ABI,tokenIn.address)
  //   //   const tokenOut1Contract = await hre.ethers.getContractAt(erc20ABI,tokenOut1.address)
  //   //   const tokenOut2Contract = await hre.ethers.getContractAt(erc20ABI,tokenOut2.address)
  //   //   await (await tokenInContract.connect(owner).mint(vault.contractAddress, amount)).wait()
  //   //   const balanceInBefore = await tokenInContract.balanceOf(vault.contractAddress)
  //   //   const balanceOut1Before = await tokenOut1Contract.balanceOf(vault.contractAddress)
  //   //   const balanceOut2Before = await tokenOut2Contract.balanceOf(vault.contractAddress)
  //   //   const quote1 = await getQuote('arb', 'arb', 'USDC', 'WETH', halfAmount, vault.contractAddress)
  //   //   const quote2 = await getQuote('arb', 'arb', 'USDC', 'WBTC', halfAmount, vault.contractAddress)
  //   //   const lifiPayload = [
  //   //     [tokenIn.address, halfAmount, 0, false, quote1],
  //   //     [tokenIn.address, halfAmount, 0, false, quote2]
  //   //   ]
  //   //   const multicall = await multiCallVaultMasterContract.getDeployedContract()
  //   //   await (await multicall.connect(master).executeMultiCall(pluginNames.gmx.id, 2, [], lifiPayload, {gasLimit: gasAmount})).wait()
  //   //   await sleep(10000)
  //   //   const balanceInAfter = await tokenInContract.balanceOf(vault.contractAddress)
  //   //   const balanceOut1After = await tokenOut1Contract.balanceOf(vault.contractAddress)
  //   //   const balanceOut2After = await tokenOut2Contract.balanceOf(vault.contractAddress)
  //   //   expect(balanceInBefore.gt(balanceInAfter), 'tokenIn swap failed').to.be.equal(true)
  //   //   expect(balanceOut1Before.lt(balanceOut1After), 'tokenOut1 swap failed').to.be.equal(true)
  //   //   expect(balanceOut2Before.lt(balanceOut2After), 'tokenOut2 swap failed').to.be.equal(true)

  //   // })

  //   // it('multicall gmx swap', async () => {
  //   //   const tokenIn = USDCToken
  //   //   const amount = ethers.utils.parseUnits('1000', tokenIn.decimals)
  //   //   const tokenOut1 = WETHToken
  //   //   const tokenOut2 = WBTCToken
  //   //   const tokenInContract = await hre.ethers.getContractAt(erc20ABI,tokenIn.address)
  //   //   const tokenOut1Contract = await hre.ethers.getContractAt(erc20ABI,tokenOut1.address)
  //   //   const tokenOut2Contract = await hre.ethers.getContractAt(erc20ABI,tokenOut2.address)
  //   //   await (await tokenInContract.connect(owner).mint(vault.contractAddress, amount)).wait()
  //   //   const balanceInBefore = await tokenInContract.balanceOf(vault.contractAddress)
  //   //   const balanceOut1Before = await tokenOut1Contract.balanceOf(vault.contractAddress)
  //   //   const balanceOut2Before = await tokenOut2Contract.balanceOf(vault.contractAddress)
  //   //   const multicall = await multiCallVaultMasterContract.getDeployedContract()
  //   //   const payloads = [getGMXSwapParams(vault, tokenIn, WETHPool, amount.div(2)), getGMXSwapParams(vault, tokenIn, WBTCPool, amount.div(2))]
  //   //   await (await multicall.connect(master).executeMultiCall(pluginNames.gmx.id, 3, payloads, [], {gasLimit: gasAmount})).wait()
  //   //   await sleep(10000)
  //   //   const balanceInAfter = await tokenInContract.balanceOf(vault.contractAddress)
  //   //   const balanceOut1After = await tokenOut1Contract.balanceOf(vault.contractAddress)
  //   //   const balanceOut2After = await tokenOut2Contract.balanceOf(vault.contractAddress)
  //   //   expect(balanceInBefore.gt(balanceInAfter), 'tokenIn swap failed').to.be.equal(true)
  //   //   expect(balanceOut1Before.lt(balanceOut1After), 'tokenOut1 swap failed').to.be.equal(true)
  //   //   expect(balanceOut2Before.lt(balanceOut2After), 'tokenOut2 swap failed').to.be.equal(true)
  //   // })
  // })

  describe('Lifi API should give out correct quotes', async()=>{
    it('USDC-WETH', async () => {
      const tokenIn = USDCToken
      const tokenOut = WETHToken
      const amount = '1'
      const amounteth = ethers.utils.parseUnits(amount, tokenIn.decimals)
      const quote = await getQuote('arb', 'arb', tokenSymbols.USDC, tokenSymbols.WETH, amount, vault.contractAddress)
      console.log(quote)
      const vaultContract = await hre.ethers.getContractAt(await vault.getContractABI(), multiCallVaultMasterContract.contractAddress)
      const tx = await (await vaultContract.connect(owner).bridgeViaLifi(tokenIn.address, amounteth, 0, false, quote)).wait()
      console.log(tx)
    })

    // it('USDC-WBTC', async () => {
    //   const quote = await getQuote('arb', 'arb', tokenSymbols.USDC, tokenSymbols.WBTC, '1000', vault.contractAddress)
    //   console.log(quote)
    // })
  })

})

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getQuote = async (fromChain:string, toChain:string, fromToken:string, toToken:string, fromAmount:string, fromAddress:string) => {
  const result = await axios.get('https://li.quest/v1/quote', {
      params: {
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount,
          fromAddress,
      }
  });
  return result.data;
}

const getGMXSwapParams = (vault: ContractUtils,tokenIn: VaultToken, pool: gmxPool, amount: BigNumber) => {
  const params = {
    addresses: {
        receiver: vault.contractAddress,
        cancellationReceiver: ethers.constants.AddressZero,
        callbackContract: ethers.constants.AddressZero,
        uiFeeReceiver: ethers.constants.AddressZero,
        market: ethers.constants.AddressZero,
        initialCollateralToken: tokenIn.address,
        swapPath: [pool.marketToken.address],
    },
    numbers: {
        sizeDeltaUsd: 0,
        initialCollateralDeltaAmount: amount,
        triggerPrice: 0,
        acceptablePrice: 0,
        executionFee: 0,
        callbackGasLimit: 0,
        minOutputAmount: 0,
    },
    orderType: OrderType.MarketSwap,
    decreasePositionSwapType: DecreasePositionSwapType.SwapCollateralTokenToPnlToken,
    isLong: false,
    shouldUnwrapNativeToken: false,
    autoCancel: false,
    referralCode: ethers.constants.HashZero 
  }

  const encodedParams = ethers.utils.defaultAbiCoder.encode(
    [
      'tuple(tuple(address,address,address,address,address,address,address[]),tuple(uint256,uint256,uint256,uint256,uint256,uint256,uint256),uint8,uint8,bool,bool,bool,bytes32)'
    ],
    [[
        [
            params.addresses.receiver,
            params.addresses.cancellationReceiver,
            params.addresses.callbackContract,
            params.addresses.uiFeeReceiver,
            params.addresses.market,
            params.addresses.initialCollateralToken,
            params.addresses.swapPath
        ],
        [
            params.numbers.sizeDeltaUsd,
            params.numbers.initialCollateralDeltaAmount,
            params.numbers.triggerPrice,
            params.numbers.acceptablePrice,
            params.numbers.executionFee,
            params.numbers.callbackGasLimit,
            params.numbers.minOutputAmount
        ],
        params.orderType,
        params.decreasePositionSwapType,
        params.isLong,
        params.shouldUnwrapNativeToken,
        params.autoCancel,
        params.referralCode
    ]]
  )
  return encodedParams
}