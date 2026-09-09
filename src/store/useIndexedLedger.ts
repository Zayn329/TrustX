import { useState, useEffect } from 'react';
import { useTrust } from './TrustContext';
import { BlockchainEvent } from '../domain/types';

export function useIndexedLedger() {
  const { blockchainEvents } = useTrust();
  const [indexedEvents, setIndexedEvents] = useState<BlockchainEvent[]>(blockchainEvents);
  const [isIndexing, setIsIndexing] = useState(false);

  useEffect(() => {
    setIsIndexing(true);
    const timer = setTimeout(() => {
      setIndexedEvents(blockchainEvents);
      setIsIndexing(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [blockchainEvents]);

  return {
    indexedEvents,
    isIndexing
  };
}
