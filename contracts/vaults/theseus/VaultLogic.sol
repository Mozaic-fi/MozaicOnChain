// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../../interfaces/vaults/IPlugin.sol";
import "../../interfaces/vaults/IVaultLocker.sol";
import "../../libraries/hypernative/OracleProtected.sol";
import "../TokenPriceConsumer.sol";
import "./Vault.sol";

contract VaultLogic is Ownable, ReentrancyGuard, OracleProtected {
    using SafeERC20 for IERC20;

    address public vault;
    address public tokenPriceConsumer;

    constructor(address _vault, address _tokenPriceConsumer, address _hypernativeOracle)
        Ownable(msg.sender)
        OracleProtected(_hypernativeOracle)
    {
        vault = _vault;
        tokenPriceConsumer = _tokenPriceConsumer;
    }

    function addDepositRequest(address _token, uint256 _tokenAmount, address _receiver, bytes memory _payload) external payable onlyOracleApproved nonReentrant(){
        Vault(payable(vault)).addDepositRequest{value:msg.value}(_token, _tokenAmount, _receiver, _payload);
    }
}

