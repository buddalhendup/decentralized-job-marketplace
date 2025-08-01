require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    // To deploy to the Polygon Mumbai testnet, set the following env vars:
    // POLYGON_MUMBAI_RPC_URL and PRIVATE_KEY in .env
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

module.exports = config;
