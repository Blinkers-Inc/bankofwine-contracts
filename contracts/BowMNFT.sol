// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./BowNFT.sol";
import "./interfaces/IERC5192.sol";

contract BowMNFT is IERC5192, BowNFT {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    bool private lock;

    modifier transferable(uint256 _tokenId) {
        require(
            locked(_tokenId) == false,
            "Token is soul-bound and cannot be transferred"
        );
        _;
    }

    constructor(string memory _name, string memory _symbol)
        BowNFT(_name, _symbol)
    {
        setLock(true);
    }

    function locked(uint256 _tokenId) public view returns (bool) {
        require(ownerOf(_tokenId) != address(0), "invalid token owner");

        return lock;
    }

    function setLock(bool _lock) public onlyRole(DEFAULT_ADMIN_ROLE) {
        lock = _lock;

        if (lock) {
            emit Locked(0);
        } else {
            emit Unlocked(0);
        }
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public override(ERC721, IERC721) transferable(_tokenId) {
        super.transferFrom(_from, _to, _tokenId);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public override(ERC721, IERC721) transferable(_tokenId) {
        super.safeTransferFrom(_from, _to, _tokenId);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) public override(ERC721, IERC721) transferable(_tokenId) {
        super.safeTransferFrom(_from, _to, _tokenId, _data);
    }

    function supportsInterface(bytes4 _interfaceId)
        public
        view
        override
        returns (bool)
    {
        return
            _interfaceId == type(IERC5192).interfaceId ||
            super.supportsInterface(_interfaceId);
    }
}
