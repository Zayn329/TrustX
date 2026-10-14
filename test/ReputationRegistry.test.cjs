const assert = require('node:assert/strict');
const { ethers } = require('hardhat');

describe('ReputationRegistry', function () {
  it('allows the configured verifier and rejects an unrelated writer', async function () {
    const [owner, verifier, other] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory('ReputationRegistry');
    const registry = await Registry.deploy(verifier.address);

    await registry.connect(verifier).updateReputation('did:trust:researcher', 3);
    const record = await registry.getReputation('did:trust:researcher');
    assert.equal(record.trustScore, 53n);
    assert.equal(record.verifiedCount, 1n);
    await assert.rejects(
      registry.connect(other).updateReputation('did:trust:researcher', 3),
      /not authorized/
    );
    assert.equal(await registry.owner(), owner.address);
  });
});
