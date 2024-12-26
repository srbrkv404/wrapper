// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

interface IChainlinkOracle {
    function getPrice() external view returns (int);
}