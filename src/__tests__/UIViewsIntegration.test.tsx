import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Trust Engine UI Integration & Navigation', () => {
  it('renders application header and default Dashboard view', () => {
    render(<App />);

    expect(screen.getByText('Trust Engine')).toBeTruthy();
    expect(screen.getByText('Trustless Bug Bounty Platform')).toBeTruthy();
    expect(screen.getByText('Researcher Trust Score')).toBeTruthy();
  });

  it('navigates to Bounty Marketplace view when clicked', () => {
    render(<App />);

    const bountyTab = screen.getByRole('button', { name: /Bounty Marketplace/i });
    fireEvent.click(bountyTab);

    expect(screen.getByText('Bug Bounty Marketplace')).toBeTruthy();
    expect(screen.getByPlaceholderText(/Search bounties.../i)).toBeTruthy();
  });

  it('navigates to Trust Passport view when clicked', () => {
    render(<App />);

    const passportTab = screen.getByRole('button', { name: /Trust Passport/i });
    fireEvent.click(passportTab);

    expect(screen.getAllByText('Alex Rivera').length).toBeGreaterThan(0);
    expect(screen.getByText('Verified Security Researcher')).toBeTruthy();
  });

  it('navigates to Contribution Explorer view when clicked', () => {
    render(<App />);

    const explorerTab = screen.getByRole('button', { name: /Contribution Explorer/i });
    fireEvent.click(explorerTab);

    expect(screen.getByText('Contribution Audit Explorer')).toBeTruthy();
  });

  it('navigates to Trust Graph view when clicked', () => {
    render(<App />);

    const graphTab = screen.getByRole('button', { name: /Trust Graph/i });
    fireEvent.click(graphTab);

    expect(screen.getByText('Interactive Trust Graph')).toBeTruthy();
  });

  it('navigates to Network & Ledger view when clicked', () => {
    render(<App />);

    const networkTab = screen.getByRole('button', { name: /Network & Ledger/i });
    fireEvent.click(networkTab);

    expect(screen.getByText('Network & Protocol Monitor')).toBeTruthy();
  });
});
