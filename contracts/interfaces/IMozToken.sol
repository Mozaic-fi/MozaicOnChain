// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMozToken is IERC20 {
	function burn(uint256 amount, address from) external;
	function mint(uint256 amount, address to) external;
}