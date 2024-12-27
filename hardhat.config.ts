import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat"

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
      hardhat: {
        forking: {
          url: "https://magical-intensive-wish.quiknode.pro/5e8c939e3710ffe62ab21ed84cd882dbb1b0b05f",
        },
      },
    },
};

export default config;
