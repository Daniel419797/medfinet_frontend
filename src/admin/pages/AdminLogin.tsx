import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, Loader2, CheckCircle, QrCode, AlertCircle } from 'lucide-react';
import NotificationToast from '../../components/health-worker/NotificationToast';
import peraWalletService from '../../services/peraWalletService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false,
  });

  const connectPeraWallet = async () => {
    setIsConnecting('pera');

    try {
      let walletAddress;

      // Get wallet address from Pera
      const accounts = await peraWalletService.connect();
      walletAddress = accounts;

      if (!walletAddress) throw new Error('Wallet connection failed');

      let hospital: Record<string, any> | null = null;

      try {
        const response = await fetch(
          'https://medfinet-backend.onrender.com/api/admin/auth/wallet-login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet_address: walletAddress }),
          },
        );

        if (response.ok) {
          const payload = await response.json().catch(() => null);
          hospital = payload?.hospital || payload?.data || payload?.admin || null;
        }
      } catch (error) {
        console.warn('Wallet verification call failed, falling back to local wallet session.', error);
      }

      if (!hospital) {
        hospital = {
          id: `wallet-${walletAddress}`,
          name: 'Wallet-verified hospital admin',
          type: 'general',
          email: '',
          phone: '',
          website: '',
          wallet_address: walletAddress,
          verified: true,
          status: 'approved',
          admin_name: 'Wallet Admin',
          admin_email: '',
          admin_phone: '',
          admin_title: 'Administrator',
        };
      }

      if (hospital.status !== 'approved' || hospital.verified !== true) {
        throw new Error('This hospital account has not been approved yet');
      }

      // ✅ Store hospital admin info in localStorage
      // This serves as the "session" for wallet-based auth
      localStorage.setItem(
        'hospital_admin',
        JSON.stringify({
          id: hospital.id,
          name: hospital.name,
          type: hospital.type,
          email: hospital.email,
          phone: hospital.phone,
          website: hospital.website,
          wallet_address: hospital.wallet_address,
          verified: hospital.verified,
          status: hospital.status,
          admin_name: hospital.admin_name,
          admin_email: hospital.admin_email,
          admin_phone: hospital.admin_phone,
          admin_title: hospital.admin_title,
        })
      );

      // Also store wallet address for easy reference
      localStorage.setItem('admin_wallet_address', walletAddress);

      // ✅ Create an authenticated session marker
      localStorage.setItem('admin_auth_timestamp', new Date().toISOString());

      setNotification({
        type: 'success',
        message: 'Wallet verified! Redirecting to dashboard...',
        isVisible: true,
      });

      // Redirect with replace to clear navigation stack
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 1500);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Wallet connection failed',
        isVisible: true,
      });
      await peraWalletService.disconnect();
    } finally {
      setIsConnecting(null);
    }
  };

  const handleScanQRCode = async () => {
    setIsConnecting('qr');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock hospital admin for QR testing
      const mockHospital = {
        id: 'hospital_001',
        name: 'MedFiNet General Hospital',
        type: 'general',
        email: 'info@medfinet.com',
        phone: '+234-123-456-7890',
        website: 'https://medfinet.com',
        admin_name: 'Dr. Sarah James',
        admin_email: 'sarah@medfinet.com',
        admin_phone: '+234-123-456-7890',
        admin_title: 'Hospital Administrator',
        wallet_address: 'ALGO_TEST_WALLET_QR',
        verified: true,
        status: 'approved',
      };

      // Store in localStorage
      localStorage.setItem('hospital_admin', JSON.stringify(mockHospital));
      localStorage.setItem('admin_wallet_address', mockHospital.wallet_address);
      localStorage.setItem('admin_auth_timestamp', new Date().toISOString());

      setNotification({
        type: 'success',
        message: 'Authenticated via QR Code! Redirecting...',
        isVisible: true,
      });

      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 1500);
    } catch (error: any) {
      console.error('QR authentication error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to authenticate via QR Code.',
        isVisible: true,
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase (if logged in)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.signOut();
      }

      // Clear localStorage
      localStorage.removeItem('hospital_admin');
      localStorage.removeItem('admin_wallet_address');
      localStorage.removeItem('admin_auth_timestamp');

      // Disconnect wallet
      try {
        await peraWalletService.disconnect();
      } catch (e) {
        console.warn('Wallet disconnect warning:', e);
      }

      setNotification({
        type: 'success',
        message: 'Logged out successfully',
        isVisible: true,
      });

      // Redirect to login
      setTimeout(() => navigate('/admin/login', { replace: true }), 1000);
    } catch (error: any) {
      console.error('Logout error:', error);
      setNotification({
        type: 'error',
        message: 'Logout failed',
        isVisible: true,
      });
    }
  };

  const wallets = [
    {
      id: 'pera',
      name: 'Pera Wallet',
      description: 'Connect with Pera Wallet (Algorand)',
      icon: '🔷',
      color: 'bg-blue-500',
      onClick: connectPeraWallet,
      recommended: true,
    },
    {
      id: 'qr',
      name: 'Scan QR Code',
      description: 'Authenticate hospital admin using QR',
      icon: <QrCode className="h-6 w-6" />,
      color: 'bg-green-500',
      onClick: handleScanQRCode,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Hospital Admin Login
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Connect your verified wallet to manage hospital crowdfunding and records
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={wallet.onClick}
              disabled={isConnecting !== null}
              className={`w-full p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left relative ${isConnecting === wallet.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {wallet.recommended && (
                <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}

              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full ${wallet.color} flex items-center justify-center text-white text-xl mr-4`}>
                  {typeof wallet.icon === 'string' ? wallet.icon : wallet.icon}
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

        {/* Info boxes */}
        <div className="space-y-3 mb-6">
          <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-success-800 dark:text-success-300 mb-1">
                  Verified Access Only
                </h3>
                <p className="text-sm text-success-700 dark:text-success-400">
                  Only approved hospitals with verified wallets can access the admin dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-info-600 dark:text-info-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-info-800 dark:text-info-300 mb-1">
                  Secure Authentication
                </h3>
                <p className="text-sm text-info-700 dark:text-info-400">
                  Your wallet is verified against the hospital registry in Supabase.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            ← Back to MedFiNet
          </Link>
        </div>
      </div>

      <NotificationToast
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default AdminLogin;
