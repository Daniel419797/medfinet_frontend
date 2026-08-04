import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import NotificationToast from '../../components/health-worker/NotificationToast';
import {
  Loader,
  Shield, 
  Heart, 
  Globe, 
  Wallet, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Zap,
  Eye,
  Gift,
  Target,
  Award,
  Coins,
  Activity,
  Lock,
  QrCode,
  BarChart3
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import algosdk from 'algosdk';
import crowdfundingApi from '../../services/crowdfundingApi';
import peraWalletService from '../../services/peraWalletService';
import donationApi from '../../services/donationApi';

const HealthFinancePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('ALGO');
  const [donating, setDonating] = useState<string | null>(null);


  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false,
  });


  useEffect(() => {
    setIsVisible(true);
    loadData();

    const unsubscribe = peraWalletService.onAccountChange((address) => {
      setWalletAddress(address);
    });

    const currentAddress = peraWalletService.getAddress();
    if (currentAddress) {
      setWalletAddress(currentAddress);
    }

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const campaignsRes = await crowdfundingApi.getCampaigns({ status: 'active', limit: 6 });
      if (campaignsRes.success) {
        setCampaigns(campaignsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
const handleOpenDonationModal = async (campaignId: string) => {
  try {
    const campaignResponse = await crowdfundingApi.getCampaign(campaignId);
    if (campaignResponse.success && campaignResponse.data) {
      setSelectedCampaign(campaignResponse.data);
      setDonationAmount(0);
      setCustomAmount('');
      setIsDonationModalOpen(true);
    } else {
      alert('Failed to load campaign details');
    }
  } catch (error) {
    console.error('Error loading campaign:', error);
    alert('Error loading campaign details');
  }
};

const handleDonate = async () => {
  if (!selectedCampaign || !walletAddress) {
    setNotification({
      type: 'error',
      message: 'Please connect your wallet first',
      isVisible: true,
    });
    return;
  }

  if (donationAmount <= 0) {
    setNotification({
      type: 'error', 
      message: 'Please enter a valid donation amount',
      isVisible: true,
    });
    return;
  }

  if (donationAmount > (selectedCampaign.target_amount - selectedCampaign.raised_amount)) {
    alert(`Donation amount exceeds remaining goal amount of ${selectedCampaign.currency} ${selectedCampaign.target_amount - selectedCampaign.raised_amount}`);
    return;
  }

  setDonating(selectedCampaign.id);
  try {
    // Prepare donation transaction
    const preparationResponse = await donationApi.prepareDonation({
      campaignId: selectedCampaign.id,
      amount: donationAmount,
      donorWallet: walletAddress
    });

    if (preparationResponse.success) {
        // Sign ALL transactions with Pera Wallet
        const signedTransactions = await peraWalletService.signTransaction(
          preparationResponse.data.unsignedTransactions // Now an array
        );

        // Confirm the donation with all signed transactions
        const confirmationResponse = await donationApi.confirmDonation({
          donationId: preparationResponse.data.donationId,
          signedTransaction: signedTransactions // Send all signed transactions
        });

        if (confirmationResponse.success) {
          setNotification({
            type: 'success',
            message: `Donation successful! Transaction hash: ${confirmationResponse.data.transactionHash}`,
            isVisible: true,
          });
          // Refresh campaigns to update progress
          loadData();
          setIsDonationModalOpen(false);
          setSelectedCampaign(null);
        } else {
          throw new Error(confirmationResponse.message || 'Failed to confirm donation');
        }
      } else {
        throw new Error(preparationResponse.message || 'Failed to prepare donation');
      }
  } catch (error) {
    console.error('Donation error:', error);
    setNotification({
      type: 'error',
      message: `Donation failed: ${(error as Error).message}`,
      isVisible: true,
    });
  } finally {
    setDonating(null);
  }
};

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setDonationAmount(amount);
    } else {
      setDonationAmount(0);
    }
  };

  // Predefined donation amounts
  const predefinedAmounts = [10, 25, 50, 100, 250, 500];


  const handleConnectWallet = async () => {
    try {
      if (walletAddress) {
        await peraWalletService.disconnect();
      } else {
        await peraWalletService.connect();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  }

  const currencies = [
    { symbol: 'ADA', name: 'Cardano', icon: '₳' },
    { symbol: 'ALGO', name: 'Algorand', icon: 'Ⱥ' },
    { symbol: 'USDC', name: 'USD Coin', icon: '$' },
    { symbol: 'CUSD', name: 'Celo Dollar', icon: '$' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
                <div>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">MedFiNet</span>
                  <span className="block text-xs text-primary-600 dark:text-primary-400">HealthFinance</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#projects" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Projects
              </a>
              <a href="#marketplace" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Marketplace
              </a>
              <a href="#defi" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                DeFi
              </a>
              <ThemeToggle />
              <button
                  onClick={handleConnectWallet}
                  className="block w-full text-left px-3 py-2 bg-primary-600 text-white rounded-lg font-medium"
                >
                  {walletAddress ? 'Disconnect' : 'Connect Wallet'}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 rounded-b-lg shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#projects" className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Projects
                </a>
                <a href="#marketplace" className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Marketplace
                </a>
                <a href="#defi" className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  DeFi
                </a>
                <button
                  onClick={handleConnectWallet}
                  className="block w-full text-left px-3 py-2 bg-primary-600 text-white rounded-lg font-medium"
                >
                  {walletAddress ? 'Disconnect' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-800 dark:to-neutral-900">
        <div className="container mx-auto px-4">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
              MedFiNet HealthFinance
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-600 dark:text-primary-400 mb-4">
              Powering Clinics, Protecting Communities
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-3xl mx-auto">
              Turn your crypto into care. Fund verified health projects across Africa with full transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                Browse Projects
              </button>
              <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                Fund a Clinic
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Featured Health Projects
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Support verified clinics and NGOs making a real impact across Africa
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {campaigns.map((campaign, index) => (
                <div 
                  key={campaign.id}
                  className={`bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 0.2}s` }}
                >
                  <div className="relative">
                    <img 
                      src={campaign.image_url|| 'https://images.pexels.com/photos/7089626/pexels-photo-7089626.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                      alt={campaign.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'ACTIVE' ? 'bg-error-500 text-white' : 'bg-warning-500 text-white'
                    }`}>
                      {campaign.status === 'high' ? 'Urgent' : 'Active'}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">{campaign.location}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                      {campaign.creator}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600 dark:text-neutral-300">Progress</span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {campaign.currency} {campaign.raised_amount.toLocaleString() || '0'} / {campaign.currency} {campaign.target_amount.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${campaign.raised_amount * 100 / campaign.target_amount || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span>{Math.round(campaign.raised_amount * 100 / campaign.target_amount || 0)}% funded</span>
                        {/* <span>{campaign.donor_count || 0} donors</span> */}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleOpenDonationModal(campaign.id)}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Fund This Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donor Dashboard Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`}>
                <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  For Donors – Turn Your Crypto into Care
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  Browse verified health projects and fund them using your favorite cryptocurrency. Every donation is tracked on blockchain for complete transparency.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Browse verified health projects across Africa</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Fund using ADA, ALGO, Stellar USDC, or CUSD</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">One-time or recurring donations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">NFT Impact Certificates with QR verification</span>
                  </li>
                </ul>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg inline-flex items-center">
                  Start Donating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              <div className={`relative transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Donor Dashboard</h3>
                    <div className="flex space-x-2">
                      {currencies.map(currency => (
                        <button
                          key={currency.symbol}
                          onClick={() => setSelectedCurrency(currency.symbol)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedCurrency === currency.symbol
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          {currency.symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-success-600 dark:text-success-400">Total Donated</p>
                          <p className="text-xl font-bold text-success-800 dark:text-success-300">
                            {selectedCurrency === 'ADA' ? '₳2,450' : 
                             selectedCurrency === 'ALGO' ? 'Ⱥ1,890' : 
                             '$3,200'}
                          </p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-success-600 dark:text-success-400" />
                      </div>
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-primary-600 dark:text-primary-400">Projects Funded</p>
                          <p className="text-xl font-bold text-primary-800 dark:text-primary-300">12</p>
                        </div>
                        <Heart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                          <Shield className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">Vaccination Campaign</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Nasarawa PHC</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">$200</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center mr-3">
                          <Zap className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">Solar Fridge</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Kenya Rural Clinic</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">$500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic/NGO Dashboard Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`relative order-2 lg:order-1 transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Clinic Dashboard</h3>
                    <div className="flex items-center text-success-600 dark:text-success-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Verified</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-primary-600 dark:text-primary-400">Funds Raised</p>
                          <p className="text-xl font-bold text-primary-800 dark:text-primary-300">$8,450</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">Active Campaigns</p>
                          <p className="text-xl font-bold text-secondary-800 dark:text-secondary-300">3</p>
                        </div>
                        <Activity className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Measles Vaccination</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">70% funded • 28 donors</p>
                      </div>
                      <span className="text-sm font-medium text-success-600 dark:text-success-400">$1,400</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Medical Equipment</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">45% funded • 12 donors</p>
                      </div>
                      <span className="text-sm font-medium text-warning-600 dark:text-warning-400">$675</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`order-1 lg:order-2 transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`}>
                <div className="bg-secondary-100 dark:bg-secondary-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  For Clinics & NGOs – Raise Funds Transparently
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  Launch crowdfunding campaigns, share real-time updates, and receive direct funding from global donors.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Secure sign-up and verification process</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Launch crowdfunding campaigns with impact goals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Share real-time updates with donors</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Fast, direct, transparent access to funds</span>
                  </li>
                </ul>
                <Link
                  to="/healthfinance/clinic-dashboard"
                  className="bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg inline-flex items-center"
                >
                  Launch Your Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DeFi Features */}
      <section id="defi" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              DeFi for Health
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Innovative DeFi features that turn your investments into healthcare impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Staking Pools',
                description: 'Earn yields and automatically donate rewards to health projects',
                icon: Coins,
                color: 'primary'
              },
              {
                title: 'Yield Swap',
                description: 'Convert staking rewards into healthcare support automatically',
                icon: Award,
                color: 'secondary'
              },
              {
                title: 'Multi-Wallet Support',
                description: 'WalletConnect, Lace, Pera Wallet integration for seamless access',
                icon: Wallet,
                color: 'accent'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 0.2}s` }}
                >
                  <div className={`bg-${feature.color}-100 dark:bg-${feature.color}-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">{feature.description}</p>
                  <button className={`text-${feature.color}-600 dark:text-${feature.color}-400 font-medium hover:underline`}>
                    Learn more →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trust Through Transparency
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Every donation is recorded on blockchain. Scan a QR code to track your impact in real-time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {[
                { icon: Lock, title: 'Blockchain Secured', desc: 'All transactions verified on-chain' },
                { icon: QrCode, title: 'QR Tracking', desc: 'Scan to see real-time impact' },
                { icon: BarChart3, title: 'Impact Analytics', desc: 'Detailed reports on fund usage' }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-primary-100">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <button className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              View Blockchain Explorer
            </button>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Our Future Roadmap
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-12">
              HealthFinance is the foundation for a global health-finance ecosystem — starting with vaccines, 
              expanding into maternal care, chronic illness, and telemedicine, all powered by blockchain transparency.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { phase: 'Phase 1', title: 'Vaccination Funding', status: 'Live', color: 'success' },
                { phase: 'Phase 2', title: 'Maternal Care', status: 'Q2 2024', color: 'primary' },
                { phase: 'Phase 3', title: 'Chronic Illness', status: 'Q3 2024', color: 'warning' },
                { phase: 'Phase 4', title: 'Telemedicine', status: 'Q4 2024', color: 'secondary' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-lg border-l-4 border-${item.color}-500 transition-all duration-1000 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{item.phase}</p>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{item.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${item.color}-100 text-${item.color}-800 dark:bg-${item.color}-900/20 dark:text-${item.color}-300`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-secondary-600 to-secondary-800 dark:from-secondary-700 dark:to-secondary-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-secondary-100 mb-8 max-w-2xl mx-auto">
            Join the movement to democratize healthcare funding across Africa through blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-secondary-600 hover:bg-secondary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              Start Donating
            </button>
            <Link
              to="/healthfinance/clinic-dashboard"
              className="border-2 border-white text-white hover:bg-white hover:text-secondary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Register Your Clinic
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 dark:bg-neutral-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <Shield className="h-8 w-8 text-primary-400 mr-2" />
            <span className="text-xl font-bold">MedFiNet HealthFinance</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <Link to="/" className="text-neutral-400 hover:text-white transition-colors">Home</Link>
            <a href="#projects" className="text-neutral-400 hover:text-white transition-colors">Projects</a>
            <a href="#marketplace" className="text-neutral-400 hover:text-white transition-colors">Marketplace</a>
            <a href="#defi" className="text-neutral-400 hover:text-white transition-colors">DeFi</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">About</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">Contact</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">GitBook</a>
          </div>
          
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <span className="sr-only">Telegram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 MedFiNet HealthFinance. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Donation Modal */}
      <Transition appear show={isDonationModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDonationModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedCampaign && (
                    <>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        Fund {selectedCampaign.title}
                      </Dialog.Title>

                      {/* Campaign Details */}
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">{selectedCampaign.location}</span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-neutral-600 dark:text-neutral-300">Progress</span>
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {selectedCampaign.currency} {selectedCampaign.raised_amount.toLocaleString() || '0'} / {selectedCampaign.currency} {selectedCampaign.target_amount.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${Math.min(100, (selectedCampaign.raised_amount / selectedCampaign.target_amount) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            <span>{Math.round((selectedCampaign.raised_amount / selectedCampaign.target_amount) * 100)}% funded</span>
                            <span>{selectedCampaign.donor_count || 0} donors</span>
                          </div>
                        </div>

                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                          {selectedCampaign.description}
                        </p>
                      </div>

                      {/* Donation Amount Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                          Select Donation Amount
                        </label>
                        
                        {/* Predefined Amounts */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {predefinedAmounts.map((amount) => (
                            <button
                              key={amount}
                              onClick={() => handleAmountSelect(amount)}
                              className={`p-3 rounded-lg border transition-colors ${
                                donationAmount === amount
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600'
                              }`}
                            >
                              ${amount}
                            </button>
                          ))}
                        </div>

                        {/* Custom Amount */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Or enter custom amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              {/* <span className="text-neutral-500 dark:text-neutral-400 text-right block">{selectedCampaign.currency}</span> */}
                            </div>
                            <input
                              type="number"
                              value={customAmount}
                              onChange={(e) => handleCustomAmountChange(e.target.value)}
                              placeholder={`Enter amount in ${selectedCampaign.currency}`}
                              className="block w-full pl-8 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              min="1"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Remaining Goal */}
                        {donationAmount > 0 && (
                          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                            <p className="text-sm text-primary-700 dark:text-primary-300">
                              Your donation of <strong>{selectedCampaign.currency} {donationAmount}</strong> will help reach the goal of <strong>{selectedCampaign.currency} {selectedCampaign.target_amount}</strong>
                            </p>
                            {donationAmount > (selectedCampaign.goal_amount - selectedCampaign.raised_amount) && (
                              <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                                This amount exceeds the remaining goal by {selectedCampaign.currency} {donationAmount - (selectedCampaign.target_amount - selectedCampaign.raised_amount)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setIsDonationModalOpen(false)}
                          className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDonate}
                          disabled={donating === selectedCampaign.id || donationAmount <= 0}
                          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          {donating === selectedCampaign.id ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            `Donate $${donationAmount}`
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <NotificationToast
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default HealthFinancePage;