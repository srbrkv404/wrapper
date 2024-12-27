// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol";
import "./interfaces/IChainlinkOracle.sol";
import "./interfaces/IUSDT.sol";

import "@uniswap/v2-core/contracts/libraries/UQ112x112.sol";
import "@uniswap/v2-core/contracts/libraries/Math.sol";

import "hardhat/console.sol";


contract Wrapper {
    using SafeMath  for uint;
    using UQ112x112 for uint224;
    
    IUniswapV2Factory factory;
    IUniswapV2Router02 router;
    IChainlinkOracle oracleChainlink;

    address token;
    address coin;

    uint256 public addedToken;
    uint256 public addedCoin;

    constructor(address _token, address _coin, address _factory, address _router, address _oracle) {
        token = _token;
        coin = _coin;
        factory = IUniswapV2Factory(_factory);
        router = IUniswapV2Router02(_router);
        oracleChainlink = IChainlinkOracle(_oracle);
    }

    function addLiqudityCoinToken(
        uint256 amountCoinDesired,
        uint256 amountTokenDesired,
        uint256 amountCoinMin,
        uint256 amountTokenMin,
        uint256 deadline
    ) external returns(uint256 amountCoin, uint256 amountToken, uint256 liquidity) {
        delete addedToken;
        delete addedCoin; 
        
        IERC20(token).approve(address(router), amountTokenDesired);
        IUSDT(coin).approve(address(router), amountCoinDesired);

        require(IERC20(coin).allowance(address(this), address(router)) >= amountCoinDesired, "Insufficient coin allowance");
        require(IUSDT(token).allowance(address(this), address(router)) >= amountTokenDesired, "Insufficient token allowance");

        (amountCoin, amountToken, liquidity) = router.addLiquidity(
            coin,
            token,
            amountCoinDesired,
            amountTokenDesired,
            amountCoinMin,
            amountTokenMin,
            msg.sender,
            deadline
        );
        addedToken = amountToken;
        addedCoin = amountCoin; 
        IERC20(token).transfer(msg.sender, amountTokenDesired - amountToken);
        IUSDT(coin).transfer(msg.sender, amountCoinDesired - amountCoin);
    }

    function addLiqudityCoin(uint256 coinAmount) external returns(uint256 amountCoin, uint256 amountToken, uint256 liquidity) {
        delete addedToken;
        delete addedCoin; 

        uint224 coinIn = compute(coinAmount);

        IUSDT(coin).approve(address(router), coinAmount);

        address[] memory path = new address[](2);
        path[0] = coin;
        path[1] = token;

        uint[] memory amounts = router.swapExactTokensForTokens(coinIn, 0, path, address(this), block.timestamp + 120);

        IERC20(token).approve(address(router), amounts[1]);

        (amountCoin, amountToken, liquidity) = router.addLiquidity(
            coin,
            token,
            amounts[0],
            amounts[1],
            0,
            0,
            msg.sender,
            block.timestamp + 120
        );
        addedToken = amountToken;
        addedCoin = amountCoin; 
    }

    function compute(uint256 coinAmount) internal view returns(uint224 coinIn) {
        (uint256 reserveToken, uint256 reserveCoin) = UniswapV2Library.getReserves(address(factory), token, coin);
        unchecked {
            uint256 numerator = (Math.sqrt(4 * reserveCoin * reserveCoin * reserveToken +
                        8 * coinAmount * reserveCoin * reserveToken * reserveToken)) -
                            2 * reserveCoin * reserveToken;
            uint256 denominator = 2 * reserveToken;

            coinIn = uint224(UQ112x112.encode(uint112(numerator)).uqdiv(uint112(denominator))) >> 112;
        }
    }

    function getPriceChainlink(address priceFeed) external returns(int price) {
        oracleChainlink.setPriceFeed(priceFeed);

        price = oracleChainlink.getPrice();
    }

    function getInfoPair() view external returns(uint reserveA, uint reserveB) {
        (reserveA, reserveB) = UniswapV2Library.getReserves(address(factory), address(coin), address(token));
    }
}