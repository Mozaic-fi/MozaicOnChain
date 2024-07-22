import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import hre from 'hardhat'
import { ContractUtils } from '../../../utils/contractUtils'
import { GmxUtils } from '../../../utils/gmxUtils'
import { NetworkInfo, networkConfigs } from '../../../utils/networkConfigs'
import { contractNames } from '../../../utils/names/contractNames'
import { getToken, VaultToken } from '../../../utils/vaultTokens'
import { tokenSymbols } from '../../../utils/names/tokenSymbols'
import { erc20ABI } from '../../../utils/erc20ABI'

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
  let WBTCToken: VaultToken
  let WBTCContract: Contract

  before(async () => { 
    network = networkConfigs.get(hre.network.name)!
    owner = (await hre.ethers.getSigners()).at(0)!
    master = owner
    user = owner
    vault = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.Vault)
    gmxPlugin = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxPlugin)
    gmxCallBack = await ContractUtils.createFromDeployment(hre, contractNames.Vaults.Theseus.GmxCallback)
    gmxUtils = new GmxUtils(network.networkName)
    WETHToken = getToken(tokenSymbols.WETH,network.networkName)
    WETHContract = await hre.ethers.getContractAt(erc20ABI,WETHToken.address)
    USDCToken = getToken(tokenSymbols.USDC,network.networkName)
    USDCContract = await hre.ethers.getContractAt(erc20ABI,USDCToken.address)
    WBTCToken = getToken(tokenSymbols.WBTC,network.networkName)
    WBTCContract = await hre.ethers.getContractAt(erc20ABI,WBTCToken.address)
  }) 

  it('user should have balance', async () => {
    const wethBalance = Number(await WETHContract.balanceOf(user.address))
    expect(wethBalance).to.be.gt(0)
    const usdcBalance = Number(await USDCContract.balanceOf(user.address))
    expect(usdcBalance).to.be.gt(0)
    const wbtcBalance = Number(await WBTCContract.balanceOf(user.address))
    expect(wbtcBalance).to.be.gt(0)
  })


})