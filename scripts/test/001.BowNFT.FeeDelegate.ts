import { ethers } from "hardhat";
import CaverExtKas from "caver-js-ext-kas";

const {
  BAOBAB_KAS_ACCESS_KEY,
  BAOBAB_KAS_SECRET_ACCESS_KEY,
  BAOBAB_KAS_CHAIN_ID,
  BAOBAB_ADMIN_PRIVATE_KEY,
} = process.env;

async function main() {
  const caver = new CaverExtKas(
    BAOBAB_KAS_CHAIN_ID,
    BAOBAB_KAS_ACCESS_KEY,
    BAOBAB_KAS_SECRET_ACCESS_KEY
  );

  const [admin, one] = await ethers.getSigners();
  console.log(`🔱 Deploying contracts with the account: ${admin.address}`);

  const BowNFT = await ethers.getContractFactory("BowNFT");
  const bowNFT = await BowNFT.deploy("Bank of Wine Token", "BOWT");
  await bowNFT.deployed();

  console.log(`💎 BowNFT deployed to: ${bowNFT.address}`);

  const name = await bowNFT.name();
  console.log("name", name);

  const setApprovalForAllAbi = bowNFT
    .connect(one)
    .interface.encodeFunctionData("setApprovalForAll", [one.address, true]);

  console.log("setApprovalForAllAbi", setApprovalForAllAbi);

  const safeMintAbi = bowNFT
    .connect(admin)
    .interface.encodeFunctionData("safeMint", [one.address, "www.bow.com/1"]);

  console.log("safeMintAbi", safeMintAbi);

  const tx = {
    type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
    from: admin.address,
    to: bowNFT.address,
    value: 0,
    gas: 500000,
    data: safeMintAbi,
  };

  const { rawTransaction } = await caver.klay.accounts.signTransaction(
    tx,
    BAOBAB_ADMIN_PRIVATE_KEY
  );

  console.log("rawTransaction", rawTransaction);

  const result2 =
    await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
      rlp: rawTransaction,
      submit: true,
    });

  console.log("result2 :>> ", result2);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
