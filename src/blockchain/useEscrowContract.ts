import { useState, useEffect } from 'react';
import { WalletState, INITIAL_WALLET_STATE } from './wagmiConfig';
import { Eip712ProofPayload } from '../domain/cryptoUtils';
import { isValidEthAddress, isConfiguredChain, blockchainConfig, REPUTATION_REGISTRY_ADDRESS, PROOF_REGISTRY_ADDRESS } from './config';
import { walletClient, publicClient, checkEscrowDeployment, checkContractBytecode } from './viemClient';
import { TRUST_BOUNTY_ESCROW_ABI } from './escrowAbi';
import { REPUTATION_REGISTRY_ABI } from './reputationAbi';
import { PROOF_REGISTRY_ABI } from './proofRegistryAbi';
import { parseAbiItem, Address, encodeFunctionData, decodeEventLog, createPublicClient, custom, getAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { getPendingBlockchainTransactions, recordBlockchainTransaction, updateBlockchainTransaction } from './transactionJournal';

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

  const ensureEscrowDeployment = async () => {
    const status = await checkEscrowDeployment();
    if (!status.hasBytecode) {
      throw new Error('Configured escrow address has no contract bytecode on Sepolia');
    }
    return status;
  };

  const reconcilePendingTransactions = async () => {
    const pending = getPendingBlockchainTransactions();
    const reconciled: Array<{ txHash: string; state: 'confirmed' | 'reverted' | 'pending' }> = [];

    for (const entry of pending) {
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash: entry.txHash as `0x${string}` });
        const state = receipt.status === 'success' ? 'confirmed' : 'reverted';
        updateBlockchainTransaction(entry.txHash, state);
        reconciled.push({ txHash: entry.txHash, state });
      } catch {
        reconciled.push({ txHash: entry.txHash, state: 'pending' });
      }
    }

    return reconciled;
  };

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

    try {
      if (typeof window === 'undefined' || !window.ethereum || !wallet.isConnected || !wallet.address) {
        throw new Error('A connected wallet is required to create a cryptographic proof signature');
      }
      if (!isWalletOnConfiguredChain()) {
        throw new Error('Wallet is not on the configured chain');
      }

      const typedData = JSON.stringify({
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          ProofAnchor: [
            { name: 'researcherDid', type: 'string' },
            { name: 'bountyId', type: 'string' },
            { name: 'proofHash', type: 'bytes32' },
            { name: 'nonce', type: 'uint256' }
          ]
        },
        domain: {
          name: 'Trust Engine Protocol',
          version: '1.0',
          chainId: blockchainConfig.chainId,
          verifyingContract: PROOF_REGISTRY_ADDRESS
        },
        primaryType: 'ProofAnchor',
        message: payload
      });

      return await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [wallet.address, typedData]
      }) as string;
    } finally {
      setIsPending(false);
    }
  };

  const releaseEscrowOnChain = async (escrowId: string, researcherAddress: string) => {
    setIsPending(true);

    if (!isValidEthAddress(blockchainConfig.trustBountyEscrowAddress)) {
      setIsPending(false);
      throw new Error('Invalid contract address');
    }

    const parsedEscrowId = BigInt(escrowId);
    if (parsedEscrowId <= 0n) {
      setIsPending(false);
      throw new Error('Invalid escrow ID');
    }

    if (!isValidEthAddress(researcherAddress) || researcherAddress === '0x0000000000000000000000000000000000000000') {
      setIsPending(false);
      throw new Error('Invalid researcher address');
    }

    if (!wallet.isConnected || !wallet.address) {
      setIsPending(false);
      throw new Error('Wallet not connected');
    }
    if (!isWalletOnConfiguredChain()) {
      setIsPending(false);
      throw new Error('Wallet is not on the configured chain');
    }

    try {
      await ensureEscrowDeployment();
      const client = walletClient();
      if (!client) throw new Error('Unable to initialize wallet client');

      const data = encodeFunctionData({
        abi: TRUST_BOUNTY_ESCROW_ABI,
        functionName: 'releaseEscrow',
        args: [parsedEscrowId, getAddress(researcherAddress) as Address]
      });
      const hash = await client.sendTransaction({
        account: wallet.address as Address,
        to: blockchainConfig.trustBountyEscrowAddress as Address,
        data
      });
      recordBlockchainTransaction({
        txHash: hash,
        action: 'release_escrow',
        chainId: blockchainConfig.chainId,
        contractAddress: blockchainConfig.trustBountyEscrowAddress,
        submittedAt: new Date().toISOString(),
        state: 'submitted',
        arguments: { escrowId, researcherAddress }
      });
      const receiptClient = createPublicClient({ chain: sepolia, transport: custom(window.ethereum!) });
      const receipt = await receiptClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') {
        updateBlockchainTransaction(hash, 'reverted');
        throw new Error('Escrow release transaction reverted');
      }

      const event = receipt.logs
        .map((log) => {
          try {
            return decodeEventLog({ abi: TRUST_BOUNTY_ESCROW_ABI, data: log.data, topics: log.topics });
          } catch {
            return null;
          }
        })
        .find((decoded) => decoded?.eventName === 'EscrowReleased');
      if (!event || event.eventName !== 'EscrowReleased') throw new Error('EscrowReleased event not found in receipt');

      updateBlockchainTransaction(hash, 'confirmed');
      setIsPending(false);
      return {
        success: true,
        txHash: hash,
        escrowId: event.args.escrowId.toString(),
        researcher: event.args.researcher,
        amount: event.args.amount.toString(),
        blockNumber: receipt.blockNumber.toString()
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes('timeout')) {
        // The transaction may still be mining; the journal keeps it recoverable.
      }
      setIsPending(false);
      throw err;
    }
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
        if (!isWalletOnConfiguredChain()) {
          throw new Error('Wallet is not on the configured chain');
        }
        const pendingFunding = getPendingBlockchainTransactions().some((entry) =>
          entry.action === 'fund_escrow' && entry.arguments.bountyId === _bountyId
        );
        if (pendingFunding) {
          throw new Error('A funding transaction for this bounty is already pending reconciliation');
        }
        await ensureEscrowDeployment();
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
        recordBlockchainTransaction({
          txHash: hash,
          action: 'fund_escrow',
          chainId: blockchainConfig.chainId,
          contractAddress: blockchainConfig.trustBountyEscrowAddress,
          submittedAt: new Date().toISOString(),
          state: 'submitted',
          arguments: { bountyId: _bountyId, amountEth: String(amountEth) }
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
          updateBlockchainTransaction(hash, 'reverted');
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

        updateBlockchainTransaction(hash, 'confirmed');
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

  const updateReputationOnChain = async (did: string, increment: number) => {
    if (!isValidEthAddress(REPUTATION_REGISTRY_ADDRESS)) {
      throw new Error('Reputation registry address is not configured');
    }
    if (!did.trim() || !Number.isInteger(increment) || increment <= 0) {
      throw new Error('Invalid reputation update');
    }
    if (!wallet.isConnected || !wallet.address || !isWalletOnConfiguredChain()) {
      throw new Error('A connected Sepolia wallet is required for reputation updates');
    }
    await checkContractBytecode(REPUTATION_REGISTRY_ADDRESS);
    const client = walletClient();
    if (!client) throw new Error('Unable to initialize wallet client');
    const data = encodeFunctionData({
      abi: REPUTATION_REGISTRY_ABI,
      functionName: 'updateReputation',
      args: [did, BigInt(increment)]
    });
    const hash = await client.sendTransaction({
      account: wallet.address as Address,
      to: REPUTATION_REGISTRY_ADDRESS as Address,
      data
    });
    recordBlockchainTransaction({
      txHash: hash,
      action: 'update_reputation',
      chainId: blockchainConfig.chainId,
      contractAddress: REPUTATION_REGISTRY_ADDRESS,
      submittedAt: new Date().toISOString(),
      state: 'submitted',
      arguments: { did, increment: String(increment) }
    });
    const receiptClient = createPublicClient({ chain: sepolia, transport: custom(window.ethereum!) });
    const receipt = await receiptClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') {
      updateBlockchainTransaction(hash, 'reverted');
      throw new Error('Reputation update transaction reverted');
    }
    const event = receipt.logs.map((log) => {
      try {
        return decodeEventLog({ abi: REPUTATION_REGISTRY_ABI, data: log.data, topics: log.topics });
      } catch {
        return null;
      }
    }).find((decoded) => decoded?.eventName === 'ReputationUpdated');
    if (!event || event.eventName !== 'ReputationUpdated') {
      throw new Error('ReputationUpdated event not found in receipt');
    }
    updateBlockchainTransaction(hash, 'confirmed');
    return {
      txHash: hash,
      did: event.args.did,
      newScore: event.args.newScore.toString(),
      increment: event.args.increment.toString(),
      blockNumber: receipt.blockNumber.toString()
    };
  };

  const anchorProofOnChain = async (bountyId: string, proofHash: string, researcherDid: string, signature: string, nonce: number) => {
    if (!isValidEthAddress(PROOF_REGISTRY_ADDRESS)) throw new Error('Proof registry address is not configured');
    if (!/^0x[a-fA-F0-9]{64}$/.test(proofHash)) throw new Error('Proof hash must be a bytes32 value');
    if (!researcherDid.trim() || !/^0x[a-fA-F0-9]+$/.test(signature) || !Number.isSafeInteger(nonce) || nonce < 0) throw new Error('Invalid proof identity, signature, or nonce');
    if (!wallet.isConnected || !wallet.address || !isWalletOnConfiguredChain()) {
      throw new Error('A connected Sepolia wallet is required for proof anchoring');
    }
    await checkContractBytecode(PROOF_REGISTRY_ADDRESS);
    const client = walletClient();
    if (!client) throw new Error('Unable to initialize wallet client');
    const data = encodeFunctionData({
      abi: PROOF_REGISTRY_ABI,
      functionName: 'anchorProof',
      args: [BigInt(bountyId), proofHash as `0x${string}`, researcherDid, signature as `0x${string}`, BigInt(nonce)]
    });
    const hash = await client.sendTransaction({
      account: wallet.address as Address,
      to: PROOF_REGISTRY_ADDRESS as Address,
      data
    });
    recordBlockchainTransaction({
      txHash: hash,
      action: 'anchor_proof',
      chainId: blockchainConfig.chainId,
      contractAddress: PROOF_REGISTRY_ADDRESS,
      submittedAt: new Date().toISOString(),
      state: 'submitted',
      arguments: { bountyId, proofHash, researcherDid, nonce: String(nonce) }
    });
    const receiptClient = createPublicClient({ chain: sepolia, transport: custom(window.ethereum!) });
    const receipt = await receiptClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') {
      updateBlockchainTransaction(hash, 'reverted');
      throw new Error('Proof anchoring transaction reverted');
    }
    const event = receipt.logs.map((log) => {
      try {
        return decodeEventLog({ abi: PROOF_REGISTRY_ABI, data: log.data, topics: log.topics });
      } catch {
        return null;
      }
    }).find((decoded) => decoded?.eventName === 'ProofAnchored');
    if (!event || event.eventName !== 'ProofAnchored') throw new Error('ProofAnchored event not found in receipt');
    updateBlockchainTransaction(hash, 'confirmed');
    return {
      txHash: hash,
      proofHash: event.args.proofHash,
      bountyId: event.args.bountyId.toString(),
      researcherDid: event.args.researcherDid,
      signer: event.args.signer,
      nonce: event.args.nonce.toString(),
      blockNumber: receipt.blockNumber.toString()
    };
  };

  const raiseDisputeOnChain = async (escrowId: string) => {
    setIsPending(true);
    if (!isValidEthAddress(blockchainConfig.trustBountyEscrowAddress)) {
      setIsPending(false);
      throw new Error('Invalid contract address');
    }
    const parsedEscrowId = BigInt(escrowId);
    if (parsedEscrowId <= 0n) {
      setIsPending(false);
      throw new Error('Invalid escrow ID');
    }
    if (!wallet.isConnected || !wallet.address) {
      setIsPending(false);
      throw new Error('Wallet not connected');
    }
    if (!isWalletOnConfiguredChain()) {
      setIsPending(false);
      throw new Error('Wallet is not on the configured chain');
    }

    try {
      await ensureEscrowDeployment();
      const client = walletClient();
      if (!client) throw new Error('Unable to initialize wallet client');
      const data = encodeFunctionData({
        abi: TRUST_BOUNTY_ESCROW_ABI,
        functionName: 'raiseDispute',
        args: [parsedEscrowId]
      });
      const hash = await client.sendTransaction({
        account: wallet.address as Address,
        to: blockchainConfig.trustBountyEscrowAddress as Address,
        data
      });
      recordBlockchainTransaction({
        txHash: hash,
        action: 'raise_dispute',
        chainId: blockchainConfig.chainId,
        contractAddress: blockchainConfig.trustBountyEscrowAddress,
        submittedAt: new Date().toISOString(),
        state: 'submitted',
        arguments: { escrowId }
      });
      const receiptClient = createPublicClient({ chain: sepolia, transport: custom(window.ethereum!) });
      const receipt = await receiptClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') {
        updateBlockchainTransaction(hash, 'reverted');
        throw new Error('Dispute transaction reverted');
      }
      const event = receipt.logs
        .map((log) => {
          try {
            return decodeEventLog({ abi: TRUST_BOUNTY_ESCROW_ABI, data: log.data, topics: log.topics });
          } catch {
            return null;
          }
        })
        .find((decoded) => decoded?.eventName === 'EscrowDisputed');
      if (!event || event.eventName !== 'EscrowDisputed') throw new Error('EscrowDisputed event not found in receipt');

      updateBlockchainTransaction(hash, 'confirmed');
      setIsPending(false);
      return {
        success: true,
        txHash: hash,
        escrowId: event.args.escrowId.toString(),
        disputedBy: event.args.disputedBy,
        blockNumber: receipt.blockNumber.toString()
      };
    } catch (err) {
      setIsPending(false);
      throw err;
    }
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
    raiseDisputeOnChain,
    updateReputationOnChain,
    anchorProofOnChain,
    checkEscrowDeployment,
    reconcilePendingTransactions,
    isWalletOnConfiguredChain,
    getWalletAddress
  };
}
