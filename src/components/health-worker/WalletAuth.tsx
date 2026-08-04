import { useState } from 'react';
import { Wallet, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useHealthWorker } from '../../contexts/HealthWorkerContext';

interface WalletAuthProps {
  onSuccess: () => void;
}

const WalletAuth = ({ onSuccess }: WalletAuthProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useHealthWorker();

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock health worker data - in real app, this would come from blockchain verification
      const mockHealthWorker = {
        id: 'hw_001',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@citypediatrics.com',
        walletAddress: 'ALGO7X8Y9Z...ABC123',
        clinic: 'City Pediatrics Medical Center',
        licenseNumber: 'MD-12345-NY',
        verified: true,
        role: 'doctor' as const,
      };

      login(mockHealthWorker);
      onSuccess();
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Health Worker Portal
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Connect your verified wallet to access the vaccination management system
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400 mr-3" />
            <span className="text-error-700 dark:text-error-300 text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-3" />
                Connect Algorand Wallet
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Supported wallets: Pera Wallet, AlgoSigner, MyAlgo
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-success-800 dark:text-success-300 mb-1">
                Verified Access Only
              </h3>
              <p className="text-sm text-success-700 dark:text-success-400">
                Only verified health workers with valid licenses can access this portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAuth;