// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CryptoCuseNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;
    address public owner;

    constructor() ERC721("CryptoCuse NFT Design Competition", "CC") {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == owner, "You are not the owner of this contract");
        _;
    }

    function transferOwnership(address _newOwner) isOwner external {
        owner = _newOwner;
    }

    function mint(string memory tokenURI) isOwner public returns (uint256) {
        currentTokenId.increment();
        uint256 tokenId = currentTokenId.current();
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
}