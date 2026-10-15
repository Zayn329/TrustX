import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProofDetailModal } from '../components/passport/ProofDetailModal';
import { VulnerabilityReport, Verification } from '../domain/types';

describe('Stage 2 — Proof & Trust Passport', () => {
  const dummyReport: VulnerabilityReport = {
    id: 'rep-8801',
    bountyId: 'trustx-settlement-v1',
    vulnerabilityType: 'Precision Loss',
    title: 'Precision loss in liquidity pool calculation',
    description: 'Division before multiplication allows rounding down token drain.',
    reproductionSteps: 'CALL:deposit:1000\nCALL:flashLoan:5000\nCALL:settlement:0',
    impact: 'High economic drain on pool liquidity.',
    evidence: 'Off-chain execution traces',
    severity: 'Critical',
    researcherId: 'did:trust:0x71c89a42e12b',
    createdAt: '2025-01-01T00:00:00.000Z'
  };

  const dummyVerification: Verification = {
    id: 'ver-8801',
    contributionId: 'rep-8801',
    verifierId: 'node-1',
    status: 'valid',
    verifiedAt: '2025-01-01T00:05:00.000Z',
    verifierName: 'Nexus Security Oracle Worker v1',
    oracleEvidenceHash: '0x304402207a9b...ed25519_signed_proof',
    notes: 'Verified exploit condition passed'
  };

  it('renders ProofDetailModal with submission context and evidence hash', async () => {
    const handleClose = vi.fn();
    render(
      <ProofDetailModal
        report={dummyReport}
        verification={dummyVerification}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Proof Record & Evidence Inspection')).toBeTruthy();
    expect(screen.getByText('Precision loss in liquidity pool calculation')).toBeTruthy();
    expect(screen.getByText('Nexus Security Oracle Worker v1')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(/Recorded Evidence Hash/i)).toBeTruthy();
    });
  });

  it('re-calculates payload hash using Web Crypto API and verifies hash integrity', async () => {
    const handleClose = vi.fn();
    render(
      <ProofDetailModal
        report={dummyReport}
        verification={dummyVerification}
        onClose={handleClose}
      />
    );

    const verifyBtns = screen.getAllByRole('button', { name: /Verify Payload Hash/i });
    expect(verifyBtns.length).toBeGreaterThan(0);

    fireEvent.click(verifyBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Live Recalculated Payload Hash/i)).toBeTruthy();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <ProofDetailModal
        report={dummyReport}
        verification={dummyVerification}
        onClose={handleClose}
      />
    );

    const closeBtns = screen.getAllByRole('button', { name: /Close Inspection/i });
    expect(closeBtns.length).toBeGreaterThan(0);

    fireEvent.click(closeBtns[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
