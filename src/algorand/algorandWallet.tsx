import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect({
  network: "testnet" // Must match your algod client
});

// TestNet config (switch to MainNet if needed)
export const algodClient = new algosdk.Algodv2(
  '', // no token needed
  "https://testnet-api.algonode.cloud",
  443
);



export async function connectWallet(): Promise<string[]> {
  return peraWallet.connect();
}

export function getConnectedAccounts(): string[] {
  return peraWallet.connector?.accounts || [];
}

export function disconnectWallet() {
  peraWallet.disconnect();
}

export default peraWallet;
