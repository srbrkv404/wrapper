import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat"

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
      hardhat: {
        forking: {
          url: "https://mainnet.infura.io/v3/90ce7ccc69b54f33bb3dacc001bfc489",
        },
      },
    },
};

export default config;
