import '@testing-library/jest-dom';

/**
 * Global JSDOM Web Crypto API and EIP-1193 Ethereum Provider Test Environment Setup.
 */

// Ensure Web Crypto API stub exists for JSDOM test suite
if (typeof window !== 'undefined') {
  if (!window.crypto) {
    // @ts-ignore
    window.crypto = {};
  }

  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
      if (array && 'length' in array) {
        const bytes = array as unknown as Uint8Array;
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = Math.floor(Math.random() * 256);
        }
      }
      return array;
    };
  }

  if (!window.crypto.subtle) {
    // @ts-ignore
    window.crypto.subtle = {
      digest: async (_algorithm: string | Algorithm, data: BufferSource): Promise<ArrayBuffer> => {
        const buffer = data instanceof ArrayBuffer ? data : data.buffer;
        const view = new Uint8Array(buffer);
        let hash = 0;
        for (let i = 0; i < view.length; i++) {
          hash = (hash << 5) - hash + view[i];
          hash |= 0;
        }
        const result = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          result[i] = (hash >> ((i % 4) * 8)) & 0xff;
        }
        return result.buffer;
      },
      importKey: async () => ({ type: 'secret', extractable: false, algorithm: { name: 'AES-GCM' }, usages: ['encrypt'] }),
      encrypt: async () => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer
    };
  }

  // Provide mock EIP-1193 Ethereum provider for test execution
  if (!window.ethereum) {
    window.ethereum = {
      request: async ({ method }: { method: string; params?: unknown[] }): Promise<unknown> => {
        switch (method) {
          case 'eth_accounts':
          case 'eth_requestAccounts':
            return ['0x71c89a42e12bA901C48812C41022031a002a71f0'];
          case 'eth_sendTransaction':
            return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          case 'eth_signTypedData_v4':
            return '0x' + Array.from({ length: 130 }, () => 'a').join('');
          default:
            return null;
        }
      },
      on: () => {}
    };
  }
}
