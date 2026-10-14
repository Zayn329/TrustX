const assert = require('node:assert/strict');
const { ethers } = require('hardhat');

describe('ProofRegistry', function () {
  it('anchors a signed proof once and emits its evidence metadata', async function () {
    const [researcher] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory('ProofRegistry');
    const registry = await Registry.deploy();
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes('proof payload'));
    const nonce = 7;
    const signature = await researcher.signTypedData(
      {
        name: 'Trust Engine Protocol',
        version: '1.0',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await registry.getAddress()
      },
      {
        ProofAnchor: [
          { name: 'researcherDid', type: 'string' },
          { name: 'bountyId', type: 'string' },
          { name: 'proofHash', type: 'bytes32' },
          { name: 'nonce', type: 'uint256' }
        ]
      },
      { researcherDid: 'did:trust:researcher', bountyId: '101', proofHash, nonce }
    );

    await assert.doesNotReject(
      registry.anchorProof(101, proofHash, 'did:trust:researcher', signature, nonce)
    );
    assert.equal(await registry.anchoredProofs(proofHash), true);
    await assert.rejects(
      registry.anchorProof(101, proofHash, 'did:trust:researcher', signature, nonce),
      /Proof already anchored/
    );
    assert.ok(researcher.address);
  });
});
