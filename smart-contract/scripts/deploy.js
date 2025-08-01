const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  // Fee percentage and fee wallet can be configured via env or defaults
  const feePercent = parseInt(process.env.FEE_PERCENT || '2');
  const feeWallet = process.env.FEE_WALLET || '0x000000000000000000000000000000000000dead';
  console.log('Deploying JobMarketplace with fee', feePercent, '% to wallet', feeWallet);
  const JobMarketplace = await ethers.getContractFactory('JobMarketplace');
  const marketplace = await JobMarketplace.deploy(feePercent, feeWallet);
  await marketplace.deployed();
  console.log('JobMarketplace deployed to:', marketplace.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
