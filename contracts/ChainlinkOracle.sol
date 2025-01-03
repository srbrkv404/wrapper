// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./interfaces/IChainlinkOracle.sol";

contract ChainlinkOracle {
    AggregatorV3Interface internal priceFeed;

    function setPriceFeed(address _priceFeed) external {
        priceFeed = AggregatorV3Interface(_priceFeed);
    } 

    function getPrice() external view returns (int) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}