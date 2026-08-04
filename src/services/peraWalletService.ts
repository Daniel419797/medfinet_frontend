import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk'
class PeraWalletService {
  private peraWallet: PeraWalletConnect;
  private accountAddress: string | null = null;
  private listeners: Set<(address: string | null) => void> = new Set();

  constructor() {
    this.peraWallet = new PeraWalletConnect({
    //   shouldShowSignTxnToast: true,
    //   chainId: 416002,
         network: "testnet"
    });

    this.peraWallet.connector?.on('disconnect', () => {
      this.accountAddress = null;
      this.notifyListeners();
    });

    this.reconnectSession();
  }

  private async reconnectSession() {
    try {
      const accounts = await this.peraWallet.reconnectSession();
      if (accounts && accounts.length > 0) {
        this.accountAddress = accounts[0];
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to reconnect session:', error);
    }
  }

  async connect(): Promise<string | null> {
    try {
      const accounts = await this.peraWallet.connect();
      if (accounts && accounts.length > 0) {
        this.accountAddress = accounts[0];
        this.notifyListeners();
        return this.accountAddress;
      }
      return null;
    } catch (error) {
      console.error('Pera Wallet connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.peraWallet.disconnect();
      this.accountAddress = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Pera Wallet disconnection failed:', error);
    }
  }

  getAddress(): string | null {
    return this.accountAddress;
  }

  isConnected(): boolean {
    return !!this.accountAddress;
  }

  // async signTransaction(txn: any): Promise<Uint8Array> {
  //   try {
  //     const singleTxnGroups = [{ txn, signers: [this.accountAddress!] }];
  //     const signedTxn = await this.peraWallet.signTransaction([singleTxnGroups]);
  //     return signedTxn[0];
  //   } catch (error) {
  //     console.error('Transaction signing failed:', error);
  //     throw error;
  //   }
  // }

  async signTransaction(unsignedTransactionsBase64: string): Promise<string> {
    try {
      if (typeof unsignedTransactionsBase64 === 'string') {
        unsignedTransactionsBase64 = [unsignedTransactionsBase64];
      }
      const unsignedTransactions = unsignedTransactionsBase64.map(txnBase64 => 
      algosdk.decodeUnsignedTransaction(Buffer.from(txnBase64, 'base64'))
        );

        // Create the transaction group for Pera Wallet
        const transactionGroup = unsignedTransactions.map(txn => ({ txn }));

        // Sign with Pera Wallet - pass the array of transactions
        const signedTxn = await this.peraWallet.signTransaction([transactionGroup]);

        // Convert signed transactions to base64
        function uint8ArrayToBase64(u8arr: Uint8Array) {
          return btoa(String.fromCharCode(...u8arr));
        }

        // Handle the response - Pera Wallet returns an array of signed transactions
        const signedTxnBase64Array = signedTxn.map(txn => uint8ArrayToBase64(txn));
        console.log(signedTxnBase64Array)
        
        return signedTxnBase64Array;
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw error;
    }
  }

  onAccountChange(callback: (address: string | null) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.accountAddress));
  }
}

export const peraWalletService = new PeraWalletService();
export default peraWalletService;
