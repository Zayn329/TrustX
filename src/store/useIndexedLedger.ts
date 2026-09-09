import { useState, useEffect } from 'react';
import { useTrust } from './TrustContext';
import { BlockchainEvent } from '../domain/types';

export const SUBGRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/trust-engine/v1.0.0';

export async function querySubgraphEvents(endpoint: string = SUBGRAPH_ENDPOINT): Promise<BlockchainEvent[] | null> {
  const query = `
    query GetLedgerEvents {
      blockchainEvents(first: 20, orderBy: timestamp, orderDirection: desc) {
        id
        txHash
        blockNumber
        eventType
        description
        timestamp
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(1500)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data && Array.isArray(result.data.blockchainEvents)) {
        return result.data.blockchainEvents as BlockchainEvent[];
      }
    }
  } catch {
    // Fallback on network failure or unconfigured endpoint
  }

  return null;
}

export function useIndexedLedger() {
  const { blockchainEvents } = useTrust();
  const [indexedEvents, setIndexedEvents] = useState<BlockchainEvent[]>(blockchainEvents);
  const [isIndexing, setIsIndexing] = useState(false);

  useEffect(() => {
    setIsIndexing(true);
    let isMounted = true;

    querySubgraphEvents().then((liveEvents) => {
      if (isMounted) {
        if (liveEvents && liveEvents.length > 0) {
          setIndexedEvents(liveEvents);
        } else {
          setIndexedEvents(blockchainEvents);
        }
        setIsIndexing(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [blockchainEvents]);

  return {
    indexedEvents,
    isIndexing,
    querySubgraphEvents
  };
}
