import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ZERO_ADDRESS } from "../helpers/constant";

describe("003.BowMigrator", async () => {
  const minterRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MINTER_ROLE")
  );

  let admin: SignerWithAddress, one: SignerWithAddress, two: SignerWithAddress;
  let preNFT: Contract,
    bowNFT: Contract,
    bowMNFT: Contract,
    bowMigrator: Contract;

  before(async () => {
    [admin, one, two] = await ethers.getSigners();
    console.log(`🔱 Deploying contracts with the account: ${admin.address}`);

    const PreNFT = await ethers.getContractFactory("BowNFT");
    preNFT = await PreNFT.deploy("Pre token", "PRET");
    await preNFT.deployed();

    const BowNFT = await ethers.getContractFactory("BowNFT");
    bowNFT = await BowNFT.deploy("Bank of Wine Token", "BOWT");
    await bowNFT.deployed();

    const BowMNFT = await ethers.getContractFactory("BowMNFT");
    bowMNFT = await BowMNFT.deploy("Bank of Wine Token", "BOWT");
    await bowMNFT.deployed();

    const BowMigrator = await ethers.getContractFactory("BowMigrator");
    bowMigrator = await BowMigrator.deploy(
      preNFT.address,
      bowNFT.address,
      bowMNFT.address
    );
    await bowMigrator.deployed();
  });

  describe("Validations", () => {
    it("Read : getNFTAddress : Success✅", async () => {
      const order0 = await bowMigrator.getNFTAddress(0);
      expect(order0).to.equal(preNFT.address);

      const order1 = await bowMigrator.getNFTAddress(1);
      expect(order1).to.equal(bowNFT.address);

      const order2 = await bowMigrator.getNFTAddress(2);
      expect(order2).to.equal(bowMNFT.address);

      const order3 = await bowMigrator.getNFTAddress(3);
      expect(order3).to.equal(ZERO_ADDRESS);
    });
  });

  describe("Transaction : safeMint : to prepare migration", () => {
    it("Transaction : preNFT : safeMint : Success✅ : admin - preNFT - 1,2,3,4,5,6", async () => {
      for (let i = 1; i <= 6; i++) {
        const safeMintTx = preNFT
          .connect(admin)
          .safeMint(admin.address, `www.bow.com/${i}`);

        await expect(safeMintTx)
          .to.emit(preNFT, "Transfer")
          .withArgs(ZERO_ADDRESS, admin.address, i);

        const balanceOf = await preNFT.balanceOf(admin.address);
        expect(balanceOf).to.equal(i);

        const ownerOf = await preNFT.ownerOf(i);
        expect(ownerOf).to.equal(admin.address);

        const tokenURI = await preNFT.tokenURI(i);
        expect(tokenURI).to.equal(`www.bow.com/${i}`);
      }
    });
  });

  describe("Transaction : migrate", () => {
    it("Transaction : get Approval : to migrator contract : Success✅", async () => {
      const preIsApprovedForAll = await preNFT.isApprovedForAll(
        admin.address,
        bowMigrator.address
      );
      expect(preIsApprovedForAll).to.equal(false);

      const setApprovalForAllTx = preNFT
        .connect(admin)
        .setApprovalForAll(bowMigrator.address, true);

      await expect(setApprovalForAllTx)
        .to.emit(preNFT, "ApprovalForAll")
        .withArgs(admin.address, bowMigrator.address, true);

      const curIsApprovedForAll = await preNFT.isApprovedForAll(
        admin.address,
        bowMigrator.address
      );
      expect(curIsApprovedForAll).to.equal(true);
    });

    it("Transaction : migrate : migrator : Failed❌ : AccessControl error", async () => {
      for (let i = 1; i <= 6; i++) {
        const isMNFT = i % 2 === 0;
        const migrateTx = bowMigrator.connect(admin).migrate(i, isMNFT);

        await expect(migrateTx).to.reverted;
        // await expect(migrateTx).to.revertedWith(
        //   "AccessControl: account 0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
        // );
      }
    });

    it("Transaction : grantRole : bowNFT : Success✅ : Give MINTER_ROLE to bow migrator address", async () => {
      const grantRoleTx = bowNFT
        .connect(admin)
        .grantRole(minterRole, bowMigrator.address);

      await expect(grantRoleTx)
        .to.emit(bowNFT, "RoleGranted")
        .withArgs(minterRole, bowMigrator.address, admin.address);

      const hasMinterRoleMigratorAddress = await bowNFT.hasRole(
        minterRole,
        bowMigrator.address
      );
      expect(hasMinterRoleMigratorAddress).to.equal(true);
    });

    it("Transaction : grantRole : bowMNFT : Success✅ : Give MINTER_ROLE to bowMigrator address", async () => {
      const grantRoleTx = bowMNFT
        .connect(admin)
        .grantRole(minterRole, bowMigrator.address);

      await expect(grantRoleTx)
        .to.emit(bowMNFT, "RoleGranted")
        .withArgs(minterRole, bowMigrator.address, admin.address);

      const hasMinterRoleMigratorAddress = await bowMNFT.hasRole(
        minterRole,
        bowMigrator.address
      );
      expect(hasMinterRoleMigratorAddress).to.equal(true);
    });

    it("Transaction : migrate : migrator : Success✅ : Odd is NFT, Even is MNFT", async () => {
      for (let i = 1; i <= 6; i++) {
        const isMNFT = i % 2 === 0;
        const migrateTx = bowMigrator.connect(admin).migrate(i, isMNFT);

        await expect(migrateTx)
          .to.emit(bowMigrator, "Migrate")
          .withArgs(admin.address, i, isMNFT);
      }
    });
  });

  describe("Verification", () => {
    it("Verification : 1,3,5 is new NFT / 2,4,6 is new MNFT", async () => {
      const nfts = [1, 3, 5];
      const mnfts = [2, 4, 6];

      for (let i = 1; i <= 3; i++) {
        const ownerOfNFT = await bowNFT.ownerOf(i);
        expect(ownerOfNFT).to.equal(admin.address);

        const tokenURINFT = await bowNFT.tokenURI(i);
        expect(tokenURINFT).to.equal(`www.bow.com/${nfts[i - 1]}`);

        const ownerOfMNFT = await bowMNFT.ownerOf(i);
        expect(ownerOfMNFT).to.equal(admin.address);

        const tokenURIMNFT = await bowMNFT.tokenURI(i);
        expect(tokenURIMNFT).to.equal(`www.bow.com/${mnfts[i - 1]}`);
      }

      const balanceOfNFT = await bowNFT.balanceOf(admin.address);
      expect(balanceOfNFT).to.equal(3);

      const balanceOfMNFT = await bowMNFT.balanceOf(admin.address);
      expect(balanceOfMNFT).to.equal(3);
    });
  });

  describe("Transaction : transferPreNFT", () => {
    it("Transaction : transferPreNFT : Failed❌ : AccessControl error", async () => {
      const transferPreNFTTx = bowMigrator
        .connect(one)
        .transferPreNFT(two.address, 1);

      await expect(transferPreNFTTx).to.reverted;
    });

    it("Transaction : transferPreNFT : Success✅ : only admin role available", async () => {
      const transferPreNFTTx = bowMigrator
        .connect(admin)
        .transferPreNFT(two.address, 1);

      await expect(transferPreNFTTx)
        .to.emit(preNFT, "Transfer")
        .withArgs(bowMigrator.address, two.address, 1);
    });
  });
});
