// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../interfaces/AggregatorV3Interface.sol";

contract TokenPriceConsumer is Ownable {
    mapping(address => AggregatorV3Interface) private tokenPriceFeeds;
    
    mapping(address => uint256) private tokenHeartbeatDurations;

        
    mapping(address => uint8) public tokenDecimalList;

    event SetTokenDecimals(address _token, uint8 _decimals);

    constructor(address[] memory tokenAddresses, address[] memory priceFeedAddresses, uint256[] memory heartbeatDurations) Ownable(msg.sender) {
        require(tokenAddresses.length == priceFeedAddresses.length, "Arrays length mismatch");
        require(tokenAddresses.length == heartbeatDurations.length, "Arrays length mismatch");


        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            tokenPriceFeeds[tokenAddresses[i]] = AggregatorV3Interface(priceFeedAddresses[i]);
            tokenHeartbeatDurations[tokenAddresses[i]] = heartbeatDurations[i];
        }
    }

    function addPriceFeed(address tokenAddress, address priceFeedAddress, uint256 heartbeatDuration) public onlyOwner {
        require(priceFeedAddress != address(0), "Invalid address");
        require(address(tokenPriceFeeds[tokenAddress]) == address(0), "PriceFeed already exist");
        tokenPriceFeeds[tokenAddress] = AggregatorV3Interface(priceFeedAddress);
        tokenHeartbeatDurations[tokenAddress] = heartbeatDuration;

    }

    function removePriceFeed(address tokenAddress) public onlyOwner {
        require(address(tokenPriceFeeds[tokenAddress]) != address(0), "PriceFeed already exist");
        delete tokenPriceFeeds[tokenAddress];
        delete tokenHeartbeatDurations[tokenAddress];
    }

    function setTokenDecimals(address _token, uint8 _decimals) public onlyOwner {
        tokenDecimalList[_token] = _decimals;

        emit SetTokenDecimals(_token, _decimals);
    }


    function setTokenDecimalsBatch(address[] calldata _tokens, uint8[] calldata _newDecimals) external onlyOwner {
        require(_tokens.length == _newDecimals.length, "Arrays must have the same length");
        for (uint256 i = 0; i < _tokens.length; i++) {
            setTokenDecimals(_tokens[i], _newDecimals[i]);
        }
    }

    function getTokenPrice(address tokenAddress) public view returns (uint256) {
        AggregatorV3Interface priceFeed = tokenPriceFeeds[tokenAddress];
        require(address(priceFeed) != address(0), "Price feed not found");

        (uint80 roundId, int256 answer, ,uint256 updatedAt  , ) = priceFeed.latestRoundData();

        require(roundId != 0 && answer >= 0 && updatedAt != 0, "PriceFeed: Sanity check");

        require(block.timestamp - updatedAt <= tokenHeartbeatDurations[tokenAddress], "Price feed is stale");
        
        // Token price might need additional scaling based on decimals
        return uint256(answer);
    }

    function decimals(address tokenAddress) public view returns (uint8) {
        AggregatorV3Interface priceFeed = tokenPriceFeeds[tokenAddress];
        require(address(priceFeed) != address(0), "Price feed not found");
        return priceFeed.decimals();
    }

    /// @notice The decimals function above returns the number of decimal places used by the price feed. This function is specifically designed to handle non-ERC20 tokens, such as GMX synthetic tokens, which the vault accepts.
    function getTokenDecimal(address token) public view returns (uint8) {
        if(isContract(token)) {
            return IERC20Metadata(token).decimals();
        } else {
            uint8 decimalValue = tokenDecimalList[token];
            require(decimalValue > 0, "Token decimals not set");
            return decimalValue;       
        }
    }

    // Public view function to determine whether the given address is a contract or an externally-owned account (EOA).
    // It uses the assembly block to efficiently check the size of the code at the specified address.
    // If the size of the code (extcodesize) is greater than 0, the address is considered a contract.
    // Returns true if the address is a contract and false if it is an externally-owned account.
    function isContract(address _addr) private view returns (bool) {
        uint32 size;

        // Use assembly to get the size of the code at the specified address.
        assembly {
            size := extcodesize(_addr)
        }

        // Return true if the size of the code is greater than 0, indicating a contract.
        return (size > 0);
    }
}