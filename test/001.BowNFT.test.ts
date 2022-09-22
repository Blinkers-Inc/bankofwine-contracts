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

  describe("Validation", () => {
    it("Read : name : Success✅", async () => {
      const name = await bowNFT.name();
      expect(name).to.equal("Bank of Wine Token");
    });

    it("Read : symbol : Success✅", async () => {
      const symbol = await bowNFT.symbol();
      expect(symbol).to.equal("BOWT");
    });

    it("Read : hasRole : Success✅", async () => {
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

  describe("Transaction : safeMint", () => {
    it("Transaction : safeMint : Success✅ : Start tokenId from 1", async () => {
      const safeMintTx = await bowNFT
        .connect(admin)
        .safeMint(admin.address, "www.bow.com/1", 100_000);
      await safeMintTx.wait();

      const balanceOf = await bowNFT.balanceOf(admin.address);
      expect(balanceOf).to.equal(1);

      const ownerOf = await bowNFT.ownerOf(1);
      expect(ownerOf).to.equal(admin.address);

      const tokenURI = await bowNFT.tokenURI(1);
      expect(tokenURI).to.equal("www.bow.com/1");

      const LWIN = await bowNFT.LWIN(1);
      expect(LWIN).to.equal(100_000);

      const lengthOfTokenIdsByLWIN = await bowNFT.lengthOfTokenIdsByLWIN(
        100_000
      );
      expect(lengthOfTokenIdsByLWIN).to.equal(1);

      const tokenIdByLWIN = await bowNFT.tokenIdByLWIN(100_000, 0);
      expect(tokenIdByLWIN).to.equal(1);
    });

    it("Transaction : safeMint : Success✅ : tokenId 2", async () => {
      const safeMintTx = await bowNFT
        .connect(admin)
        .safeMint(admin.address, "www.bow.com/2", 100_000);
      await safeMintTx.wait();

      const balanceOf = await bowNFT.balanceOf(admin.address);
      expect(balanceOf).to.equal(2);

      const ownerOf = await bowNFT.ownerOf(2);
      expect(ownerOf).to.equal(admin.address);

      const tokenURI = await bowNFT.tokenURI(2);
      expect(tokenURI).to.equal("www.bow.com/2");

      const LWIN = await bowNFT.LWIN(2);
      expect(LWIN).to.equal(100_000);

      const lengthOfTokenIdsByLWIN = await bowNFT.lengthOfTokenIdsByLWIN(
        100_000
      );
      expect(lengthOfTokenIdsByLWIN).to.equal(2);

      const tokenIdByLWIN = await bowNFT.tokenIdByLWIN(100_000, 1);
      expect(tokenIdByLWIN).to.equal(2);
    });

    it("Transaction : safeMint : Failed❌ : AccessControl error : only minter role available", async () => {
      const safeMintTx = bowNFT
        .connect(one)
        .safeMint(one.address, "www.bow.com/3", 100_000);

      await expect(safeMintTx).to.revertedWith(
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
      );
    });

    it("Transaction : grantRole : Success✅ : Give MINTER_ROLE to one address", async () => {
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

    it("Transaction : safeMint : Success✅ : tokenId 3 : one address also can mint by self", async () => {
      const safeMintTx = await bowNFT
        .connect(one)
        .safeMint(one.address, "www.bow.com/3", 100_000);
      await safeMintTx.wait();

      const balanceOf = await bowNFT.balanceOf(one.address);
      expect(balanceOf).to.equal(1);

      const ownerOf = await bowNFT.ownerOf(3);
      expect(ownerOf).to.equal(one.address);

      const tokenURI = await bowNFT.tokenURI(3);
      expect(tokenURI).to.equal("www.bow.com/3");

      const LWIN = await bowNFT.LWIN(3);
      expect(LWIN).to.equal(100_000);

      const lengthOfTokenIdsByLWIN = await bowNFT.lengthOfTokenIdsByLWIN(
        100_000
      );
      expect(lengthOfTokenIdsByLWIN).to.equal(3);

      const tokenIdByLWIN = await bowNFT.tokenIdByLWIN(100_000, 2);
      expect(tokenIdByLWIN).to.equal(3);
    });
  });

  describe("Transaction : setLWIN", () => {
    it("Transaction : setLWIN : Failed❌ : AccessControl error : only admin role available", async () => {
      const setLWINTx = bowNFT.connect(one).setLWIN(1, 200_000);

      await expect(setLWINTx).to.reverted;
    });

    it("Transaction : setLWIN : Failed❌ : invalid token id", async () => {
      const setLWINTx = bowNFT.connect(admin).setLWIN(4, 200_000);

      await expect(setLWINTx).to.revertedWith("invalid token id");
    });

    it("Transaction : setLWIN : Success✅", async () => {
      const setLWINTx = await bowNFT.connect(admin).setLWIN(1, 200_000);
      await setLWINTx.wait();

      const LWIN1 = await bowNFT.LWIN(1);
      expect(LWIN1).to.equal(200_000);

      const lengthOfTokenIdsByLWIN200000 = await bowNFT.lengthOfTokenIdsByLWIN(
        200_000
      );
      expect(lengthOfTokenIdsByLWIN200000).to.equal(1);

      const lengthOfTokenIdsByLWIN100000 = await bowNFT.lengthOfTokenIdsByLWIN(
        100_000
      );
      expect(lengthOfTokenIdsByLWIN100000).to.equal(2);

      const tokenIdByLWIN200000index0 = await bowNFT.tokenIdByLWIN(200_000, 0);
      expect(tokenIdByLWIN200000index0).to.equal(1);

      const tokenIdByLWIN100000index0 = await bowNFT.tokenIdByLWIN(100_000, 0);
      expect(Number(tokenIdByLWIN100000index0)).to.oneOf([2, 3]);

      const tokenIdByLWIN100000index1 = await bowNFT.tokenIdByLWIN(100_000, 1);
      expect(Number(tokenIdByLWIN100000index1)).to.oneOf([2, 3]);
    });
  });

  describe("Transaction : setTokenURI", () => {
    it("Transaction : setTokenURI : Failed❌ : AccessControl error : only admin role available", async () => {
      const setTokenURITx = bowNFT.connect(one).setTokenURI(1, "www.new.com/1");

      await expect(setTokenURITx).to.reverted;
    });

    it("Transaction : setTokenURI : Failed❌ : ERC721URIStorage: URI set of nonexistent token", async () => {
      const setTokenURITx = bowNFT
        .connect(admin)
        .setTokenURI(4, "www.new.com/1");

      await expect(setTokenURITx).to.revertedWith(
        "ERC721URIStorage: URI set of nonexistent token"
      );
    });

    it("Transaction : setTokenURI : Success✅", async () => {
      const preTokenURI = await bowNFT.tokenURI(1);
      expect(preTokenURI).to.equal("www.bow.com/1");

      const setTokenURITx = await bowNFT
        .connect(admin)
        .setTokenURI(1, "www.new.com/1");
      await setTokenURITx.wait();

      const curTokenURI = await bowNFT.tokenURI(1);
      expect(curTokenURI).to.equal("www.new.com/1");
    });
  });

  describe("Transaction : burn", () => {
    it("Transaction : burn : Failed❌ : ERC721: caller is not token owner nor approved", async () => {
      const burnTx = bowNFT.connect(one).burn(1);

      await expect(burnTx).to.revertedWith(
        "ERC721: caller is not token owner nor approved"
      );
    });

    it("Transaction : burn : Success✅", async () => {
      const preTotalSupply = await bowNFT.totalSupply();
      expect(preTotalSupply).to.equal(3);

      const preLengthOfTokenIdsByLWIN200000 =
        await bowNFT.lengthOfTokenIdsByLWIN(200_000);
      expect(preLengthOfTokenIdsByLWIN200000).to.equal(1);

      const preTokenIdByLWIN200000index0 = await bowNFT.tokenIdByLWIN(
        200_000,
        0
      );
      expect(preTokenIdByLWIN200000index0).to.equal(1);

      const burnTx = await bowNFT.connect(admin).burn(1);
      await burnTx.wait();

      const curTotalSupply = await bowNFT.totalSupply();
      expect(curTotalSupply).to.equal(2);

      const curLengthOfTokenIdsByLWIN200000 =
        await bowNFT.lengthOfTokenIdsByLWIN(200_000);
      expect(curLengthOfTokenIdsByLWIN200000).to.equal(0);

      const curTokenIdByLWIN200000index0 = bowNFT.tokenIdByLWIN(200_000, 0);
      await expect(curTokenIdByLWIN200000index0).to.revertedWithPanic("0x32");
    });
  });
});
