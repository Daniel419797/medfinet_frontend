import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Wallet, Loader2, CheckCircle, QrCode } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { medfinetHealthWorkerApi } from '../../services/medfinetHealthWorkerApi';
import { useHealthWorker } from '../../contexts/HealthWorkerContext';
import NotificationToast from '../../components/health-worker/NotificationToast';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect();

const HealthWorkerLogin = () => {
  const navigate = useNavigate();
  const { organizationId } = useContext(UserContext);
  const { login } = useHealthWorker();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  const connectPeraWallet = async () => {
    if (!organizationId) {
      setNotification({ type: 'error', message: 'No organization selected. Please log in first.', isVisible: true });
      return;
    }
    setIsConnecting('pera');
    try {
      let walletAddress: string;
      const existingAccounts = await peraWallet.reconnectSession();
      if (existingAccounts.length > 0) {
        walletAddress = existingAccounts[0];
      } else {
        const accounts = await peraWallet.connect();
        walletAddress = accounts[0];
      }
      if (!walletAddress) throw new Error('Wallet connection failed');

      const result = await medfinetHealthWorkerApi.authWallet(organizationId, walletAddress);

      login({
        id: result.id,
        name: result.name || `${result.firstName || ''} ${result.lastName || ''}`.trim(),
        facility_name: result.facilityName || '',
        email: result.email || '',
        walletAddress: result.walletAddress || walletAddress,
        clinic: result.facilityName || '',
        licenseNumber: result.licenseNumber || '',
        verified: result.verificationStatus === 'approved',
        role: result.professionalRole || 'nurse',
      });

      setNotification({ type: 'success', message: 'Wallet connected and verified! Redirecting...', isVisible: true });
      setTimeout(() => navigate('/health-worker/dashboard'), 1500);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Pera Wallet connection failed', isVisible: true });
      await peraWallet.disconnect();
    } finally {
      setIsConnecting(null);
    }
  };

  const connectWalletConnect = async () => {
    if (!organizationId) {
      setNotification({ type: 'error', message: 'No organization selected. Please log in first.', isVisible: true });
      return;
    }
    setIsConnecting('walletconnect');
    try {
      let walletAddress: string;
      const existingAccounts = await peraWallet.reconnectSession();
      if (existingAccounts.length > 0) {
        walletAddress = existingAccounts[0];
      } else {
        const accounts = await peraWallet.connect();
        walletAddress = accounts[0];
      }
      if (!walletAddress) throw new Error('Wallet connection failed');

      const result = await medfinetHealthWorkerApi.authWallet(organizationId, walletAddress);

      login({
        id: result.id,
        name: result.name || `${result.firstName || ''} ${result.lastName || ''}`.trim(),
        facility_name: result.facilityName || '',
        email: result.email || '',
        walletAddress: result.walletAddress || walletAddress,
        clinic: result.facilityName || '',
        licenseNumber: result.licenseNumber || '',
        verified: result.verificationStatus === 'approved',
        role: result.professionalRole || 'nurse',
      });

      setNotification({ type: 'success', message: 'Successfully connected! Redirecting to dashboard...', isVisible: true });
      setTimeout(() => navigate('/health-worker/dashboard'), 1500);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to connect. Please try again.', isVisible: true });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleScanQRCode = async () => {
    setIsConnecting('qr');
    try {
      // QR code login requires wallet address from scanned QR
      setNotification({
        type: 'error',
        message: 'QR code login requires a valid QR code from your facility. Please use wallet login instead.',
        isVisible: true,
      });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to authenticate via QR Code.', isVisible: true });
    } finally {
      setIsConnecting(null);
    }
  };

  const wallets = [
    {
      id: 'pera',
      name: 'Pera Wallet',
      description: 'Connect with Pera Wallet for Algorand',
      icon: '\u25C6',
      color: 'bg-blue-500',
      onClick: connectPeraWallet,
      recommended: true,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Connect with any WalletConnect compatible wallet',
      icon: '\uD83D\uDD17',
      color: 'bg-indigo-500',
      onClick: connectWalletConnect,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Health Worker Portal
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Connect your verified wallet to access the vaccination management system
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={wallet.onClick}
              disabled={isConnecting !== null}
              className={`w-full p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left relative ${
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
                  <h4 className="font-semibold text-neutral-900 dark:text-white">{wallet.name}</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{wallet.description}</p>
                </div>
                {isConnecting === wallet.id && (
                  <div className="ml-2">
                    <Loader2 className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-spin" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* QR Code Login */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleScanQRCode}
            disabled={isConnecting !== null}
            className={`mt-4 w-full p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-600 hover:border-secondary-300 dark:hover:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-all duration-200 text-left ${
              isConnecting === 'qr' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center text-white mr-4">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900 dark:text-white">Scan QR Code</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Quick authentication with facility QR code</p>
              </div>
              {isConnecting === 'qr' && (
                <div className="ml-2">
                  <Loader2 className="h-5 w-5 text-secondary-600 dark:text-secondary-400 animate-spin" />
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-success-800 dark:text-success-300 mb-1">
                Verified Access Only
              </h3>
              <p className="text-sm text-success-700 dark:text-success-400">
                Only verified health workers with valid licenses can access this portal. Your credentials will be verified on the blockchain.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            <p className="mb-2">Supported authentication methods:</p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>\u2022 Blockchain Wallets</span>
              <span>\u2022 QR Code</span>
              <span>\u2022 Smart Contracts</span>
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Don't have an account?{' '}
              <Link
                to="/health-worker/register"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
              >
                Register here
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              \u2190 Back to MedFiNet
            </Link>
          </div>
        </div>
      </div>

      <NotificationToast
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default HealthWorkerLogin;
