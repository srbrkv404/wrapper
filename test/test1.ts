import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const { expect } = require("chai");
const { ethers, network } = require("hardhat");
import { time } from "@nomicfoundation/hardhat-network-helpers";


describe("Wrapper", function (){

    async function deploy() {
        const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
        const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

        const [acc1] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy(ethers.parseEther("100000"));
        await token.waitForDeployment();

        const tokenAddress = await token.getAddress();

        const ChainlinkOracle = await ethers.getContractFactory("ChainlinkOracle");
        const chainlinkOracle = await ChainlinkOracle.deploy();
        await chainlinkOracle.waitForDeployment();

        const chainlinkOracleAddress = await token.getAddress();

        const usdt = await ethers.getContractAt("IERC20", usdtAddress);

        const Wrapper = await ethers.getContractFactory("Wrapper");
        const wrapper = await Wrapper.deploy(tokenAddress, usdtAddress, factoryAddress, routerAddress, chainlinkOracleAddress);
        await wrapper.waitForDeployment();

        return { acc1, wrapper, token, usdt, chainlinkOracle}
    }

    describe("Deployment", function() {
        it("Should be deployed", async function() {
            const {acc1, wrapper } = await loadFixture(deploy);
            expect(wrapper.target).to.be.properAddress;
        }).timeout(1000000);
    });

    describe("Add liqudity", function() {
        it("Should add liq with coin and token", async function() {
            const {acc1, wrapper, token , usdt, chainlinkOracle } = await loadFixture(deploy);

            const btcUsdtPriceFeed = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
            const usdt_holder = "0x974CaA59e49682CdA0AD2bbe82983419A2ECC400";
            
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [usdt_holder],
            });

            const holder = await ethers.getSigner(usdt_holder);
            await usdt.connect(holder).transfer(acc1.address, ethers.parseUnits("2000000", 6));

            // price
            await chainlinkOracle.setPriceFeed(btcUsdtPriceFeed);
            const priceBtcUsdt = await chainlinkOracle.getPrice();
            
            // add liq
            const convertedPriceBTCUSDT = Math.round(Number(priceBtcUsdt) / 10 ** 8);
            const coinAmount1 = convertedPriceBTCUSDT * 10 ** 7;
            const tokenAmount1 = ethers.parseEther("10");

            const wrapperAddress = await wrapper.getAddress();
            await usdt.transfer(wrapperAddress, coinAmount1);
            await token.transfer(wrapperAddress, tokenAmount1);

            const deadline = await time.latest() + 120;
            await wrapper.addLiqudityCoinToken(coinAmount1, tokenAmount1, 0, 0, deadline);

            await expect(await wrapper.addedToken()).to.equal(tokenAmount1);
            await expect(await wrapper.addedCoin()).to.equal(coinAmount1);
            
            const coinAmount2 = convertedPriceBTCUSDT * 10 ** 7 / 2;
            const tokenAmount2 = ethers.parseEther("10");

            await usdt.transfer(wrapperAddress, coinAmount2);
            await token.transfer(wrapperAddress, tokenAmount2);

            await wrapper.addLiqudityCoinToken(coinAmount2, tokenAmount2, 0, 0, deadline);

            await expect(await wrapper.addedCoin()).to.equal(coinAmount2);
            await expect(await wrapper.addedToken()).to.be.lessThan(tokenAmount2);

            await expect((await wrapper.getInfoPair())[0]).to.equal(coinAmount1 + coinAmount2);
            await expect((await wrapper.getInfoPair())[0]).to.be.lessThan(tokenAmount1 + tokenAmount2);

        }).timeout(1000000);

        it("Should add liq with coin", async function() {
            const {acc1, wrapper, token , usdt, chainlinkOracle } = await loadFixture(deploy);

            const btcUsdtPriceFeed = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
            const usdt_holder = "0x974CaA59e49682CdA0AD2bbe82983419A2ECC400";
            
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [usdt_holder],
            });

            const holder = await ethers.getSigner(usdt_holder);
            await usdt.connect(holder).transfer(acc1.address, ethers.parseUnits("2000000", 6));
            
            // price
            await chainlinkOracle.setPriceFeed(btcUsdtPriceFeed);
            const priceBtcUsdt = await chainlinkOracle.getPrice();
            
            // add liq init
            const convertedPriceBTCUSDT = Math.round(Number(priceBtcUsdt) / 10 ** 8);
            const coinAmount1 = convertedPriceBTCUSDT * 10 ** 7;
            const tokenAmount1 = ethers.parseEther("10");

            const wrapperAddress = await wrapper.getAddress();
            await usdt.transfer(wrapperAddress, coinAmount1);
            await token.transfer(wrapperAddress, tokenAmount1);

            const deadline = await time.latest() + 120;
            await wrapper.addLiqudityCoinToken(coinAmount1, tokenAmount1, 0, 0, deadline);

            const info1 = await wrapper.getInfoPair();
            console.log("info1", info1[0], info1[1]);
            
            // add liq with coin
            const coinAmount2 = convertedPriceBTCUSDT * 10 ** 7;

            await usdt.transfer(wrapperAddress, coinAmount2);

            await wrapper.addLiqudityCoin(coinAmount2);
            
            const info2 = await wrapper.getInfoPair();
            console.log("info2", info2[0], info2[1]);

            await expect(await wrapper.addedCoin()).to.lessThan(coinAmount2);
            await expect(await wrapper.addedToken()).to.be.greaterThan(0);

            await expect((await wrapper.getInfoPair())[0]).to.be.lessThan(coinAmount1 + coinAmount2);
            await expect((await wrapper.getInfoPair())[1]).to.be.lessThan(tokenAmount1 + tokenAmount1);
            

        }).timeout(1000000);
    });

});
