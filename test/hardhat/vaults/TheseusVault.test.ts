import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'



import hre from 'hardhat'


describe('TheseusVault Test', () => {
    enum ActionType {
        // Action types
        Stake,
        Unstake,
        SwapTokens,
        ClaimRewards,
        CancelAction
      }
  
      enum State { Deposit, Withdrawal, Order }

      

})