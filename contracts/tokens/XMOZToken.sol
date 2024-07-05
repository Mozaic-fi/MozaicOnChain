// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import { IXMozToken } from "../interfaces/IXMozToken.sol";

contract XMozToken is IXMozToken, ERC20, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    address public mozStaking;
    EnumerableSet.AddressSet private _transferWhitelist; // addresses allowed to send/receive xMOZ

    /***********************************************/
    /****************** CONSTRUCTOR ****************/
    /***********************************************/

    /**
     * @custom:security-contact mailto:security@mozaic.finance
     */

    constructor(
        address _mozStaking
    ) ERC20("Mozaic escrowed token", "xMOZ") Ownable(msg.sender) {
        require(_mozStaking != address(0x0), "Invalid addr");
        _transferWhitelist.add(address(this));
        mozStaking = _mozStaking;
    }

    /***********************************************/
    /****************** MODIFIERS ******************/
    /***********************************************/

    modifier onlyStakingContract() {
        require(msg.sender == mozStaking, "Invalid caller");
        _;
    }

    /***********************************************/
    /****************** EVENTS *********************/
    /***********************************************/

    event SetTransferWhitelist(address account, bool add);

    /***********************************************/
    /****************** FUNCTIONS ******************/
    /***********************************************/

    /**
    * @dev returns length of transferWhitelist array
    */
    function transferWhitelistLength() external view returns (uint256) {
        return _transferWhitelist.length();
    }

    /**
    * @dev returns transferWhitelist array item's address for "index"
    */
    function transferWhitelist(uint256 index) external view returns (address) {
        return _transferWhitelist.at(index);
    }

    /**
    * @dev returns if "account" is allowed to send/receive xMOZ
    */
    function isTransferWhitelisted(address account) public view returns (bool) {
        return _transferWhitelist.contains(account);
    }

    /**
    * @dev Adds or removes addresses from the transferWhitelist
    */
    function updateTransferWhitelist(address account, bool add) external onlyOwner {
        require(account != address(this), "updateTransferWhitelist: Cannot remove xMoz from whitelist");

        if(add) _transferWhitelist.add(account);
        else _transferWhitelist.remove(account);

        emit SetTransferWhitelist(account, add);
    }

    function mint(uint256 _amount, address _to) external onlyStakingContract {
        _mint(_to, _amount);
    }

    function burn(uint256 _amount, address _from) external onlyStakingContract {
        _burn(_from, _amount);
    }

    /***********************************************/
    /*************** Hook Overrides ****************/
    /***********************************************/
    
    /**
    * @dev Hook override to forbid transfers except from whitelisted addresses and minting
    */
    function _update(address from, address to, uint256 value) internal override {
        require(from == address(0) || to == address(0) && msg.sender == mozStaking || from == owner() || isTransferWhitelisted(from), "transfer: not allowed");
        super._update(from, to, value);
    }



}


