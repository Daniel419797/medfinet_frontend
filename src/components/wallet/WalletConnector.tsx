import { useState } from 'react';
import { Wallet, X, ExternalLink } from 'lucide-react';
import { PeraWalletConnect } from '@perawallet/connect';
import { useNavigate } from 'react-router-dom';

// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: false,
});

interface WalletConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected?: (walletInfo: { type: string; address: string }) => void;
}

const WalletConnector = ({ isOpen, onClose, onWalletConnected }: WalletConnectorProps) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const navigate = useNavigate();

  const connectPeraWallet = async () => {
    try {
      setIsConnecting('pera');
      let accounts: string[] = [];
      
      // Check if already connected
      if (peraWallet.isConnected) {
        // Get existing connected accounts
        accounts = peraWallet.connector?.accounts || [];
      } else {
        // Connect to wallet
        try {
          accounts = await peraWallet.connect();
        } catch (connectError: any) {
          // Handle the case where session is already connected
          if (connectError?.message?.includes('Session currently connected')) {
            // Get accounts from existing connection
            accounts = peraWallet.connector?.accounts || [];
          } else {
            // Re-throw other connection errors
            throw connectError;
          }
        }
      }
      
      if (accounts.length > 0) {
        const walletInfo = {
          type: 'Pera Wallet',
          address: accounts[0],
        };
        
        // If onWalletConnected callback is provided, use it (for landing page flow)
        if (onWalletConnected) {
          onWalletConnected(walletInfo);
        } else {
          // Otherwise, store wallet info and navigate to dashboard (legacy flow)
          localStorage.setItem('connectedWallet', JSON.stringify({
            type: 'pera',
            address: accounts[0],
            connected: true
          }));
          
          onClose();
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Pera Wallet connection failed:', error);
    } finally {
      setIsConnecting(null);
    }
  };

  const connectPhantomWallet = async () => {
    try {
      setIsConnecting('phantom');
      
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        
        if (response.publicKey) {
          const walletInfo = {
            type: 'Phantom',
            address: response.publicKey.toString(),
          };
          
          if (onWalletConnected) {
            onWalletConnected(walletInfo);
          } else {
            localStorage.setItem('connectedWallet', JSON.stringify({
              type: 'phantom',
              address: response.publicKey.toString(),
              connected: true
            }));
            
            onClose();
            navigate('/dashboard');
          }
        }
      } else {
        // Redirect to Phantom website if not installed
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Phantom Wallet connection failed:', error);
    } finally {
      setIsConnecting(null);
    }
  };

  const connectMetaMask = async () => {
    try {
      setIsConnecting('metamask');
      
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          const walletInfo = {
            type: 'MetaMask',
            address: accounts[0],
          };
          
          if (onWalletConnected) {
            onWalletConnected(walletInfo);
          } else {
            localStorage.setItem('connectedWallet', JSON.stringify({
              type: 'metamask',
              address: accounts[0],
              connected: true
            }));
            
            onClose();
            navigate('/dashboard');
          }
        }
      } else {
        // Redirect to MetaMask website if not installed
        window.open('https://metamask.io/', '_blank');
      }
    } catch (error) {
      console.error('MetaMask connection failed:', error);
    } finally {
      setIsConnecting(null);
    }
  };

  const wallets = [
    {
      id: 'pera',
      name: 'Pera Wallet',
      description: 'Connect with Pera Wallet for Algorand',
      icon: '🔷',
      color: 'bg-blue-500',
      onClick: connectPeraWallet,
      recommended: true,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      description: 'Connect with Phantom for Solana',
      icon: '👻',
      color: 'bg-purple-500',
      onClick: connectPhantomWallet,
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect with MetaMask for Ethereum',
      icon: '🦊',
      color: 'bg-orange-500',
      onClick: connectMetaMask,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-auto z-10 animate-slide-up">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-xl font-semibold text-neutral-900">Connect Wallet</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-neutral-600 mb-6 text-center">
              Choose your preferred wallet to connect to MedFiNet
            </p>
            
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={wallet.onClick}
                  disabled={isConnecting !== null}
                  className={`w-full p-4 rounded-lg border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left relative ${
                    isConnecting === wallet.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {wallet.recommended && (
                    <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                  
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full ${wallet.color} flex items-center justify-center text-white text-xl mr-4`}>
                      {wallet.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{wallet.name}</h4>
                      <p className="text-sm text-neutral-600">{wallet.description}</p>
                    </div>
                    {isConnecting === wallet.id && (
                      <div className="ml-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              <h4 className="font-medium text-neutral-900 mb-2">Why connect a wallet?</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Securely manage your medical invoices</li>
                <li>• Access blockchain-verified records</li>
                <li>• Participate in invoice financing</li>
                <li>• Maintain full control of your data</li>
              </ul>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={onClose}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                I'll connect later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnector;