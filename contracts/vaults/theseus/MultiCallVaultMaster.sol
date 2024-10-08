// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../interfaces/gmx/IExchangeRouter.sol";
import "../../interfaces/vaults/IPlugin.sol";
import "./Vault.sol";

contract MultiCallVaultMaster is Ownable {
    using SafeERC20 for IERC20;

    struct LifiCallData {
        address srcToken;
        uint256 amount;
        uint256 value;
        bool bridge;
        bytes data;
    }

    enum MultiCallAction {
        Stake,
        Unstake,
        SwapLifi,
        SwapGMX,
        /// @notice For the swap part of this action only sawp via lifi is possible, since sawp via gmx is not atomic
        SwapAndStake,
        Cancel
    }

    address payable public vault;

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "MultiCallVaultMaster: caller is not the admin");
        _;
    }

    constructor(address _admin) Ownable(msg.sender)
    {
        admin = _admin;
    }

    function setVault(address payable _vault) external onlyOwner {
        vault = _vault;
    }

    function setAdmin(address _admin) external onlyOwner {
        admin = _admin;
    }

    function executeMultiCall(uint8 _pluginId, MultiCallAction _action, bytes[] memory _payloads, LifiCallData[] memory _lifiCallData) onlyAdmin external {
       if(_action == MultiCallAction.Stake) {
            for(uint256 i = 0; i < _payloads.length; i++) {
                Vault(vault).execute(_pluginId, IPlugin.ActionType.Stake, _payloads[i]);
            }
       } else if(_action == MultiCallAction.Unstake) {
            for(uint256 i = 0; i < _payloads.length; i++) {
                Vault(vault).execute(_pluginId, IPlugin.ActionType.Unstake, _payloads[i]);
            }
       } else if(_action == MultiCallAction.SwapGMX) {
            address[] memory _tokens = new address[](_payloads.length);
            uint256[] memory _amounts = new uint256[](_payloads.length);
            for(uint256 i = 0; i < _payloads.length; i++) {
                IExchangeRouter.CreateOrderParams memory orderParams = abi.decode(_payloads[i], (IExchangeRouter.CreateOrderParams));
                _tokens[i] = orderParams.addresses.initialCollateralToken;
                _amounts[i] = orderParams.numbers.initialCollateralDeltaAmount;
            }
            Vault(vault).approveTokens(_pluginId, _tokens, _amounts);
            for(uint256 i = 0; i < _payloads.length; i++) {
                Vault(vault).execute(_pluginId, IPlugin.ActionType.SwapTokens, _payloads[i]);
            }
       } else if(_action == MultiCallAction.Cancel) {
            for(uint256 i = 0; i < _payloads.length; i++) {
                Vault(vault).execute(_pluginId, IPlugin.ActionType.CancelAction, _payloads[i]);
            }
       } else if(_action == MultiCallAction.SwapLifi) {         
            for(uint256 i = 0; i < _lifiCallData.length; i++) {
                address _srcToken = _lifiCallData[i].srcToken;
                uint256 _amount = _lifiCallData[i].amount;
                uint256 _value = _lifiCallData[i].value;
                bool _bridge = _lifiCallData[i].bridge;
                bytes memory _data = _lifiCallData[i].data;
                Vault(vault).bridgeViaLifi(_srcToken, _amount, _value, _bridge, _data);
            }
       } else if(_action == MultiCallAction.SwapAndStake) {     
            for(uint256 i = 0; i < _lifiCallData.length; i++) {
                address _srcToken = _lifiCallData[i].srcToken;
                uint256 _amount = _lifiCallData[i].amount;
                uint256 _value = _lifiCallData[i].value;
                bool _bridge = _lifiCallData[i].bridge;
                bytes memory _data = _lifiCallData[i].data;
                Vault(vault).bridgeViaLifi(_srcToken, _amount, _value, _bridge, _data);
            }

            for(uint256 i = 0; i < _payloads.length; i++) {
                Vault(vault).execute(_pluginId, IPlugin.ActionType.Stake, _payloads[i]);
            }
       }
    }  

    fallback() external payable onlyAdmin {
        assembly {
            let _vault := sload(vault.slot)
            calldatacopy(0, 0, calldatasize())
            let result := call(gas(), _vault, callvalue(), 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
                case 0 {revert(0, returndatasize())}
                default {return (0, returndatasize())
            }
        }
    }

    receive() external payable {} 

    function withdrawStuckEth(address toAddr) external onlyOwner {
        (bool success, ) = toAddr.call{
            value: address(this).balance
        } ("");
        require(success);
    }

    function withdrawStuckToken(address token,address _to) external onlyOwner {
        require(_to != address(0), "Zero address");
        uint256 _contractTokenBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(_to, _contractTokenBalance);
    }
}