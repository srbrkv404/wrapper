// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

interface IChainlinkOracle {
    function setPriceFeed(address) external;
    function getPrice() external view returns (int);
}