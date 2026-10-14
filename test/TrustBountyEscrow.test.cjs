const assert = require('node:assert/strict');
const { ethers } = require('hardhat');

describe('TrustBountyEscrow', function () {
  async function deploy() {
    const Factory = await ethers.getContractFactory('TrustBountyEscrow');
    return Factory.deploy();
  }

  it('creates an ETH escrow and stores the funding event data', async function () {
    const [company] = await ethers.getSigners();
    const escrow = await deploy();
    const amount = ethers.parseEther('0.01');

    const receipt = await (await escrow.connect(company).createEscrow(101, { value: amount })).wait();
    assert.equal(await escrow.escrowCounter(), 1n);
    const stored = await escrow.escrows(1);

    assert.equal(stored.bountyId, 101n);
    assert.equal(stored.companyAddress, company.address);
    assert.equal(stored.amount, amount);
    assert.equal(stored.status, 0n);
    assert.ok(receipt.logs.length > 0);
  });

  it('allows only the funding company to release and rejects a zero payout address', async function () {
    const [company, researcher, other] = await ethers.getSigners();
    const escrow = await deploy();
    await escrow.connect(company).createEscrow(101, { value: ethers.parseEther('0.01') });

    await assert.rejects(
      escrow.connect(other).releaseEscrow(1, researcher.address),
      /Only company can release escrow/
    );
    await assert.rejects(
      escrow.connect(company).releaseEscrow(1, ethers.ZeroAddress),
      /Invalid researcher address/
    );

    await escrow.connect(company).releaseEscrow(1, researcher.address);
    const stored = await escrow.escrows(1);
    assert.equal(stored.researcherAddress, researcher.address);
    assert.equal(stored.status, 2n);
    await assert.rejects(
      escrow.connect(company).releaseEscrow(1, researcher.address),
      /Invalid escrow status/
    );
  });

  it('records a dispute and rejects unknown escrow IDs', async function () {
    const [company, other] = await ethers.getSigners();
    const escrow = await deploy();
    await escrow.connect(company).createEscrow(202, { value: ethers.parseEther('0.01') });

    await escrow.connect(other).raiseDispute(1);
    const stored = await escrow.escrows(1);
    assert.equal(stored.status, 3n);
    await assert.rejects(
      escrow.connect(other).raiseDispute(999),
      /Escrow does not exist/
    );
  });
});
