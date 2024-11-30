// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Listing {
        uint price;
        address seller;
    }

    mapping(address => mapping(uint => Listing)) public listings;

    function listNFT(address nftContract, uint tokenId, uint price) external {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than zero");

        nft.transferFrom(msg.sender, address(this), tokenId);
        listings[nftContract][tokenId] = Listing(price, msg.sender);
    }

    function buyNFT(address nftContract, uint tokenId) external payable nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];
        require(msg.value >= listing.price, "Insufficient funds");

        delete listings[nftContract][tokenId];
        payable(listing.seller).transfer(listing.price);

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    }
}
