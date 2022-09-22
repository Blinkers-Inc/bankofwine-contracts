// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract BowNFT is
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    AccessControl
{
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    Counters.Counter private _tokenIdCounter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    mapping(uint256 => uint256) private LWINByTokenId;
    mapping(uint256 => EnumerableSet.UintSet) private tokenIdsByLWIN;

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        _tokenIdCounter.increment();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function safeMint(
        address _to,
        string memory _uri,
        uint256 _LWIN
    ) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _uri);
        LWINByTokenId[tokenId] = _LWIN;
        tokenIdsByLWIN[_LWIN].add(tokenId);
    }

    function burn(uint256 _tokenId) public override {
        super.burn(_tokenId);

        uint256 curLWIN = LWINByTokenId[_tokenId];

        tokenIdsByLWIN[curLWIN].remove(_tokenId);
        delete LWINByTokenId[_tokenId];
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setTokenURI(tokenId, _tokenURI);
    }

    function setLWIN(uint256 _tokenId, uint256 _LWIN)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(LWINByTokenId[_tokenId] != 0, "invalid token id");

        uint256 preLWIN = LWINByTokenId[_tokenId];

        tokenIdsByLWIN[preLWIN].remove(_tokenId);
        tokenIdsByLWIN[_LWIN].add(_tokenId);
        LWINByTokenId[_tokenId] = _LWIN;
    }

    function LWIN(uint256 _tokenId) public view returns (uint256) {
        require(LWINByTokenId[_tokenId] != 0, "invalid token id");

        return LWINByTokenId[_tokenId];
    }

    function lengthOfTokenIdsByLWIN(uint256 _LWIN)
        public
        view
        returns (uint256)
    {
        return tokenIdsByLWIN[_LWIN].length();
    }

    function tokenIdByLWIN(uint256 _LWIN, uint256 _index)
        public
        view
        returns (uint256)
    {
        return tokenIdsByLWIN[_LWIN].at(_index);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}
