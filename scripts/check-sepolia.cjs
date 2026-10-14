require('./load-env.cjs');
const { ethers } = require('ethers');

const required = (name) => {
  const value = process.env[name];
  if (!value || /YOUR_|111111|222222|333333|444444|555555|your_|placeholder/i.test(value)) {
    throw new Error(`${name} must contain a real Sepolia value`);
  }
  return value;
};

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || required('VITE_RPC_URL');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  if (network.chainId !== 11155111n) throw new Error(`Expected Sepolia chain ID 11155111, received ${network.chainId}`);

  const addresses = {
    TrustBountyEscrow: required('VITE_TRUST_BOUNTY_ESCROW_ADDRESS'),
    ReputationRegistry: required('VITE_REPUTATION_REGISTRY_ADDRESS'),
    DisputeArbitration: required('VITE_DISPUTE_ARBITRATION_ADDRESS'),
    ProofRegistry: required('VITE_PROOF_REGISTRY_ADDRESS')
  };
  const bytecode = {};
  for (const [name, address] of Object.entries(addresses)) {
    const code = await provider.getCode(address);
    if (code === '0x') throw new Error(`${name} has no bytecode at ${address}`);
    bytecode[name] = code.length;
  }

  const escrowCounter = await new ethers.Contract(
    addresses.TrustBountyEscrow,
    ['function escrowCounter() view returns (uint256)'],
    provider
  ).escrowCounter();

  console.log(JSON.stringify({
    network: 'sepolia',
    chainId: network.chainId.toString(),
    addresses,
    bytecodeLength: bytecode,
    escrowCounter: escrowCounter.toString(),
    ready: true
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
