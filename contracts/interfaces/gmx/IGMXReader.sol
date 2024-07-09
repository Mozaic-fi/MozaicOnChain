// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import "./IGMXDataStore.sol"; // Import the DataStore contract
import "./IGMXMarket.sol"; // Import the Market contract
import "./IGMXMarketPoolValueInfo.sol"; // Import the MarketPoolValueInfo contract
import "../IPrice.sol"; // Import the Price contract

interface IGMXReader {
    function getMarketTokenPrice(
        IGMXDataStore dataStore,
        IGMXMarket.Props memory market,
        IPrice.Props memory indexTokenPrice,
        IPrice.Props memory longTokenPrice,
        IPrice.Props memory shortTokenPrice,
        bytes32 pnlFactorType,
        bool maximize
    ) external view returns (int256, IGMXMarketPoolValueInfo.Props memory);
}