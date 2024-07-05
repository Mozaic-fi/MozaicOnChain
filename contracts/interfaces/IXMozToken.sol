// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IXMozToken is IERC20 {

    function mint(uint256 amount, address to) external;

    function isTransferWhitelisted(address account) external view returns (bool);

    function burn(uint256 amount, address to) external;

    function updateTransferWhitelist(address account, bool flag) external;

}