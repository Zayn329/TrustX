require('./load-env.cjs');
const hre = require('hardhat');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for a real Sepolia deployment`);
  return value;
}

async function main() {
  if (!process.env.SEPOLIA_RPC_URL && !process.env.VITE_RPC_URL) {
    throw new Error('SEPOLIA_RPC_URL or VITE_RPC_URL is required for a real Sepolia deployment');
  }
  const privateKey = required('DEPLOYER_PRIVATE_KEY');
  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey) || /^0x0{64}$/.test(privateKey)) {
    throw new Error('DEPLOYER_PRIVATE_KEY must be a 32-byte hex private key');
  }

  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error(`Expected Sepolia chain ID 11155111, received ${network.chainId}`);
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error('No deployer signer configured');
  const verifierAddress = process.env.VERIFIER_ADDRESS || deployer.address;
  if (!hre.ethers.isAddress(verifierAddress) || verifierAddress === hre.ethers.ZeroAddress) {
    throw new Error('VERIFIER_ADDRESS must be a valid non-zero EVM address');
  }

  const deployments = {};
  for (const contractName of ['TrustBountyEscrow', 'ReputationRegistry', 'DisputeArbitration', 'ProofRegistry']) {
    const Factory = await hre.ethers.getContractFactory(contractName);
    const contract = contractName === 'ReputationRegistry'
      ? await Factory.deploy(verifierAddress)
      : await Factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();
    if (!deploymentTx) throw new Error(`${contractName} deployment transaction was not created`);
    const receipt = await deploymentTx.wait();
    if (!receipt) throw new Error(`${contractName} deployment receipt was not available`);
    const bytecode = await hre.ethers.provider.getCode(address);
    if (bytecode === '0x') throw new Error(`${contractName} address has no contract bytecode`);
    deployments[contractName] = {
      address,
      deploymentTxHash: deploymentTx.hash,
      deploymentBlock: receipt.blockNumber
    };
  }

  console.log(JSON.stringify({
    network: 'sepolia',
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    verifier: verifierAddress,
    deployments,
    nextEnvironmentValues: [
      `VITE_TRUST_BOUNTY_ESCROW_ADDRESS=${deployments.TrustBountyEscrow.address}`,
      `VITE_REPUTATION_REGISTRY_ADDRESS=${deployments.ReputationRegistry.address}`,
      `VITE_DISPUTE_ARBITRATION_ADDRESS=${deployments.DisputeArbitration.address}`,
      `VITE_PROOF_REGISTRY_ADDRESS=${deployments.ProofRegistry.address}`
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
