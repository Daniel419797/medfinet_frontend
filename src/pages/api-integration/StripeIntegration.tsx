import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Shield, 
  Clock, 
  Settings,
  RefreshCw,
  Download,
  ExternalLink,
  Zap,
  Loader2,
  Copy,
  TrendingUp
} from 'lucide-react';

interface StripeAccount {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'restricted';
  created: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  country?: string;
  isDefault: boolean;
}

interface StripeIntegrationProps {
  apiKey?: string;
}

const StripeIntegration = ({ apiKey }: StripeIntegrationProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'settings'>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<StripeAccount | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Mock data for demonstration
      if (apiKey) {
        setIsConnected(true);
        setAccount({
          id: 'acct_1234567890',
          name: 'MedFiNet Healthcare',
          email: 'payments@medfinet.com',
          status: 'active',
          created: '2023-06-15T10:30:00Z',
          payoutsEnabled: true,
          chargesEnabled: true,
          detailsSubmitted: true
        });
        
        setPaymentMethods([
          {
            id: 'pm_1234567890',
            type: 'card',
            last4: '4242',
            brand: 'visa',
            expMonth: 12,
            expYear: 2025,
            isDefault: true
          },
          {
            id: 'pm_0987654321',
            type: 'bank_account',
            last4: '6789',
            bankName: 'Chase',
            country: 'US',
            isDefault: false
          }
        ]);
        
        setTransactions([
          {
            id: 'txn_1234567890',
            amount: 350.00,
            status: 'succeeded',
            description: 'Invoice #INV-2024-001',
            customer: 'John Williams',
            date: '2024-06-15T10:30:00Z',
            paymentMethod: 'Visa •••• 4242'
          },
          {
            id: 'txn_0987654321',
            amount: 75.00,
            status: 'succeeded',
            description: 'Appointment #APT-2024-002',
            customer: 'Maria Davis',
            date: '2024-06-10T14:45:00Z',
            paymentMethod: 'Mastercard •••• 5678'
          },
          {
            id: 'txn_5678901234',
            amount: 120.00,
            status: 'succeeded',
            description: 'Insurance Premium #INS-2024-003',
            customer: 'Emma Williams',
            date: '2024-06-05T09:15:00Z',
            paymentMethod: 'Bank Account •••• 6789'
          }
        ]);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [apiKey]);

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnected(true);
    setAccount({
      id: 'acct_1234567890',
      name: 'MedFiNet Healthcare',
      email: 'payments@medfinet.com',
      status: 'active',
      created: new Date().toISOString(),
      payoutsEnabled: true,
      chargesEnabled: true,
      detailsSubmitted: true
    });
    
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Stripe account? This will disable payment processing.')) {
      setIsLoading(true);
      
      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConnected(false);
      setAccount(null);
      setPaymentMethods([]);
      setTransactions([]);
      
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'succeeded':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'pending':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'restricted':
      case 'failed':
        return 'text-error-600 bg-error-50 border-error-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-300">Loading Stripe integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Stripe Payment Integration
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Manage your Stripe payment processing integration for healthcare services
        </p>
      </div>

      {isConnected ? (
        <>
          {/* Tabs */}
          <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: CreditCard },
                { id: 'payments', label: 'Payment History', icon: DollarSign },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Account Overview */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mr-4">
                      <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{account?.name}</h2>
                      <p className="text-neutral-600 dark:text-neutral-300">{account?.email}</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(account?.status || '')}`}>
                          {account?.status}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                          Account ID: {account?.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://dashboard.stripe.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Stripe Dashboard
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Account Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Charges Enabled:</span>
                        <span className={`text-sm font-medium ${account?.chargesEnabled ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                          {account?.chargesEnabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Payouts Enabled:</span>
                        <span className={`text-sm font-medium ${account?.payoutsEnabled ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                          {account?.payoutsEnabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Details Submitted:</span>
                        <span className={`text-sm font-medium ${account?.detailsSubmitted ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                          {account?.detailsSubmitted ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Payment Methods</h3>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">
                            {method.type === 'card' ? (
                              <>
                                {method.brand} •••• {method.last4}
                              </>
                            ) : (
                              <>
                                {method.bankName} •••• {method.last4}
                              </>
                            )}
                          </span>
                          {method.isDefault && (
                            <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        Refresh Account Status
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors flex items-center">
                        <Download className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        Download Transaction Report
                      </button>
                      <button 
                        onClick={handleDisconnect}
                        className="w-full text-left px-3 py-2 text-sm text-error-700 dark:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors flex items-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Disconnect Stripe Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Recent Transactions</h3>
                  <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                  {transaction.description}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {transaction.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {transaction.customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Payment History
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                View and manage all payment transactions processed through Stripe
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-500 dark:text-neutral-400">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                          {transaction.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* API Keys */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  API Keys
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Manage your Stripe API keys for secure payment processing
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">Publishable Key</h3>
                      <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="pk_test_•••••••••••••••••••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 text-sm font-mono text-neutral-500 dark:text-neutral-400"
                      />
                      <button className="ml-2 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">Secret Key</h3>
                      <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="sk_test_•••••••••••••••••••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 text-sm font-mono text-neutral-500 dark:text-neutral-400"
                      />
                      <button className="ml-2 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-warning-600 dark:text-warning-400">
                      Keep your secret key confidential. Never expose it in client-side code or public repositories.
                    </p>
                  </div>
                </div>
              </div>

              {/* Webhook Settings */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Webhook Settings
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Configure webhooks to receive real-time payment event notifications
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">Endpoint URL</h3>
                      <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="https://api.medfinet.com/webhooks/stripe"
                        readOnly
                        className="flex-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400"
                      />
                      <button className="ml-2 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Webhook Events</h3>
                    <div className="space-y-2">
                      {[
                        'payment_intent.succeeded',
                        'payment_intent.payment_failed',
                        'charge.succeeded',
                        'charge.failed',
                        'invoice.payment_succeeded',
                        'invoice.payment_failed'
                      ].map((event) => (
                        <div key={event} className="flex items-center">
                          <input
                            type="checkbox"
                            id={event}
                            checked={true}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                          />
                          <label htmlFor={event} className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                            {event}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Payment Settings
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Configure payment processing settings for your healthcare services
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Accepted Payment Methods</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'card', label: 'Credit & Debit Cards', checked: true },
                        { id: 'bank', label: 'Bank Accounts (ACH)', checked: true },
                        { id: 'apple', label: 'Apple Pay', checked: true },
                        { id: 'google', label: 'Google Pay', checked: true },
                      ].map((method) => (
                        <div key={method.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={method.id}
                            checked={method.checked}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                          />
                          <label htmlFor={method.id} className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                            {method.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Currency & Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Default Currency
                        </label>
                        <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                          <option value="usd">USD - US Dollar</option>
                          <option value="eur">EUR - Euro</option>
                          <option value="gbp">GBP - British Pound</option>
                          <option value="cad">CAD - Canadian Dollar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Statement Descriptor
                        </label>
                        <input
                          type="text"
                          value="MEDFINET HEALTHCARE"
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-primary-100 dark:bg-primary-900/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Connect Stripe Account
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Connect your Stripe account to start processing payments for healthcare services, invoices, and insurance claims.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleConnectStripe}
                disabled={isConnecting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Connecting to Stripe...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Connect Stripe Account
                  </>
                )}
              </button>
              
              <a
                href="https://dashboard.stripe.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm"
              >
                Don't have a Stripe account? Sign up here
              </a>
            </div>
            
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Benefits of Stripe Integration</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Secure Payments</span> - PCI-compliant payment processing for healthcare services
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Multiple Payment Methods</span> - Accept credit cards, bank transfers, and digital wallets
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Automated Invoicing</span> - Send and track healthcare invoices with payment links
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Subscription Management</span> - Handle recurring payments for insurance premiums
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StripeIntegration;