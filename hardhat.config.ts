import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-web3";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

console.log("process.env.BAOBAB_PRIVATE_KEY", process.env.BAOBAB_PRIVATE_KEY);

const config: HardhatUserConfig = {
  solidity: "0.8.13",
  networks: {
    baobab: {
      accounts: [process.env.BAOBAB_PRIVATE_KEY!, process.env.TEST_KEY_1!],
      chainId: 1001,
      gasPrice: 250_000_000_000,
      url: "https://api.baobab.klaytn.net:8651",
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
