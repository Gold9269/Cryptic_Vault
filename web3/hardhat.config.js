require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    // Local Hardhat network configuration
    hardhat: {
      chainId: 31337, // Hardhat's default chain ID
      // Optional: You can configure mining behavior
      mining: {
        auto: true, // Automatically mine blocks
        interval: 5000 // Or mine a block every 5 seconds
      }
    },
    // Keep your existing Sepolia config
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  // Optional: Default task configuration
  defaultNetwork: "hardhat", // Default network when not specified
};