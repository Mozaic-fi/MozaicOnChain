import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import hre, { ethers } from 'hardhat'
import { ContractUtils } from '../../../utils/contractUtils'
import { GmxUtils } from '../../../utils/gmxUtils'
import { NetworkInfo, networkConfigs } from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import { getToken, VaultToken, getTokenFromAddress } from '../../../utils/vaultTokens'
import { tokenSymbols } from '../../../utils/names/tokenSymbols'
import { erc20ABI } from '../../../utils/erc20ABI'
import { gmxPool } from '../../../utils/vaultPlugins/gmxVaultPlugins'

describe('TheseusVault Test', () => {

  let network: NetworkInfo
  let owner: SignerWithAddress
  let master: SignerWithAddress
  let user: SignerWithAddress
  let vault: ContractUtils
  let gmxPlugin: ContractUtils
  let gmxCallBack: ContractUtils
  let gmxUtils: GmxUtils
  let WETHToken: VaultToken
  let WETHContract: Contract
  let USDCToken: VaultToken
  let USDCContract: Contract
  let WETHPool: gmxPool
  let WBTCPool: gmxPool
  let tokenPriceConsumer: ContractUtils

  before(async () => { 
    network = networkConfigs.get(hre.network.name)!
    owner = (await hre.ethers.getSigners()).at(0)!
    master = owner
    user = owner
    vault = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.Vault)
    gmxPlugin = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxPlugin)
    gmxCallBack = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxCallback)
    tokenPriceConsumer = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.TokenPriceConsumer)
    gmxUtils = new GmxUtils(network.networkName)
    WETHToken = getToken(tokenSymbols.WETH,network.networkName)
    WETHContract = await hre.ethers.getContractAt(erc20ABI,WETHToken.address)
    USDCToken = getToken(tokenSymbols.USDC,network.networkName)
    USDCContract = await hre.ethers.getContractAt(erc20ABI,USDCToken.address)
    
    WETHPool = {
        poolId: 2,
        indexToken: getToken(tokenSymbols.WETH,network.networkName),
        longToken: getToken(tokenSymbols.WETH,network.networkName),
        shortToken: getToken(tokenSymbols.USDC,network.networkName),
        marketToken: getTokenFromAddress(network.networkName,'0xbf338a6C595f06B7Cfff2FA8c958d49201466374')
    }

    // WETHPool = {
    //     poolId: 2,
    //     indexToken: getToken(tokenSymbols.WETH,network.networkName),
    //     longToken: getToken(tokenSymbols.WETH,network.networkName),
    //     shortToken: getToken(tokenSymbols.USDC,network.networkName),
    //     marketToken: getTokenFromAddress(network.networkName,'0x70d95587d40A2caf56bd97485aB3Eec10Bee6336')
    // }

    // WBTCPool = {
    //     poolId: 3,
    //     indexToken: getToken(tokenSymbols.WBTC,network.networkName),
    //     longToken: getToken(tokenSymbols.WBTC,network.networkName),
    //     shortToken: getToken(tokenSymbols.USDC,network.networkName),
    //     marketToken: getTokenFromAddress(network.networkName,'0x79E6e0E454dE82fA98c02dB012a2A69103630B07')
    //   }

      
  }) 

  it('user should have balance', async () => {
    const wethBalance = Number(await WETHContract.balanceOf(user.address))
    expect(wethBalance).to.be.gt(0)
    const usdcBalance = Number(await USDCContract.balanceOf(user.address))
    expect(usdcBalance).to.be.gt(0)
  })

  it('user should be able to deposit USDT', async () => { 
    const amountUSDC = ethers.utils.parseUnits('100', USDCToken.decimals)
    await USDCContract.approve(vault.contractAddress, amountUSDC)
    expect(amountUSDC.eq(await USDCContract.allowance(user.address, vault.contractAddress))).to.be.equal(true)
    const vaultContract = await  vault.getDeployedContract()
    const minGMAmount = ethers.utils.parseEther("100");
    const payload = ethers.utils.defaultAbiCoder.encode(['uint256'], [minGMAmount]);
    expect(await vaultContract.getVaultStatus()).to.be.equal(true);
    expect(await vaultContract.isDepositAllowedToken(USDCToken.address)).to.be.equal(true);
    const tx = await vaultContract.addDepositRequest(USDCToken.address, amountUSDC, user.address, payload, {value: 1000000000000000, gasLimit: 5000000} )

    console.log(tx)
    // const contractTokenBalance = await USDCContract.balanceOf(vault.contractAddress);
    // expect(contractTokenBalance).to.equal(amountUSDC);

    let lpTokenBalance = await vaultContract.balanceOf(user.address);
    console.log(lpTokenBalance)
    let usdAmount = await vaultContract.calculateTokenValueInUsd(USDCToken.address, amountUSDC)
    //const expectedLP = await vaultContract.convertAssetToLP(usdAmount)
    // expect(lpTokenBalance).to.be.equal(expectedLP);

  })


})