require("@nomicfoundation/hardhat-toolbox");
const parse = require("env-file-reader").parse
const { task } = require("hardhat/config");
const utils = require("./scripts/utils.js")
const processSubmissions = require('./scripts/mint_nfts.js').processSubmissions
const storeNFT = require('./scripts/mint_nfts.js').storeNFT

const envs = parse('.env')
const ALCHEMY_API_KEY = envs.ALCHEMY_API_KEY
const PRIVATE_KEY = envs.PRIVATE_KEY
const CONTRACT_ADDRESS = envs.CONTRACT_ADDRESS

task('metadata', 'Gets the metadata url of the specified token')
  .addParam('token', 'The token number')
  .setAction(async (args, hre) => {
    await utils.getTokenMetadataURL(hre, CONTRACT_ADDRESS, args.token)
})

task('batchMint', 'Mints all NFTs')
  .addParam('fp', 'File path of driver file')
  .setAction(async (args, hre) => {
    await processSubmissions(hre, args.fp, CONTRACT_ADDRESS)
  })

task('mint', 'Mints a single NFT')
  .addParam('fp', 'File path of image')
  .addParam('ext', 'File extension type')
  .addParam('artworkname', 'Name of artwork')
  .addParam('description', 'Description of artwork')
  .addParam('artistname', 'Name of artist')
  .setAction(async (args, hre) => {
    const CryptoCuseNFT = await hre.ethers.getContractFactory('CryptoCuseNFT')
    const cryptoCuseNFT = await CryptoCuseNFT.attach(CONTRACT_ADDRESS)
    const metadataURI = await storeNFT(args.fp, args.ext, args.artworkname, args.artistname, args.description)
    const tokenId = await cryptoCuseNFT.mint(metadataURI)
    await tokenId.wait()
    console.log(`Successfully minted token: ${args.artworkname}`)
  })

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
    }
  }
};
