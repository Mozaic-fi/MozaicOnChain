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
import { assert } from 'console'

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
  let WBTCToken: VaultToken
  let WETHPool: gmxPool
  let WBTCPool: gmxPool
  let tokenPriceConsumer: ContractUtils
  let ethAmount01: BigNumber
  let ethAmount1: BigNumber
  let ethAmount2: BigNumber
  let ethAmount05: BigNumber
  let ethAmount001: BigNumber
  let deposit: (token: VaultToken, user: SignerWithAddress, _amount: string, _amountBack: string) => Promise<void>
  let withdraw: (token1: VaultToken, token2: VaultToken, user: SignerWithAddress, _amount: number) => Promise<void>
  let swapTokens: (tokenIn: VaultToken, tokenOut: VaultToken, _amount: string, user: SignerWithAddress, runCancelation: boolean) => Promise<void>
  let cancelOrderAction: (user: SignerWithAddress) => Promise<void>
  let reBalance: (poolOut: gmxPool, poolIn: gmxPool, _amount: string, user: SignerWithAddress) => Promise<void>
  let gmxBalanceTopUp: () => Promise<void>
  let emptyPlugin: () => Promise<void>
  

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
    WBTCToken = getToken(tokenSymbols.WBTC,network.networkName)
    ethAmount01 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('0.1') : ethers.utils.parseEther('0.001'); // 0.1 Ether
    ethAmount1 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('1'): ethers.utils.parseEther('0.01'); // 1 Ether
    ethAmount2 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('2'): ethers.utils.parseEther('0.02'); // 2 Ether
    ethAmount05 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('0.5'): ethers.utils.parseEther('0.005'); // 0.5 Ether
    ethAmount001 = network.networkName===networkNames.avalancheFuji ?ethers.utils.parseEther('0.001'):ethers.utils.parseEther('0.00001'); // 0.001 Ether

    //fuji or arbi
    let wethgmxaddress= network.networkName===networkNames.avalancheFuji? '0xbf338a6C595f06B7Cfff2FA8c958d49201466374':'0x70d95587d40A2caf56bd97485aB3Eec10Bee6336'
    WETHPool = {
        poolId: 2,
        indexToken: getToken(tokenSymbols.WETH,network.networkName),
        longToken: getToken(tokenSymbols.WETH,network.networkName),
        shortToken: getToken(tokenSymbols.USDC,network.networkName),
        marketToken: getTokenFromAddress(network.networkName,wethgmxaddress)
    }

    let wbtcgmxaddress= network.networkName===networkNames.avalancheFuji? '0x79E6e0E454dE82fA98c02dB012a2A69103630B07':''
    WBTCPool = {
        poolId: 3,
        indexToken: getToken(tokenSymbols.WBTC,network.networkName),
        longToken: getToken(tokenSymbols.WBTC,network.networkName),
        shortToken: getToken(tokenSymbols.USDC,network.networkName),
        marketToken: getTokenFromAddress(network.networkName,wbtcgmxaddress)
    }

    deposit = async (token: VaultToken, user: SignerWithAddress, _amount: string, _amountBack: string)=>{
      const tokenContract = await hre.ethers.getContractAt(erc20ABI,token.address)
    
      const amount = ethers.utils.parseUnits(_amount, token.decimals)
      await (await tokenContract.connect(user).mint(user.address, amount)).wait()
      await (await tokenContract.connect(user).approve(vault.contractAddress, amount)).wait()
      
      expect(amount.lte(await tokenContract.allowance(user.address, vault.contractAddress)), 'token approval failed').to.be.equal(true)

      const vaultContract = await  vault.getDeployedContract()
      expect(await vaultContract.getVaultStatus(), 'vault closed').to.be.equal(true);
      expect(await vaultContract.isDepositAllowedToken(token.address), 'cant deposit this token').to.be.equal(true);

      const minGMAmount = ethers.utils.parseEther(_amountBack);
      const payload = ethers.utils.defaultAbiCoder.encode(['uint256'], [minGMAmount]);
      let lpTokenBalanceBefore = await vaultContract.balanceOf(user.address);

      const tx = await vaultContract.connect(user).addDepositRequest(token.address, amount, user.address, payload, {value: ethAmount001, gasLimit: 5000000} )
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

      const tx = await vaultContract.connect(user).addWithdrawalRequest(amountToWithdraw,1, WETHPool.poolId, user.address, payload, {value: ethAmount001, gasLimit: 5000000})
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

      const params = {
        addresses: {
            receiver: vault.contractAddress,
            cancellationReceiver: ethers.constants.AddressZero,
            callbackContract: ethers.constants.AddressZero,
            uiFeeReceiver: ethers.constants.AddressZero,
            market: ethers.constants.AddressZero,
            initialCollateralToken: tokenIn.address,
            swapPath: [WETHPool.marketToken.address],
        },
        numbers: {
            sizeDeltaUsd: 0,
            initialCollateralDeltaAmount: amount,
            triggerPrice: 0,
            acceptablePrice: 0,
            executionFee: 0,
            callbackGasLimit: 0,
            minOutputAmount: amount.div(100),
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

      const tx = await vaultContract.connect(user).execute(pluginNames.gmx.id, ActionType.SwapTokens, encodedParams, {gasLimit: 5000000} )
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
        await (await vaultContract.connect(user).execute(pluginNames.gmx.id, ActionType.CancelAction, payload, {gasLimit: 5000000} )).wait()
      }

      orderKeys = await gmxCallBack.getArrayValues('orderKeys')
      
      expect(orderKeys.length == 0, 'Pending Orders Canceled').to.be.equal(true)

    }

    gmxBalanceTopUp = async ()=> {
      let pluginBalance = await ethers.provider.getBalance(gmxPlugin.contractAddress)
      if(pluginBalance.lt(ethAmount05)){
        await (await owner.sendTransaction({
            to: gmxPlugin.contractAddress,
            value: ethAmount2,
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
  //   it('USDC', async () => { 
  //     await deposit(USDCToken, user2, '5', '0')
  //   })

  //   it('Canceled-USDC', async () => { 
  //     await sleep(3000)
  //     await deposit(USDCToken, user2, '5', '100000')
  //   })
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


})

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}