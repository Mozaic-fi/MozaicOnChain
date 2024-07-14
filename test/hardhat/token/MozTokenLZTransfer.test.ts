import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'
import {NetworkInfo, networkConfigs} from '../../../utils/networkConfigs'
import { networkNames } from '../../../utils/networkNames'
import { contractNames } from '../../../utils/contractNames'

import { Options } from '@layerzerolabs/lz-v2-utilities'
import { Deployment } from 'hardhat-deploy/types'

import hre from 'hardhat'

describe('MozTransfer Test', function () {
    // Declaration of variables to be used in the test suite
    let tokenDeployment: Deployment
    let signer: SignerWithAddress
    let tokenAddress: string
    let token: Contract
    let erc20: Contract
    let contractName: string
    let sourceNetwork: NetworkInfo
    let destinationNetwork: NetworkInfo

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        sourceNetwork = networkConfigs.get(hre.network.name)!

        contractName = sourceNetwork.tokensInfo?.requireAdapter ? contractNames.Tokens.MozTokenAdapter : contractNames.Tokens.MozToken;
        tokenDeployment = await hre.deployments.get(contractName)

        tokenAddress = sourceNetwork.tokensInfo?.requireAdapter? sourceNetwork.tokensInfo?.mozTokenContractAddress! : tokenDeployment.address

        const signers = await ethers.getSigners()
        

        signer = signers.at(0)!
    })

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        destinationNetwork = getDestinationNetwork(hre.network.name)

        token = await ethers.getContractAt(contractName, tokenDeployment.address, signer)
        if(sourceNetwork.tokensInfo?.requireAdapter){
            erc20 = await ethers.getContractAt(contractNames.Tokens.MozToken, tokenAddress, signer)
        }
    })

    // A test case to verify token transfer functionality
    it('should send a token from A address to B address via each OFT', async function () {
        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = ethers.utils.parseEther('1'); 
        console.log(destinationNetwork)

        console.log(`Sending ${tokensToSend} token from ${sourceNetwork.networkName} to ${destinationNetwork.networkName}`)

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

        const sendParam = [
            destinationNetwork.layerZeroInfo?.layerZeroEIDV2,
            ethers.utils.zeroPad(signer.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ]

        if(sourceNetwork.tokensInfo?.requireAdapter){
            console.log(`Approving ${tokensToSend} tokens to be sent from ${sourceNetwork.networkName} to ${destinationNetwork.networkName}`)
            await erc20.approve(tokenDeployment.address, tokensToSend)
        }
        //Fetching the native fee for the token send operation
        console.log(`Fetching native fee for the token send operation from ${sourceNetwork.networkName} to ${destinationNetwork.networkName}`)
        const [nativeFee] = await token.quoteSend(sendParam, false)
        console.log(`Native fee for the token send operation from ${sourceNetwork.networkName} to ${destinationNetwork.networkName} is ${nativeFee}`)

        console.log(`Sending ${nativeFee} native tokens from ${sourceNetwork.networkName} to ${destinationNetwork.networkName}`) 
        //Executing the send operation from myOFTA contract
        await token.send(sendParam, [nativeFee, 0], signer.address, { value: nativeFee })
        console.log(`Sent ${nativeFee} native tokens from ${sourceNetwork.networkName} to ${destinationNetwork.networkName}`)
    })
})


const getDestinationNetwork = (networkName: string) : NetworkInfo =>{
    switch(networkName){
        case networkNames.arbitrumSepolia:
            return networkConfigs.get(networkNames.sepolia)!
        case networkNames.sepolia:
            return networkConfigs.get(networkNames.baseSepolia)!
        case networkNames.baseSepolia:
                return networkConfigs.get(networkNames.arbitrumSepolia)!
        default:
            throw new Error(`Destination network not found for ${networkName}`)
    }
}