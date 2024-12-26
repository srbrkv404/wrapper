import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const { expect } = require("chai");
const { ethers, network } = require("hardhat");


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
            console.log(acc1.address);
            expect(wrapper.target).to.be.properAddress;
        }).timeout(1000000);
    });

    describe("Work", function() {
        it("Should work", async function() {
            const {acc1} = await loadFixture(deploy);

            const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
            const usdt_holder = "0x974CaA59e49682CdA0AD2bbe82983419A2ECC400";
            
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [usdt_holder],
            });
            
            const holder = await ethers.getSigner(usdt_holder);
            const usdt = await ethers.getContractAt("IERC20", usdtAddress);

            console.log(await usdt.balanceOf(usdt_holder));
            console.log(await usdt.balanceOf(acc1.address));

            await usdt.connect(holder).transfer(acc1.address, ethers.parseUnits("1000", 6));

            console.log(await usdt.balanceOf(usdt_holder));
            console.log(await usdt.balanceOf(acc1.address));

        }).timeout(1000000);
    });

});
