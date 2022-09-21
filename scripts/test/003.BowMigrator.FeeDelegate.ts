import { ethers } from "hardhat";
import CaverExtKas from "caver-js-ext-kas";
import { ZERO_ADDRESS } from "../../helpers/constant";

const {
  BAOBAB_KAS_CHAIN_ID,
  BAOBAB_KAS_ACCESS_KEY,
  BAOBAB_KAS_SECRET_ACCESS_KEY,
  BAOBAB_ADMIN_PRIVATE_KEY,
} = process.env;

async function main() {
  const caver = new CaverExtKas(
    BAOBAB_KAS_CHAIN_ID,
    BAOBAB_KAS_ACCESS_KEY,
    BAOBAB_KAS_SECRET_ACCESS_KEY
  );

  const [admin, one, two] = await ethers.getSigners();
  console.log(`🔱 Deploying contracts with the account: ${admin.address}`);

  const PreNFT = await ethers.getContractFactory("BowNFT");
  const preNFT = await PreNFT.deploy("Pre token", "PRET");
  await preNFT.deployed();
  console.log(`💎 PreNFT deployed to: ${preNFT.address}`);

  const BowNFT = await ethers.getContractFactory("BowNFT");
  const bowNFT = await BowNFT.deploy("Bank of Wine Token", "BOWT");
  await bowNFT.deployed();
  console.log(`💎 BowNFT deployed to: ${bowNFT.address}`);

  const BowMNFT = await ethers.getContractFactory("BowMNFT");
  const bowMNFT = await BowMNFT.deploy("Bank of Wine Token", "BOWT");
  await bowMNFT.deployed();
  console.log(`💎 BowMNFT deployed to: ${bowMNFT.address}`);

  const BowMigrator = await ethers.getContractFactory("BowMigrator");
  const bowMigrator = await BowMigrator.deploy(
    preNFT.address,
    bowNFT.address,
    bowMNFT.address
  );
  await bowMigrator.deployed();
  console.log(`💎 BowMigrator deployed to: ${bowMigrator.address}`);

  // Validations
  const order0 = await bowMigrator.getNFTAddress(0);
  console.log("order0 === preNFT.address", order0 === preNFT.address);

  const order1 = await bowMigrator.getNFTAddress(1);
  console.log("order1 === bowNFT.address", order1 === bowNFT.address);

  const order2 = await bowMigrator.getNFTAddress(2);
  console.log("order2 === bowMNFT.address", order2 === bowMNFT.address);

  const order3 = await bowMigrator.getNFTAddress(3);
  console.log("order3 === ZERO_ADDRESS", order3 === ZERO_ADDRESS);

  //- 1. Mint preNFT to admin (1~6)

  for (let i = 1; i <= 6; i++) {
    const safeMintAbi = preNFT
      .connect(admin)
      .interface.encodeFunctionData("safeMint", [
        admin.address,
        `www.bow.com${i}`,
      ]);

    const tx1 = {
      type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
      from: admin.address,
      to: preNFT.address,
      value: 0,
      gas: 500000,
      data: safeMintAbi,
    };

    const { rawTransaction } = await caver.klay.accounts.signTransaction(
      tx1,
      BAOBAB_ADMIN_PRIVATE_KEY
    );

    console.log("rawTransaction", rawTransaction);

    const result =
      await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
        rlp: rawTransaction,
        submit: true,
      });

    console.log("result :>> ", result);
  }

  //- 2. test migrate (Failed❌ : Not approved yet - to migrator)

  const migrateTestAbi = bowMigrator
    .connect(admin)
    .interface.encodeFunctionData("migrate", ["1", false]);

  console.log("migrateTestAbi :>> ", migrateTestAbi);

  const tx2 = {
    type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
    from: admin.address,
    to: bowMigrator.address,
    value: 0,
    gas: 100_000_000,
    data: migrateTestAbi,
  };

  const { rawTransaction: rawTransaction2 } =
    await caver.klay.accounts.signTransaction(tx2, BAOBAB_ADMIN_PRIVATE_KEY);

  console.log("rawTransaction2", rawTransaction2);

  const result2 =
    await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
      rlp: rawTransaction2,
      submit: true,
    });

  console.log("result2 :>> ", result2);

  //- 3. PreNFT - setApprovalForAll(migrator.address, true)

  const preIsApprovedForAll = await preNFT.isApprovedForAll(
    admin.address,
    bowMigrator.address
  );
  console.log("preIsApprovedForAll === false", preIsApprovedForAll === false);

  const setApprovalForAllAbi = preNFT
    .connect(admin)
    .interface.encodeFunctionData("setApprovalForAll", [
      bowMigrator.address,
      true,
    ]);

  const tx3 = {
    type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
    from: admin.address,
    to: preNFT.address,
    value: 0,
    gas: 100_000_000,
    data: setApprovalForAllAbi,
  };

  const { rawTransaction: rawTransaction3 } =
    await caver.klay.accounts.signTransaction(tx3, BAOBAB_ADMIN_PRIVATE_KEY);

  console.log("rawTransaction3", rawTransaction3);

  const result3 =
    await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
      rlp: rawTransaction3,
      submit: true,
    });

  console.log("result3 :>> ", result3);

  const curIsApprovedForAll = await preNFT.isApprovedForAll(
    admin.address,
    bowMigrator.address
  );

  console.log("curIsApprovedForAll === true", curIsApprovedForAll === true);

  //- 4. test migrate (Failed❌ : AccessControl error : no access control for safeMint : bowNFT, bowMNFT both)

  for (let i = 1; i <= 6; i++) {
    const isMNFT = i % 2 === 0;

    const migrateAbi = bowMigrator
      .connect(admin)
      .interface.encodeFunctionData("migrate", [i, isMNFT]);

    const tx1 = {
      type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
      from: admin.address,
      to: bowMigrator.address,
      value: 0,
      gas: 100_000_000,
      data: migrateAbi,
    };

    const { rawTransaction } = await caver.klay.accounts.signTransaction(
      tx1,
      BAOBAB_ADMIN_PRIVATE_KEY
    );

    console.log("rawTransaction", rawTransaction);

    const result =
      await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
        rlp: rawTransaction,
        submit: true,
      });

    console.log("result :>> ", result);
  }

  // - 5. Set role - MINTER_ROLE : bowNFT

  const minterRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MINTER_ROLE")
  );

  const grantNFTMinterRoleAbi = bowNFT
    .connect(admin)
    .interface.encodeFunctionData("grantRole", [
      minterRole,
      bowMigrator.address,
    ]);

  const txToNFT = {
    type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
    from: admin.address,
    to: bowNFT.address,
    value: 0,
    gas: 100_000_000,
    data: grantNFTMinterRoleAbi,
  };

  const { rawTransaction: rawTransactionNFTMinterRole } =
    await caver.klay.accounts.signTransaction(
      txToNFT,
      BAOBAB_ADMIN_PRIVATE_KEY
    );

  console.log("rawTransactionNFTMinterRole", rawTransactionNFTMinterRole);

  const resultGrantNFTMinterRole =
    await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
      rlp: rawTransactionNFTMinterRole,
      submit: true,
    });

  console.log("resultGrantNFTMinterRole :>> ", resultGrantNFTMinterRole);

  // - 6. Set role - MINTER_ROLE : bowMNFT

  const grantMNFTMinterRoleAbi = bowMNFT
    .connect(admin)
    .interface.encodeFunctionData("grantRole", [
      minterRole,
      bowMigrator.address,
    ]);

  const txToMNFT = {
    type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
    from: admin.address,
    to: bowMNFT.address,
    value: 0,
    gas: 100_000_000,
    data: grantMNFTMinterRoleAbi,
  };

  const { rawTransaction: rawTransactionMNFTMinterRole } =
    await caver.klay.accounts.signTransaction(
      txToMNFT,
      BAOBAB_ADMIN_PRIVATE_KEY
    );

  console.log("rawTransactionMNFTMinterRole", rawTransactionMNFTMinterRole);

  const resultGrantMNFTMinterRole =
    await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
      rlp: rawTransactionMNFTMinterRole,
      submit: true,
    });

  console.log("resultGrantMNFTMinterRole :>> ", resultGrantMNFTMinterRole);

  //- 7. test migrate (Success✅)

  for (let i = 1; i <= 6; i++) {
    const isMNFT = i % 2 === 0;

    const migrateAbi = bowMigrator
      .connect(admin)
      .interface.encodeFunctionData("migrate", [i, isMNFT]);

    const tx1 = {
      type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
      from: admin.address,
      to: bowMigrator.address,
      value: 0,
      gas: 100_000_000,
      data: migrateAbi,
    };

    const { rawTransaction } = await caver.klay.accounts.signTransaction(
      tx1,
      BAOBAB_ADMIN_PRIVATE_KEY
    );

    console.log("rawTransaction", rawTransaction);

    const result =
      await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({
        rlp: rawTransaction,
        submit: true,
      });

    console.log("result :>> ", result);
  }

  console.log(`💎 PreNFT deployed to: ${preNFT.address}`);
  console.log(`💎 BowNFT deployed to: ${bowNFT.address}`);
  console.log(`💎 BowMNFT deployed to: ${bowMNFT.address}`);
  console.log(`💎 BowMigrator deployed to: ${bowMigrator.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
