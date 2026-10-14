import { useState, useEffect } from 'react';
import { useTrust } from './TrustContext';
import { BlockchainEvent } from '../domain/types';
import { queryLiveEscrowEvents } from '../blockchain/escrowEvents';

const envSubgraph = typeof process !== 'undefined' && process.env?.VITE_SUBGRAPH_ENDPOINT
  ? process.env.VITE_SUBGRAPH_ENDPOINT
  : (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUBGRAPH_ENDPOINT;

export const SUBGRAPH_ENDPOINT = envSubgraph || 'https://api.studio.thegraph.com/query/trust-engine/v1.0.0';

export async function queryCanonicalEscrowEvents(): Promise<BlockchainEvent[] | null> {
  try {
    return await queryLiveEscrowEvents();
  } catch {
    return null;
  }
}

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
  const [indexedEvents, setIndexedEvents] = useState<BlockchainEvent[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);

  useEffect(() => {
    setIsIndexing(true);
    let isMounted = true;

    queryCanonicalEscrowEvents().then((liveEvents) => {
      if (isMounted) {
        if (liveEvents && liveEvents.length > 0) {
          setIndexedEvents(liveEvents);
        } else {
          // A failed canonical read is not replaced with local events that look confirmed.
          setIndexedEvents([]);
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
    querySubgraphEvents,
    queryCanonicalEscrowEvents
  };
}
