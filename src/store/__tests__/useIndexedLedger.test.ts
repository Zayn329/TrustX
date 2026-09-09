import { describe, it, expect } from 'vitest';
import { querySubgraphEvents, SUBGRAPH_ENDPOINT } from '../useIndexedLedger';

describe('useIndexedLedger (GraphQL Indexer Client)', () => {
  it('exports valid Subgraph Studio query endpoint string', () => {
    expect(SUBGRAPH_ENDPOINT).toContain('https://api.studio.thegraph.com/query/trust-engine');
  });

  it('handles unconfigured or unreachable GraphQL endpoint returning null fallback gracefully', async () => {
    const result = await querySubgraphEvents('https://invalid-subgraph-domain-123456.com/graphql');
    expect(result).toBeNull();
  });
});
