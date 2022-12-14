import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("002.BowMNFT : soul-bound NFT", async () => {
  const minterRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MINTER_ROLE")
  );
  let admin: SignerWithAddress, one: SignerWithAddress, two: SignerWithAddress;
  let bowMNFT: Contract;

  before(async () => {
    [admin, one, two] = await ethers.getSigners();
    console.log(`🔱 Deploying contracts with the account: ${admin.address}`);

    const BowMNFT = await ethers.getContractFactory("BowMNFT");
    bowMNFT = await BowMNFT.deploy(
      "Bank of Wine Memory Token",
      "B.O.W M-NFT",
      "https://for-test-migration-mnft.s3.ap-northeast-2.amazonaws.com/"
    );
    await bowMNFT.deployed();
  });

  describe("Validations", () => {
    it("Read : name : Success✅", async () => {
      const name = await bowMNFT.name();
      expect(name).to.equal("Bank of Wine Memory Token");
    });

    it("Read : symbol : Success✅", async () => {
      const symbol = await bowMNFT.symbol();
      expect(symbol).to.equal("B.O.W M-NFT");
    });

    it("Read : hasRole : Success✅", async () => {
      const hasMinterRoleAdminAddress = await bowMNFT.hasRole(
        minterRole,
        admin.address
      );
      expect(hasMinterRoleAdminAddress).to.equal(true);

      const hasMinterRoleOneAddress = await bowMNFT.hasRole(
        minterRole,
        one.address
      );
      expect(hasMinterRoleOneAddress).to.equal(false);
    });

    it("Read : baseURI : Success✅", async () => {
      const baseURI = await bowMNFT.baseURI();
      expect(baseURI).to.equal(
        "https://for-test-migration-mnft.s3.ap-northeast-2.amazonaws.com/"
      );
    });

    it("Read : supportsInterface : Success✅ : support IERC5192 => 0xb45a3c0e", async () => {
      const interfaceId = "0xb45a3c0e"; // IERC5192
      const supportsInterface = await bowMNFT.supportsInterface(interfaceId);
      expect(supportsInterface).to.equal(true);
    });
  });

  describe("Transaction : safeMint", () => {
    it("Transaction : safeMint : Success✅ : Start tokenId from 1", async () => {
      const safeMintTx = await bowMNFT.connect(admin).safeMint(admin.address);
      await safeMintTx.wait();

      const balanceOf = await bowMNFT.balanceOf(admin.address);
      expect(balanceOf).to.equal(1);

      const ownerOf = await bowMNFT.ownerOf(1);
      expect(ownerOf).to.equal(admin.address);

      const tokenURI = await bowMNFT.tokenURI(1);
      expect(tokenURI).to.equal(
        "https://for-test-migration-mnft.s3.ap-northeast-2.amazonaws.com/1.json"
      );
    });

    it("Transaction : safeMint : Success✅ : tokenId 2", async () => {
      const safeMintTx = await bowMNFT.connect(admin).safeMint(admin.address);
      await safeMintTx.wait();

      const balanceOf = await bowMNFT.balanceOf(admin.address);
      expect(balanceOf).to.equal(2);

      const ownerOf = await bowMNFT.ownerOf(2);
      expect(ownerOf).to.equal(admin.address);

      const tokenURI = await bowMNFT.tokenURI(2);
      expect(tokenURI).to.equal(
        "https://for-test-migration-mnft.s3.ap-northeast-2.amazonaws.com/2.json"
      );
    });

    it("Transaction : safeMint : Failed❌ : AccessControl error", async () => {
      const safeMintTx = bowMNFT.connect(one).safeMint(one.address);

      await expect(safeMintTx).to.revertedWith(
        `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
      );
    });

    it("Transaction : grantRole : Success✅ : Give MINTER_ROLE to one address", async () => {
      const grantRoleTx = bowMNFT
        .connect(admin)
        .grantRole(minterRole, one.address);

      await expect(grantRoleTx)
        .to.emit(bowMNFT, "RoleGranted")
        .withArgs(minterRole, one.address, admin.address);

      const hasMinterRoleOneAddress = await bowMNFT.hasRole(
        minterRole,
        one.address
      );
      expect(hasMinterRoleOneAddress).to.equal(true);
    });

    it("Transaction : safeMint : Success✅ : tokenId 3 : one address also can mint by self", async () => {
      const safeMintTx = await bowMNFT.connect(one).safeMint(admin.address);
      await safeMintTx.wait();

      const balanceOf = await bowMNFT.balanceOf(admin.address);
      expect(balanceOf).to.equal(3);

      const ownerOf = await bowMNFT.ownerOf(3);
      expect(ownerOf).to.equal(admin.address);

      const tokenURI = await bowMNFT.tokenURI(3);
      expect(tokenURI).to.equal(
        "https://for-test-migration-mnft.s3.ap-northeast-2.amazonaws.com/3.json"
      );
    });
  });

  describe("Transaction : transfer", () => {
    it("Transaction : transferFrom : Failed❌ : Token is soul-bound and cannot be transferred", async () => {
      const transferFromTx = bowMNFT
        .connect(admin)
        .transferFrom(admin.address, one.address, 1);

      await expect(transferFromTx).to.revertedWith(
        "Token is soul-bound and cannot be transferred"
      );
    });

    it("Transaction : safeTransferFrom : Failed❌ : Token is soul-bound and cannot be transferred", async () => {
      const safeTransferFromTx = bowMNFT
        .connect(admin)
        ["safeTransferFrom(address,address,uint256)"](
          admin.address,
          one.address,
          1
        );

      await expect(safeTransferFromTx).to.revertedWith(
        "Token is soul-bound and cannot be transferred"
      );
    });

    it("Transaction : safeTransferFrom : Failed❌ : Token is soul-bound and cannot be transferred", async () => {
      const safeTransferFromTx = bowMNFT
        .connect(admin)
        ["safeTransferFrom(address,address,uint256,bytes)"](
          admin.address,
          one.address,
          1,
          ethers.utils.formatBytes32String("")
        );

      await expect(safeTransferFromTx).to.revertedWith(
        "Token is soul-bound and cannot be transferred"
      );
    });

    it("Transaction : setTransferPermission : Success✅ : Only admin available", async () => {
      const preHasTransferPermission = await bowMNFT.locked(1);
      expect(preHasTransferPermission).to.equal(true);

      const setLockTx = bowMNFT.connect(admin).setLock(false);

      await expect(setLockTx).to.emit(bowMNFT, "Unlocked").withArgs(0);

      const curHasTransferPermission = await bowMNFT.locked(1);
      expect(curHasTransferPermission).to.equal(false);
    });

    it("Transaction : transferFrom : Success✅", async () => {
      const transferFromTx = bowMNFT
        .connect(admin)
        .transferFrom(admin.address, one.address, 1);

      await expect(transferFromTx)
        .to.emit(bowMNFT, "Transfer")
        .withArgs(admin.address, one.address, 1);
    });

    it("Transaction : safeTransferFrom : Success✅", async () => {
      const safeTransferFromTx = bowMNFT
        .connect(admin)
        ["safeTransferFrom(address,address,uint256)"](
          admin.address,
          one.address,
          2
        );

      await expect(safeTransferFromTx)
        .to.emit(bowMNFT, "Transfer")
        .withArgs(admin.address, one.address, 2);
    });

    it("Transaction : safeTransferFrom : Success✅", async () => {
      const safeTransferFromTx = bowMNFT
        .connect(admin)
        ["safeTransferFrom(address,address,uint256,bytes)"](
          admin.address,
          one.address,
          3,
          ethers.utils.formatBytes32String("")
        );

      await expect(safeTransferFromTx)
        .to.emit(bowMNFT, "Transfer")
        .withArgs(admin.address, one.address, 3);
    });

    it("Verification : one address have 3 nfts", async () => {
      const balanceOf = await bowMNFT.balanceOf(one.address);
      expect(balanceOf).to.equal(3);
    });
  });
});
