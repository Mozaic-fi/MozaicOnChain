// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IMozToken } from "../interfaces/tokens/IMozToken.sol";

contract MozToken is IMozToken, OFT {
	using SafeERC20 for IERC20;
    address public mozStaking;

    /***********************************************/
	/****************** CONSTRUCTOR ****************/
	/***********************************************/
    /**
     * @dev Constructor for the MozToken contract
     * @param _lzEndpoint: address of the LayerZero endpoint
     * @param _mozStaking: address of the MozStaking contract
     * @custom:security-contact mailto:security@mozaic.finance
     */
    constructor(address _lzEndpoint, address _mozStaking)
     OFT("Mozaic Token", "MOZ", _lzEndpoint, msg.sender) Ownable(msg.sender) {
        require(_mozStaking != address(0x0), "Invalid address");
        mozStaking = _mozStaking;
    }

    /***********************************************/
	/****************** MODIFIERS ******************/
	/***********************************************/

    /**
     * @dev Modifier to check if the caller is the staking contract
     */
    modifier onlyStakingContract() {
        require(msg.sender == mozStaking, "Invalid caller");
        _;
    }


    /***********************************************/
    /************** StakingFunctions ***************/
    /***********************************************/

    function burn(uint256 amount, address from) external onlyStakingContract {
        _burn(from, amount);
    }

    function mint(uint256 _amount, address _to) external onlyStakingContract {
        _mint(_to, _amount);
    }

    /***********************************************/
    /***************** Recieve function ************/
    /***********************************************/
    receive() external payable {}

    function withdrawStuckEth(address toAddr) external onlyOwner {
        (bool success, ) = toAddr.call{
            value: address(this).balance
        } ("");
        require(success);
    }

    function withdrawStuckToken(address token,address _to) external onlyOwner {
        require(_to != address(0), "Zero address");
        uint256 _contractMozBalance = balanceOf(address(this));
        uint256 _contractTokenBalance = IERC20(token).balanceOf(address(this));
        IERC20(address(this)).safeTransfer(_to, _contractMozBalance);
        IERC20(token).safeTransfer(_to, _contractTokenBalance);
    }
}