// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./BowNFT.sol";

contract BowMigrator is AccessControl {
    bytes32 public constant MIGRATOR_ROLE = keccak256("MIGRATOR_ROLE");

    ERC721 private preNFT;
    BowNFT private bowNFT;
    BowNFT private bowMNFT;

    event Migrate(address indexed owner, uint256 tokenId, bool isMNFT);
    event SetNFTAddress(uint256 indexed order, address NFTAddress);

    constructor(
        address _preNFTAddress,
        address _NFTAddress,
        address _MNFTAddress
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MIGRATOR_ROLE, msg.sender);
        preNFT = ERC721(_preNFTAddress);
        bowNFT = BowNFT(_NFTAddress);
        bowMNFT = BowNFT(_MNFTAddress);
    }

    function getNFTAddress(uint256 _order) public view returns (address) {
        if (_order == 0) {
            return address(preNFT);
        } else if (_order == 1) {
            return address(bowNFT);
        } else if (_order == 2) {
            return address(bowMNFT);
        } else {
            return address(0);
        }
    }

    function setNFTAddress(uint256 _order, address _NFTAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (_order == 0) {
            preNFT = ERC721(_NFTAddress);
        } else if (_order == 1) {
            bowNFT = BowNFT(_NFTAddress);
        } else if (_order == 2) {
            bowMNFT = BowNFT(_NFTAddress);
        } else {
            revert("Exceed order");
        }

        emit SetNFTAddress(_order, _NFTAddress);
    }

    function migrate(
        address _owner,
        uint256 _tokenId,
        bool _isMNFT
    ) external {
        require(preNFT.ownerOf(_tokenId) == _owner, "Not owner");

        preNFT.safeTransferFrom(_owner, address(this), _tokenId);

        string memory tokenURI = preNFT.tokenURI(_tokenId);

        if (_isMNFT) {
            bowMNFT.safeMint(_owner, tokenURI);
        } else {
            bowNFT.safeMint(_owner, tokenURI);
        }

        emit Migrate(_owner, _tokenId, _isMNFT);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
