require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.0", // Match your Solidity version
  networks: {
    rinkeby: {
      url: "https://eth-sepolia.g.alchemy.com/v2/VU-f8ADqGdf6XSq5udSpPiW4SWkNljy_", // Replace with your Infura project URL
      accounts: [`0x${VU-f8ADqGdf6XSq5udSpPiW4SWkNljy_}`], // Replace with your Ethereum private key
    },
  },
};
