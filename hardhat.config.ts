import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-web3";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.16",
  networks: {
    baobab: {
      accounts: [
        process.env.ADMIN_PRIVATE_KEY!,
        process.env.TEST_KEY_ONE!,
        process.env.TEST_KEY_TWO!,
      ],
      chainId: Number(process.env.KAS_CHAIN_ID)!,
      gasPrice: 250_000_000_000,
      url: "https://api.baobab.klaytn.net:8651",
    },
    cypress: {
      accounts: [
        process.env.ADMIN_PRIVATE_KEY!,
        process.env.TEST_KEY_ONE!,
        process.env.TEST_KEY_TWO!,
      ],
      chainId: Number(process.env.KAS_CHAIN_ID)!,
      gasPrice: 250_000_000_000,
      url: "https://public-node-api.klaytnapi.com/v1/cypress",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS !== undefined,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
