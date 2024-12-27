// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract PythOracle {
    IPyth private pyth;
    bytes32 private priceId;

    constructor (address pythContract, bytes32  _priceID) {
        pyth = IPyth(pythContract);
        priceId = _priceID;
    }

    function setPythContract(address _pyth) external {
        pyth = IPyth(_pyth);
    }


    function getPrice() public payable returns (int64) {

        // uint updateFee = pyth.getUpdateFee(priceUpdate);
        // pyth.updatePriceFeeds{ value: updateFee }(priceUpdate);
        PythStructs.Price memory priceFeed = pyth.getPriceNoOlderThan(priceId, 60);

        return priceFeed.price;
    }
}