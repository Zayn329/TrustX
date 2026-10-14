require('./scripts/load-env.cjs');
require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');
const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async ({ solcVersion }, runSuper) => {
  if (solcVersion === '0.8.26') {
    return {
      compilerPath: require.resolve('solc/soljson.js'),
      isSolcJs: true,
      version: '0.8.26',
      longVersion: '0.8.26+commit.8a97fa7a'
    };
  }
  return runSuper();
});

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || process.env.VITE_RPC_URL;
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

module.exports = {
  solidity: {
    version: '0.8.26',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: sepoliaRpcUrl || '',
      chainId: 11155111,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : []
    }
  },
  etherscan: { apiKey: process.env.ETHERSCAN_API_KEY || '' }
};
