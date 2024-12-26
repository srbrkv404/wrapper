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

        const usdt = await ethers.getContractAt("IERC20", usdtAddress);

        const Wrapper = await ethers.getContractFactory("Wrapper");
        const wrapper = await Wrapper.deploy(tokenAddress, usdtAddress, factoryAddress, routerAddress);
        await wrapper.waitForDeployment();

        return { acc1, wrapper, token, usdt}
    }

    describe("Deployment", function() {
        it("Should be deployed", async function() {
            const {acc1, wrapper } = await loadFixture(deploy);
            expect(wrapper.target).to.be.properAddress;
        }).timeout(1000000);
    });

    describe("Work", function() {
        it("Should work", async function() {
            const {acc1, wrapper, token , usdt } = await loadFixture(deploy);

            const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
            const usdt_holder = "0x974CaA59e49682CdA0AD2bbe82983419A2ECC400";
            
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [usdt_holder],
            });
            
            const holder = await ethers.getSigner(usdt_holder);

            await usdt.connect(holder).transfer(acc1.address, ethers.parseUnits("100000", 6));

            const coinAmount = ethers.parseUnits("100000", 6);
            const tokenAmount = ethers.parseEther("1");

            const wrapperAddress = await wrapper.getAddress();
            await usdt.transfer(wrapperAddress, coinAmount);
            await token.transfer(wrapperAddress, tokenAmount);

            const deadline = await time.latest() + 120;

            const a1 = await wrapper.addLiqudityCoinToken(coinAmount, tokenAmount, 0, 0, deadline);
            console.log(a1);

        }).timeout(1000000);
    });

});
