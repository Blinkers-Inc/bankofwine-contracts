import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("001.BowNFT", async () => {
  const minterRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MINTER_ROLE")
  );

  let admin: SignerWithAddress, one: SignerWithAddress, two: SignerWithAddress;
  let bowNFT: Contract;

  before(async () => {
    [admin, one, two] = await ethers.getSigners();
    console.log(`🔱 Deploying contracts with the account: ${admin.address}`);

    const BowNFT = await ethers.getContractFactory("BowNFT");
    bowNFT = await BowNFT.deploy("Bank of Wine Token", "BOWT");
    await bowNFT.deployed();
  });

  describe("Validations", () => {
    it("Function : Read : name : Success✅", async () => {
      const name = await bowNFT.name();
      expect(name).to.equal("Bank of Wine Token");
    });

    it("Function : Read : symbol : Success✅", async () => {
      const symbol = await bowNFT.symbol();
      expect(symbol).to.equal("BOWT");
    });

    it("Function : Read : hasRole : Success✅", async () => {
      const hasMinterRoleAdminAddress = await bowNFT.hasRole(
        minterRole,
        admin.address
      );
      expect(hasMinterRoleAdminAddress).to.equal(true);

      const hasMinterRoleOneAddress = await bowNFT.hasRole(
        minterRole,
        one.address
      );
      expect(hasMinterRoleOneAddress).to.equal(false);
    });
  });

  describe("Transactions", () => {
    it("Function : Transaction : safeMint : Success✅ : Start tokenId from 1", async () => {
      const safeMintTx = await bowNFT
        .connect(admin)
        .safeMint(admin.address, "www.bow.com/1");
      await safeMintTx.wait();

      const balanceOf = await bowNFT.balanceOf(admin.address);
      expect(balanceOf).to.equal(1);

      const ownerOf = await bowNFT.ownerOf(1);
      expect(ownerOf).to.equal(admin.address);

      const tokenURI = await bowNFT.tokenURI(1);
      expect(tokenURI).to.equal("www.bow.com/1");
    });

    it("Function : Transaction : safeMint : Success✅ : tokenId 2", async () => {
      const safeMintTx = await bowNFT
        .connect(admin)
        .safeMint(admin.address, "www.bow.com/2");
      await safeMintTx.wait();

      const balanceOf = await bowNFT.balanceOf(admin.address);
      expect(balanceOf).to.equal(2);

      const ownerOf = await bowNFT.ownerOf(2);
      expect(ownerOf).to.equal(admin.address);

      const tokenURI = await bowNFT.tokenURI(2);
      expect(tokenURI).to.equal("www.bow.com/2");
    });

    it("Function : Transaction : safeMint : Failed❌ : AccessControl error", async () => {
      const safeMintTx = bowNFT
        .connect(one)
        .safeMint(one.address, "www.bow.com/3");

      await expect(safeMintTx).to.revertedWith(
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
      );
    });

    it("Function : Transaction : grantRole : Success✅ : Give MINTER_ROLE to one address", async () => {
      const grantRoleTx = bowNFT
        .connect(admin)
        .grantRole(minterRole, one.address);

      await expect(grantRoleTx)
        .to.emit(bowNFT, "RoleGranted")
        .withArgs(minterRole, one.address, admin.address);

      const hasMinterRoleOneAddress = await bowNFT.hasRole(
        minterRole,
        one.address
      );
      expect(hasMinterRoleOneAddress).to.equal(true);
    });

    it("Function : Transaction : safeMint : Success✅ : tokenId 2 : one address also can mint by self", async () => {
      const safeMintTx = await bowNFT
        .connect(one)
        .safeMint(one.address, "www.bow.com/3");
      await safeMintTx.wait();

      const balanceOf = await bowNFT.balanceOf(one.address);
      expect(balanceOf).to.equal(1);

      const ownerOf = await bowNFT.ownerOf(3);
      expect(ownerOf).to.equal(one.address);

      const tokenURI = await bowNFT.tokenURI(3);
      expect(tokenURI).to.equal("www.bow.com/3");
    });
  });
});
