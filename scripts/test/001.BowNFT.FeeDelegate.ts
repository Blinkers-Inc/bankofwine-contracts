import { ethers } from "hardhat";
import CaverExtKas from "caver-js-ext-kas";

const {
  KAS_ACCESS_KEY,
  KAS_SECRET_ACCESS_KEY,
  KAS_CHAIN_ID,
  ADMIN_PRIVATE_KEY,
} = process.env;

async function main() {
  const caver = new CaverExtKas(
    KAS_CHAIN_ID,
    KAS_ACCESS_KEY,
    KAS_SECRET_ACCESS_KEY
  );

  const [admin, one, two] = await ethers.getSigners();
  console.log(`🔱 Deploying contracts with the account: ${admin.address}`);

  const BowNFT = await ethers.getContractFactory("BowNFT");
  const bowNFT = await BowNFT.deploy(
    "Bank of Wine Token",
    "B.O.W NFT",
    "https://for-test-migration.s3.ap-northeast-2.amazonaws.com/"
  );
  await bowNFT.deployed();

  console.log(`💎 BowNFT deployed to: ${bowNFT.address}`);

  const name = await bowNFT.name();
  console.log("name", name);

  // const setApprovalForAllAbi = bowNFT
  //   .connect(one)
  //   .interface.encodeFunctionData("setApprovalForAll", [one.address, true]);

  // console.log("setApprovalForAllAbi", setApprovalForAllAbi);

  // const tx = {
  //   type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
  //   from: admin.address,
  //   to: bowNFT.address,
  //   value: 0,
  //   gas: 500000,
  //   data: setApprovalForAllAbi,
  // };

  // const { rawTransaction } = await caver.klay.accounts.signTransaction(
  //   tx,
  //    ADMIN_PRIVATE_KEY
  // );

  // console.log("rawTransaction :>> ", rawTransaction);

  const safeMintAbi = bowNFT.interface // .connect(admin.address)
    .encodeFunctionData("safeMint", [one.address]);

  console.log("safeMintAbi", safeMintAbi);

  const tx = {
    type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
    from: one.address,
    to: bowNFT.address,
    value: 0,
    gas: 500000,
    data: safeMintAbi,
  };

  const { rawTransaction } = await caver.klay.accounts.signTransaction(
    tx,
    "0x67b094b6e27cd318bc2a6e393e0f1bdfe04c3520db002d96cbc2e84c9eec028e"
    //  ADMIN_PRIVATE_KEY
  );

  console.log("rawTransaction", rawTransaction);

  // const result2 =
  //   await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
  //     rlp: rawTransaction,
  //     submit: true,
  //   });

  // console.log("result2 :>> ", result2);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
