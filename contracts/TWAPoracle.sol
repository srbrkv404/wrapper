// // SPDX-License-Identifier: MIT

// pragma solidity 0.8.28;

// import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
// import "@uniswap/v2-core/contracts/libraries/UQ112x112.sol";

// contract TWAPoracle {
//     using UQ112x112 for uint224;

//     IUniswapV2Pair uniswapPair;

//     UQ112x112 lastPrice0Cumulative;
//     uint32 lastTimestamp;

//     uint32 constant PERIOD = 60;

//     function getTimeElapsed() internal view returns (uint32 time) {
//         unchecked {
//             time = uint32(block.timestamp % 2 ** 32) - lastTimestamp;
//         }
//     }

//     function snapshot() public returns (UQ112x112 twapPrice) {
//         require(getTimeElapsed() >= PERIOD, "snapshot is not stale");

//         ( , , lastSnapshotTime) = uniswapV2pair.getReserves();
//         snapshotPrice0Cumulative = uniswapV2pair.price0CumulativeLast;
//     }

//     function getOneHourPrice() public view returns (UQ112x112 price) {
//         require(getTimeElapsed() >= PERIOD, "snapshot not old enough");
//         require(getTimeElapsed() < 3 hours, "price is too stale");

//         uint256 recentPriceCumul = uniswapV2pair.price0CumulativeLast;

//         unchecked {
//             twapPrice = (recentPriceCumul - lastPrice0Cumulative) / timeElapsed;
//         }
//     }
// }

