import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Trust Engine UI Integration & Navigation', () => {
  it('renders application header and default Dashboard view', () => {
    render(<App />);

    expect(screen.getAllByText('Trust Engine').length).toBeGreaterThan(0);
    expect(screen.getByText('Trustless Bug Bounty Platform')).toBeTruthy();
    expect(screen.getByText('Researcher Trust Score')).toBeTruthy();
  });

  it('navigates to Bounty Marketplace view when clicked', () => {
    render(<App />);

    const bountyTabs = screen.getAllByRole('button', { name: /Bounty Marketplace/i });
    fireEvent.click(bountyTabs[0]);

    expect(screen.getByText('Bug Bounty Marketplace')).toBeTruthy();
    expect(screen.getByPlaceholderText(/Search bounties.../i)).toBeTruthy();
  });

  it('navigates to Trust Passport view when clicked', () => {
    render(<App />);

    const passportTabs = screen.getAllByRole('button', { name: /Trust Passport/i });
    fireEvent.click(passportTabs[0]);

    expect(screen.getAllByText('Alex Rivera').length).toBeGreaterThan(0);
    expect(screen.getByText('Verified Security Researcher')).toBeTruthy();
  });

  it('navigates to Contribution Explorer view when clicked', () => {
    render(<App />);

    const explorerTabs = screen.getAllByRole('button', { name: /Contribution Explorer/i });
    fireEvent.click(explorerTabs[0]);

    expect(screen.getAllByText('Contribution Audit Explorer').length).toBeGreaterThan(0);
  });

  it('navigates to Trust Graph view when clicked', () => {
    render(<App />);

    const graphTabs = screen.getAllByRole('button', { name: /Trust Graph/i });
    fireEvent.click(graphTabs[0]);

    expect(screen.getAllByText('Interactive Trust Graph').length).toBeGreaterThan(0);
  });

  it('navigates to Network & Ledger view when clicked', () => {
    render(<App />);

    const networkTabs = screen.getAllByRole('button', { name: /Network & Ledger/i });
    fireEvent.click(networkTabs[0]);

    expect(screen.getAllByText('Network & Protocol Monitor').length).toBeGreaterThan(0);
  });
});
