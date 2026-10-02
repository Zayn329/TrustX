import { useState, useEffect } from 'react';
import { WalletState, INITIAL_WALLET_STATE } from './wagmiConfig';
import { Eip712ProofPayload, hashEip712ProofPayload, generateEcdsaSignature } from '../domain/cryptoUtils';
import { isValidEthAddress, isConfiguredChain, blockchainConfig } from './config';
import { walletClient, publicClient } from './viemClient';
import { parseAbiItem, Address, encodeFunctionData, decodeEventLog, createPublicClient, custom } from 'viem';
import { sepolia } from 'viem/chains';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (eventName: string, handler: (params: unknown) => void) => void;
      removeListener?: (eventName: string, handler: (params: unknown) => void) => void;
    };
  }
}

export function useEscrowContract() {
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET_STATE);
  const [isPending, setIsPending] = useState(false);

  // Helper to format wei to ETH with sensible precision
  const formatBalance = (wei: bigint): string => {
    const eth = Number(wei) / 1e18;
    // Show up to 4 decimal places, but trim trailing zeros
    return eth.toFixed(4).replace(/\.?0+$/, '');
  };

  // Helper to fetch ETH balance for an address
  const fetchBalance = async (address: string): Promise<string> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return '0.00';
    }

    try {
      // Specify the return type for eth_getBalance
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      }) as `0x${string}`;

      // Handle case where balanceWei might be null or undefined
      if (balanceWei === null || balanceWei === undefined) {
        return '0.00';
      }
      // balanceWei is a hex string, convert to bigint then format
      const balanceBigInt = BigInt(balanceWei);
      return formatBalance(balanceBigInt);
    } catch (err) {
      console.warn('Failed to fetch balance:', err);
      return '0.00';
    }
  };

  // Auto-detect injected Ethereum provider on load and set up listeners for account/chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum;

      const updateWallet = async () => {
        try {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (Array.isArray(accounts) && accounts.length > 0) {
            const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
            const chainId = Number(chainIdHex);
            const balance = await fetchBalance(accounts[0]);
            setWallet({
              isConnected: true,
              address: accounts[0],
              chainId: isNaN(chainId) ? null : chainId,
              balance
            });
          } else {
            // No accounts returned (wallet locked or disconnected)
            setWallet(INITIAL_WALLET_STATE);
          }
        } catch (err) {
          console.warn('Failed to update wallet state:', err);
          setWallet(INITIAL_WALLET_STATE);
        }
      };

      // Initial load
      updateWallet();

      // Set up listeners for account and chain changes (if supported)
      if (typeof ethereum.on === 'function') {
        ethereum.on('accountsChanged', updateWallet);
        ethereum.on('chainChanged', updateWallet);

        // Cleanup listeners on unmount
        return () => {
          if (typeof ethereum.removeListener === 'function') {
            ethereum.removeListener('accountsChanged', updateWallet);
            ethereum.removeListener('chainChanged', updateWallet);
          }
        };
      }
    }
  }, []);

  const connectWallet = async () => {
    setIsPending(true);

    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum;
      try {
        const accounts = (await ethereum.request({
          method: 'eth_requestAccounts'
        })) as string[];

        if (accounts && accounts.length > 0) {
          // Get the actual chain ID from the wallet
          const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
          const chainId = Number(chainIdHex);
          // Fetch and set the actual balance
          const balance = await fetchBalance(accounts[0]);

          setWallet({
            isConnected: true,
            address: accounts[0],
            chainId: isNaN(chainId) ? null : chainId,
            balance
          });
          setIsPending(false);
          return;
        }
      } catch (err) {
        console.warn('Injected wallet connection declined:', err);
        // Don't fall back to fake state - keep disconnected
        setWallet(INITIAL_WALLET_STATE);
      }
    }

    // No fallback to fake state - keep disconnected if no wallet
    setWallet(INITIAL_WALLET_STATE);
    setIsPending(false);
  };

  const disconnectWallet = () => {
    setWallet(INITIAL_WALLET_STATE);
  };

  const signTypedDataProof = async (payload: Eip712ProofPayload): Promise<string> => {
    setIsPending(true);

    if (typeof window !== 'undefined' && window.ethereum && wallet.isConnected && wallet.address) {
      try {
        // Use the actual contract address from config
        const contractAddress = blockchainConfig.trustBountyEscrowAddress;
        const domain = {
          name: 'Trust Engine Protocol',
          version: '1.0',
          chainId: blockchainConfig.chainId,
          verifyingContract: contractAddress
        };

        const types = {
          ProofAnchor: [
            { name: 'researcherDid', type: 'string' },
            { name: 'bountyId', type: 'string' },
            { name: 'proofHash', type: 'bytes32' },
            { name: 'nonce', type: 'uint256' }
          ]
        };

        const typedData = JSON.stringify({
          types,
          domain,
          primaryType: 'ProofAnchor',
          message: payload
        });

        const signature = (await window.ethereum.request({
          method: 'eth_signTypedData_v4',
          params: [wallet.address, typedData]
        })) as string;

        setIsPending(false);
        return signature;
      } catch (err) {
        console.warn('EIP-712 wallet prompt declined:', err);
        // Fall back to cryptographic signature if wallet signature fails
      }
    }

    // Cryptographic fallback signature (only if wallet not connected or signature fails)
    const typedHash = await hashEip712ProofPayload(payload);
    setIsPending(false);
    return generateEcdsaSignature(payload.researcherDid, typedHash);
  };

  const releaseEscrowOnChain = async (_escrowContractAddress: string, _amount: number) => {
    setIsPending(true);

    // Validate the contract address
    const targetAddress = _escrowContractAddress.startsWith('0x') && _escrowContractAddress.length === 42
      ? _escrowContractAddress
      : blockchainConfig.trustBountyEscrowAddress;

    if (!isValidEthAddress(targetAddress)) {
      setIsPending(false);
      throw new Error('Invalid contract address');
    }

    if (typeof window !== 'undefined' && window.ethereum && wallet.isConnected && wallet.address) {
      try {
        const txHash = (await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: wallet.address,
              to: targetAddress,
              value: '0x0'
            }
          ]
        })) as string;

        setIsPending(false);
        return {
          success: true,
          txHash
        };
      } catch (err) {
        console.warn('On-chain transaction execution failed or rejected:', err);
        // Don't simulate - throw the error so UI can handle it properly
        throw err;
      }
    }

    // No fallback simulation - throw error if not connected
    setIsPending(false);
    throw new Error('Wallet not connected');
  };

  const createEscrowOnChain = async (_bountyId: string, amountEth: number) => {
    setIsPending(true);
    const contractAddress = blockchainConfig.trustBountyEscrowAddress as Address;

    if (!isValidEthAddress(contractAddress)) {
      setIsPending(false);
      throw new Error('Invalid contract address');
    }

    // Validate bounty ID
    const bountyIdNum = Number(_bountyId);
    if (isNaN(bountyIdNum) || bountyIdNum <= 0) {
      setIsPending(false);
      throw new Error('Invalid bounty ID');
    }

    // Validate amount
    if (amountEth <= 0) {
      setIsPending(false);
      throw new Error('Amount must be greater than 0');
    }

    if (typeof window !== 'undefined' && window.ethereum && wallet.isConnected && wallet.address) {
      try {
        // Convert ETH to wei
        const value = BigInt(Math.floor(amountEth * 1e18));

        // Encode the function call
        const createEscrowAbiItem = parseAbiItem('function createEscrow(uint256 bountyId) external payable returns (uint256)');
        const data = encodeFunctionData({
          abi: [createEscrowAbiItem],
          functionName: 'createEscrow',
          args: [BigInt(bountyIdNum)]
        });

        // Get wallet client and send transaction
        const client = walletClient();
        if (!client) {
          throw new Error('Unable to initialize wallet client');
        }

        const hash = await client.sendTransaction({
          account: wallet.address as Address,
          to: contractAddress,
          value,
          data
        });

        // Wait for transaction receipt using wallet provider if available (to avoid CORS issues with public RPC)
        let receipt;
        if (typeof window !== 'undefined' && window.ethereum && wallet.isConnected) {
          const walletPublicClient = createPublicClient({
            chain: sepolia,
            transport: custom(window.ethereum),
          });
          receipt = await walletPublicClient.waitForTransactionReceipt({ hash });
        } else {
          receipt = await publicClient.waitForTransactionReceipt({ hash });
        }

        // Check if transaction was successful
        if (receipt.status !== 'success') {
          throw new Error('Transaction failed');
        }

        // Parse EscrowFunded event from logs
        let escrowId: string | null = null;
        let bountyIdFromEvent: string | null = null;
        let companyAddress: string | null = null;
        let amount: string | null = null;

        for (const log of receipt.logs) {
          try {
            // Try to decode as EscrowFunded event
            const decoded = decodeEventLog({
              abi: [
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "uint256",
                      "name": "escrowId",
                      "type": "uint256"
                    },
                    {
                      "indexed": true,
                      "internalType": "uint256",
                      "name": "bountyId",
                      "type": "uint256"
                    },
                    {
                      "indexed": false,
                      "internalType": "address",
                      "name": "company",
                      "type": "address"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    }
                  ],
                  "name": "EscrowFunded",
                  "type": "event"
                }
              ],
              data: log.data,
              topics: log.topics
            });

            if (decoded.eventName === 'EscrowFunded') {
              escrowId = decoded.args.escrowId.toString();
              bountyIdFromEvent = decoded.args.bountyId.toString();
              companyAddress = decoded.args.company as Address;
              amount = decoded.args.amount.toString();
              break;
            }
          } catch (decodeError) {
            // Not our event, continue
            continue;
          }
        }

        if (!escrowId) {
          throw new Error('EscrowFunded event not found in transaction receipt');
        }

        setIsPending(false);
        return {
          success: true,
          txHash: hash,
          escrowId,
          bountyId: bountyIdFromEvent ?? _bountyId,
          companyAddress: companyAddress ?? wallet.address,
          amount: amount ?? value.toString(),
          blockNumber: receipt.blockNumber?.toString() ?? '0'
        };
      } catch (err) {
        console.warn('On-chain escrow creation failed or rejected:', err);
        // Don't simulate - throw the error so UI can handle it properly
        setIsPending(false);
        throw err;
      }
    }

    // No fallback simulation - throw error if not connected
    setIsPending(false);
    throw new Error('Wallet not connected');
  };

  const castJurorVoteOnChain = async (_disputeId: string, _vote: 'ResearcherWins' | 'CompanyWins') => {
    setIsPending(true);
    const disputeContractAddress = import.meta.env.VITE_DISPUTE_ARBITRATION_ADDRESS;

    if (!isValidEthAddress(disputeContractAddress)) {
      setIsPending(false);
      throw new Error('Invalid dispute contract address');
    }

    if (typeof window !== 'undefined' && window.ethereum && wallet.isConnected && wallet.address) {
      try {
        const txHash = (await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: wallet.address,
              to: disputeContractAddress,
              value: '0x0'
            }
          ]
        })) as string;

        setIsPending(false);
        return { success: true, txHash };
      } catch (err) {
        console.warn('On-chain juror vote transaction failed or rejected:', err);
        // Don't simulate - throw the error so UI can handle it properly
        throw err;
      }
    }

    // No fallback simulation - throw error if not connected
    setIsPending(false);
    throw new Error('Wallet not connected');
  };

  // Helper to check if wallet is on the configured chain
  const isWalletOnConfiguredChain = (): boolean => {
    return wallet.chainId !== null && isConfiguredChain(wallet.chainId);
  };

  // Helper to get wallet address if valid
  const getWalletAddress = (): string | null => {
    return wallet.address && isValidEthAddress(wallet.address) ? wallet.address : null;
  };

  return {
    wallet,
    isPending,
    connectWallet,
    disconnectWallet,
    signTypedDataProof,
    releaseEscrowOnChain,
    createEscrowOnChain,
    castJurorVoteOnChain,
    isWalletOnConfiguredChain,
    getWalletAddress
  };
}