const { ethers } = require("hardhat");

async function main() {
  // Deploying a sample contract (replace with your own)
  const MyContract = await ethers.getContractFactory("Upload"); // Replace with your contract name
  const myContract = await MyContract.deploy();

  await myContract.waitForDeployment();

  console.log("Contract deployed to:", await myContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });