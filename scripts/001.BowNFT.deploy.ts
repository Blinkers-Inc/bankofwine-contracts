import { ethers } from "hardhat";
import CaverExtKas from "caver-js-ext-kas";
import dotenv from "dotenv";

export const headers = {
  Authorization: process.env.KAS_AUTHORIZATION!,
  "x-chain-id": process.env.KAS_CHAIN_ID!,
  "Content-Type": "application/json",
};

const { KAS_ACCESS_KEY, KAS_SECRET_ACCESS_KEY, KAS_CHAIN_ID } = process.env;

async function main() {
  const [deployer, one] = await ethers.getSigners();
  console.log(`🔱 Deploying contracts with the account: ${deployer.address}`);

  const caver = new CaverExtKas(
    KAS_CHAIN_ID,
    KAS_ACCESS_KEY,
    KAS_SECRET_ACCESS_KEY
  );

  const BowNFT = await ethers.getContractFactory("BowNFT");
  const bowNFT = await BowNFT.deploy("Bank of Wine Token", "BOWT");
  await bowNFT.deployed();

  console.log(`💎 Proxy deployed to: ${bowNFT.address}`);

  const name = await bowNFT.name();
  console.log("name", name);

  const input = await caver.klay.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          type: "address",
          name: "operator",
        },
        { type: "bool", name: "approved" },
      ],
      name: "setApprovalForAll",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    [one.address, "true"]
  );

  console.log("input", input);

  const encodedAbi = bowNFT.interface.encodeFunctionData("setApprovalForAll", [
    one.address,
    true,
  ]);

  const tx = {
    type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
    from: deployer.address,
    to: bowNFT.address,
    value: 0,
    gas: 500000,
    data: encodedAbi,
  };

  const { rawTransaction } = await caver.klay.accounts.signTransaction(
    tx,
    process.env.BAOBAB_PRIVATE_KEY
  );

  console.log("rawTransaction", rawTransaction);

  const result2 =
    await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
      rlp: rawTransaction,
      submit: true,
    });

  console.log("result2 :>> ", result2);

  // const { data: result } = await axios.post(
  //   "https://wallet-api.klaytnapi.com/v2/tx/fd/contract/execute",
  //   body,
  //   { headers }
  // );

  // const txData = {
  //   type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
  //   from: deployer.address,
  //   to: bowNFT.address,
  //   value: 0,
  //   gas: 1_000_000,
  //   data,
  // };

  // const signed2 = await caver.klay.signTransaction(txData);
  // console.log("signed2", signed2);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
