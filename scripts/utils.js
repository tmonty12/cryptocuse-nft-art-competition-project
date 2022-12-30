const path = require("node:path")
const parse = require("env-file-reader").parse
const NFTStorage = require("nft.storage").NFTStorage
const File = require("nft.storage").File
const fs = require("node:fs")

const NFT_STORAGE_API_KEY = parse('.env').NFT_STORAGE_API_KEY

module.exports.getTokenMetadataURL = async (hre, contractAddress, tokenNumber) => {
  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.attach(contractAddress)

  console.log(await nft.tokenURI(tokenNumber))
}