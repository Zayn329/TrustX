export interface WagmiChainConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  blockExplorerUrl: string;
}

export const SEPOLIA_CONFIG: WagmiChainConfig = {
  chainId: 11155111,
  chainName: 'Ethereum Sepolia Testnet',
  rpcUrl: 'https://rpc.sepolia.org',
  blockExplorerUrl: 'https://sepolia.etherscan.io'
};

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
}

export const INITIAL_WALLET_STATE: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: '0.00'
};
