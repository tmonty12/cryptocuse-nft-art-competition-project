const path = require("node:path")
const parse = require("env-file-reader").parse
const NFTStorage = require("nft.storage").NFTStorage
const File = require("nft.storage").File
const fs = require("node:fs");
const fetch = require("node-fetch")

const NFT_STORAGE_API_KEY = parse('.env').NFT_STORAGE_API_KEY

const validFileExt = {
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif'
}

async  function storeNFT(fp, fileExt, artworkName, artistName, description) {
    const nft = {
        image: new File([await fs.promises.readFile(fp)], path.basename(fp), {
            type: validFileExt[fileExt]
        }),
        name: artworkName,
        description,
        attributes: [
          {
            "trait_type": "Artist",
            "value": artistName
          }
        ]
    }
    
    const client = new NFTStorage({ token: NFT_STORAGE_API_KEY })
    const metadata = await client.store(nft)
    console.log(`Successfully stored metadata for: ${artworkName}`)
    
    return metadata.url 
}

module.exports.processSubmissions = async (hre, fp, contractAddress) => {
  const CryptoCuseNFT = await hre.ethers.getContractFactory('CryptoCuseNFT')
  const cryptoCuseNFT = await CryptoCuseNFT.attach(contractAddress)

  let lines = await fs.promises.readFile(fp, 'utf-8')
  lines = lines.split('\n')
  lines.shift()
  for (let line of lines) {
    line = line.split(',')
    const fp = path.join('./artwork', line[4])
    const fileExt = line[4].split('.')[1]
    const fileExtIsValid = Object.keys(validFileExt).indexOf(fileExt) != -1
    const fileExists = fs.existsSync(fp)
    if (fileExists && fileExtIsValid) {
      const metadataURI = await storeNFT(fp, fileExt, line[5], line[2], line[6])
      const tokenId1 = await cryptoCuseNFT.mint(metadataURI)
      await tokenId1.wait()
      console.log(`Successfully minted first token: ${line[5]}`)
      const tokenId2 = await cryptoCuseNFT.mint(metadataURI)
      await tokenId2.wait()
      console.log(`Successfully minted second token: ${line[5]}`)
    } else if (!fileExtIsValid) {
      console.log('File must have extensions: .png, .jpg of .gif')
    } else {
      console.log(`No file exists at path: ${fp}`)
    } 
  }
}

module.exports.storeNFT = storeNFT