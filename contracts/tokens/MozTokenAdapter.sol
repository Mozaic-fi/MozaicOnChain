// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { OFTAdapter } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFTAdapter.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MozTokenAdapter: Although the original Moz Token implementaion uses OFTV2 standard, due to a minor issue, it can't properly handle omnichain Token transfers. This adapter is created to fix the issue.
 * @notice There can only be one OFT Adapter used in an OFT deployment. Multiple OFT Adapters break omnichain unified liquidity by effectively creating token pools.
 */

contract MozTokenAdapter is OFTAdapter {
    /**
     * @custom:security-contact mailto:security@mozaic.finance
     */
    constructor(
        address _token,
        address _layerZeroEndpoint
    ) OFTAdapter(_token, _layerZeroEndpoint, msg.sender) Ownable(msg.sender) {}
}
