const hre = require("hardhat");
const ethers = require("hardhat");

async function main_() {
    const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const Token = await hre.ethers.getContractFactory("Token");
    const token = await Token.deploy(ethers.parseEther("100000"));
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    const Oracle = await hre.ethers.getContractFactory("ChainlinkOracle");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();

    const usdt = await ethers.getContractAt("IERC20", usdtAddress);

    const Wrapper = await hre.ethers.getContractFactory("Wrapper");
    const wrapper = await Wrapper.deploy(tokenAddress, usdtAddress, factoryAddress, routerAddress, oracleAddress);
    await wrapper.waitForDeployment();

    console.log("Wrapper contract deployed.");
}

main_().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 