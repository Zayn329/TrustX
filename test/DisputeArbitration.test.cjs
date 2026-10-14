const assert = require('node:assert/strict');
const { ethers } = require('hardhat');

describe('DisputeArbitration', function () {
  it('requires a created case before accepting a juror vote', async function () {
    const [creator, juror] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('DisputeArbitration');
    const arbitration = await Factory.deploy();

    await assert.rejects(
      arbitration.connect(juror).castVote(7, 1),
      /Dispute case does not exist/
    );
    await arbitration.connect(creator).createCase(7, 42);
    const stored = await arbitration.cases(7);
    assert.equal(stored.disputeId, 7n);
    assert.equal(stored.contributionId, 42n);

    await arbitration.connect(juror).castVote(7, 1);
    assert.equal((await arbitration.cases(7)).votesForResearcher, 1n);
  });
});
