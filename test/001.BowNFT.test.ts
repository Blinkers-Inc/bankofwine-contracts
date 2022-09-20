import { expect } from "chai";
import CaverExtKas from "caver-js-ext-kas";
import Caver from "caver-js";
import { Contract } from "ethers";
import { ethers, web3 } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { KAS_ACCESS_KEY, KAS_SECRET_ACCESS_KEY, KAS_CHAIN_ID } = process.env;

describe("001.BowNFT", async () => {
  const caver = new CaverExtKas(
    KAS_CHAIN_ID,
    KAS_ACCESS_KEY,
    KAS_SECRET_ACCESS_KEY
  );
  const caver2 = new Caver("https://api.baobab.klaytn.net:8651/");
  let deployer: SignerWithAddress, one: SignerWithAddress;
  let bowNFT: Contract;

  before(async () => {
    [deployer, one] = await ethers.getSigners();
    console.log(`🔱 Deploying contracts with the account: ${deployer.address}`);

    const BowNFT = await ethers.getContractFactory("BowNFT");
    bowNFT = await BowNFT.deploy("Bank of Wine Token", "BOWT");
    await bowNFT.deployed();
  });

  describe("Validations", () => {
    it("Function : Read : name : success", async () => {
      const greet = await bowNFT.name();
      expect(greet).to.equal("Bank of Wine Token");
    });

    it("Function : Read : symbol : success", async () => {
      const greet = await bowNFT.symbol();
      expect(greet).to.equal("BOWT");

      const data2 = caver2.klay.abi.encodeFunctionCall(
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

      console.log("data2", data2);

      const txData = {
        type: "FEE_DELEGATED_SMART_CONTRACT_EXECUTION",
        from: deployer.address,
        to: bowNFT.address,
        value: 0,
        gas: 1_000_000,
        data: data2,
      };

      const signed2 = await caver2.klay.signTransaction(txData);
      console.log("signed2", signed2);

      // const signed = await caver.rpc.klay.signTransaction(txData);
      // console.log("signed", signed);
    });
  });
});
