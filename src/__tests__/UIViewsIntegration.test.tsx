import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from '../App';

describe('TrustX authentication entry', () => {
  afterEach(() => cleanup());

  it('renders the sign-in page before an authenticated session exists', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(screen.getByText('Accounts are provisioned by TrustX. Contact your organization administrator if you need access.')).toBeTruthy();
  });

  it('offers distinct Company and Bug Reporter workspace choices without a sign-up control', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Sign in' });
    expect(screen.getByRole('group', { name: 'Workspace type' }).querySelectorAll('button')).toHaveLength(2);
    expect(screen.queryByText(/sign up/i)).toBeNull();
  });
});
