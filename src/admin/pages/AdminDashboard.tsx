import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  DollarSign,
  Activity,
  Users,
  Plus,
  Edit,
  ExternalLink,
  Eye,
  Download,
  Upload,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Heart,
  Target,
  Globe,
  Wallet,
  FileText,
  Camera,
  Send,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  User,
  Menu,
  X,
  Building,
  MapPin,
  Stethoscope,
  Baby,
  UserPlus
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import peraWalletService from '../../services/peraWalletService';

// Interfaces from ClinicDashboard
// Update the Campaign interface to match backend structure
interface Campaign {
  id: string;
  title: string;
  category: 'vaccination' | 'equipment' | 'nutrition' | 'telemedicine';
  targetAmount: number;
  raisedAmount: number;
  currency: 'ADA' | 'ALGO' | 'USDC' | 'CUSD';
  status: 'active' | 'completed' | 'pending' | 'paused' | 'withdrawn';
  donors: number;
  description: string;
  images: string[];
  createdAt: string;
  endDate: string;
  impactGoal: string;
  updates: {
    id: string;
    title: string;
    content: string;
    date: string;
    images?: string[];
  }[];
  // Add fields from backend
  creator?: {
    name: string;
    wallet: string;
  };
  escrowAddress?: string;
  escrowBalance?: number;
  _count?: {
    donations: number;
  };
}

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorId: string;
  amount: number;
  currency: string;
  date: string;
  nftCertificate: string;
  transactionHash: string;
}

interface ClinicProfile {
  id: string;
  name: string;
  location: string;
  contact: string;
  walletAddress: string;
  verified: boolean;
  totalRaised: number;
  activeCampaigns: number;
  totalDonors: number;
  patientsImpacted: number;
}

// Interfaces from AdminDashboard
interface DashboardStats {
  totalHealthWorkers: number;
  activeHealthWorkers: number;
  totalChildren: number;
  totalParents: number;
  vaccinationsThisMonth: number;
  pendingActions: number;
  availableVaccines: number;
  overdueVaccinations: number;
}

interface ActivityItem {
  id: string;
  type: 'vaccination' | 'registration' | 'parent' | 'vaccine';
  message: string;
  timestamp: string;
  user: string;
  status: 'completed' | 'pending';
}

const CentralAdminDashboard = () => {
  const navigate = useNavigate();

  // Auth states
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any | null>(null);

  // Campaign loading state
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Create campaign loading state
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [createCampaignError, setCreateCampaignError] = useState<string | null>(null);

  // UI states from existing file
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'donations' | 'reports' | 'settings' | 'healthcare'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Withdrawal states
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  // // Clinic data
  const [clinicProfile] = useState<ClinicProfile>({
    id: 'clinic_001',
    name: 'Nasarawa Primary Health Center',
    location: 'Nasarawa State, Nigeria',
    contact: 'info@nasarawaphc.org',
    walletAddress: localStorage.getItem('admin_wallet_address'),
    verified: true,
    totalRaised: 8450,
    activeCampaigns: 3,
    totalDonors: 67,
    patientsImpacted: 342
  });


  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  //     campaignTitle: 'Vaccinate 200 children against measles',
  //     donorId: 'donor_001',
  //     amount: 100,
  //     currency: 'USDC',
  //     date: '2024-06-15T10:30:00Z',
  //     nftCertificate: 'NFT-001',
  //     transactionHash: '0x7f9e8d...6b2c1a'
  //   },
  //   {
  //     id: 'don_002',
  //     campaignId: 'camp_001',
  //     campaignTitle: 'Vaccinate 200 children against measles',
  //     donorId: 'donor_002',
  //     amount: 50,
  //     currency: 'ADA',
  //     date: '2024-06-14T14:20:00Z',
  //     nftCertificate: 'NFT-002',
  //     transactionHash: '0x3a5b7c...9e8f2d'
  //   }
  // ]);

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    category: 'vaccination' as Campaign['category'],
    targetAmount: '',
    currency: 'USDC' as Campaign['currency'],
    description: '',
    impactGoal: '',
    endDate: '',
    images: [] as File[]
  });

  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    images: [] as File[]
  });

  // Healthcare Admin data
  const [stats, setStats] = useState<DashboardStats>({
    totalHealthWorkers: 247,
    activeHealthWorkers: 231,
    totalChildren: 1856,
    totalParents: 1234,
    vaccinationsThisMonth: 342,
    pendingActions: 8,
    availableVaccines: 24,
    overdueVaccinations: 23,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'vaccination',
      message: 'DTaP vaccination recorded for Emma Davis',
      timestamp: '2 minutes ago',
      user: 'Dr. Sarah Johnson',
      status: 'completed'
    },
    {
      id: '2',
      type: 'registration',
      message: 'New health worker registered: Dr. Michael Chen',
      timestamp: '15 minutes ago',
      user: 'Admin User',
      status: 'completed'
    },
    {
      id: '3',
      type: 'parent',
      message: 'New parent registration: Sarah Johnson',
      timestamp: '1 hour ago',
      user: 'System',
      status: 'pending'
    },
    {
      id: '4',
      type: 'vaccine',
      message: 'New vaccine batch added: MMR-2024-005',
      timestamp: '2 hours ago',
      user: 'Admin User',
      status: 'completed'
    }
  ]);


  // Fetch campaigns when component mounts and when authenticated
  useEffect(() => {
    if (isAuthenticatedAdmin) {
      fetchCampaigns();
    }
  }, [isAuthenticatedAdmin]);

  // --- Authentication / session handling ------------------------------------------------

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        setIsLoadingAuth(true);

        // Check localStorage for wallet-based admin session
        const localAdmin = localStorage.getItem('hospital_admin');
        const authTimestamp = localStorage.getItem('admin_auth_timestamp');

        if (!localAdmin || !authTimestamp) {
          setAuthError('No active admin session found');
          setTimeout(() => navigate('/admin/login', { replace: true }), 1200);
          return;
        }

        // Validate session is not expired (24 hour expiry)
        const loginTime = new Date(authTimestamp).getTime();
        const currentTime = new Date().getTime();
        const sessionAge = (currentTime - loginTime) / (1000 * 60 * 60); // hours

        if (sessionAge > 24) {
          localStorage.removeItem('hospital_admin');
          localStorage.removeItem('admin_wallet_address');
          localStorage.removeItem('admin_auth_timestamp');
          setAuthError('Session expired. Please log in again.');
          setTimeout(() => navigate('/admin/login', { replace: true }), 1200);
          return;
        }

        // Parse and validate admin data
        const adminData = JSON.parse(localAdmin);
        if (!adminData.id || !adminData.wallet_address) {
          throw new Error('Invalid admin session data');
        }

        if (mounted) {
          setAdminProfile(adminData);
          setIsAuthenticatedAdmin(true);
          setAuthError(null);
        }
      } catch (err: any) {
        console.error('Admin auth check error:', err);
        if (mounted) {
          setAuthError(err.message || 'Authentication check failed');
          setTimeout(() => navigate('/admin/login', { replace: true }), 1200);
        }
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    };

    checkAuth();

    // Optional: Set up periodic session validation (check every minute)
    const sessionCheckInterval = setInterval(() => {
      const authTimestamp = localStorage.getItem('admin_auth_timestamp');
      if (authTimestamp) {
        const loginTime = new Date(authTimestamp).getTime();
        const currentTime = new Date().getTime();
        const sessionAge = (currentTime - loginTime) / (1000 * 60 * 60);

        if (sessionAge > 24) {
          localStorage.clear();
          navigate('/admin/login', { replace: true });
        }
      }
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [navigate]);

  // Helper: get headers with auth token for external authenticated endpoints
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      // 1) Check if we already have a cached JWT token
      const cachedToken = localStorage.getItem('admin_jwt_token');
      const tokenExpiry = localStorage.getItem('admin_jwt_expiry');

      if (cachedToken && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const currentTime = Date.now();

        // If token is still valid, use it
        if (currentTime < expiryTime) {
          return { Authorization: `Bearer ${cachedToken}` };
        }
      }

      // 2) If no valid cached token, get a new one by exchanging wallet_address
      const walletAddress = localStorage.getItem('admin_wallet_address');
      if (!walletAddress) {
        console.warn('No wallet address found');
        return {};
      }
      const res = await fetch('https://medfinet-backend.onrender.com/api/admin/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn('wallet-login exchange failed:', res.status, errorText);
        return {};
      }

      const json = await res.json();
      if (json?.token) {
        // Cache the token (JWT valid for 24 hours)
        localStorage.setItem('admin_jwt_token', json.token);
        localStorage.setItem('admin_jwt_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());

        return { Authorization: `Bearer ${json.token}` };
      }

      return {};
    } catch (err) {
      console.error('getAuthHeaders error:', err);
      return {};
    }
  };
  // Function to upload images to Supabase
  const uploadImagesToSupabase = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `campaign-images/${fileName}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('campaigns') // Make sure this bucket exists in your Supabase storage
          .upload(filePath, file);

        if (error) {
          console.error('Error uploading image:', error);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('campaigns')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error('Error in uploadImagesToSupabase:', error);
    }

    return uploadedUrls;
  };

  // Add this function to handle file selection
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewCampaign(prev => ({
        ...prev,
        images: [...prev.images, ...fileArray]
      }));
    }
  };

  // Add this function to remove selected images
  const removeSelectedImage = (index: number) => {
    setNewCampaign(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Fetch campaigns from backend
  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true);
    setApiError(null);
    try {
      const walletAddress = localStorage.getItem('admin_wallet_address');
      if (!walletAddress) {
        throw new Error('No wallet address found');
      }

      const res = await fetch('https://medfinet-backend.onrender.com/api/campaigns', {
        method: 'GET'
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch campaigns: ${res.status} ${text}`);
      }

      const response = await res.json();

      // Handle both response formats
      const campaignsData = response.data || response.campaigns || response;

      if (!Array.isArray(campaignsData)) {
        throw new Error('Invalid campaigns data format');
      }

      // Filter campaigns by creator wallet address
      const filteredCampaigns = campaignsData.filter(campaign =>
        campaign.creatorWallet === walletAddress
      );
      console.log(filteredCampaigns)

      // Transform data to match frontend format
      const transformedCampaigns: Campaign[] = filteredCampaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        category: campaign.category,
        targetAmount: campaign.targetAmount,
        raisedAmount: campaign.raisedAmount || campaign.escrowBalance || 0,
        currency: campaign.currency,
        status: campaign.status,
        donors: campaign._count?.donations || campaign.donors || 0,
        description: campaign.description,
        images: campaign.imageUrl,
        createdAt: campaign.createdAt,
        endDate: campaign.endDate,
        impactGoal: campaign.impactGoal,
        updates: campaign.updates || [],
        creator: campaign.creator,
        escrowAddress: campaign.escrowAddress,
        escrowBalance: campaign.escrowBalance
      }));

      setCampaigns(transformedCampaigns);
    } catch (err: any) {
      console.error('fetchCampaigns error', err);
      setApiError(err.message || 'Unable to load campaigns');

      // Fallback to empty array on error
      setCampaigns([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear all auth data
      localStorage.removeItem('hospital_admin');
      localStorage.removeItem('admin_wallet_address');
      localStorage.removeItem('admin_auth_timestamp');
      localStorage.removeItem('admin_jwt_token');      // <-- added
      localStorage.removeItem('admin_jwt_expiry');     // <-- added

      setIsAuthenticatedAdmin(false);
      setAdminProfile(null);

      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Clinic functions
  const handleCreateCampaign = async () => {
    // Reset previous error and set loading
    setCreateCampaignError(null);
    setIsCreatingCampaign(true);

    let imageUrls: string[] = [];
    if (newCampaign.images.length > 0) {
      imageUrls = await uploadImagesToSupabase(newCampaign.images);
      if (imageUrls.length === 0) {
        throw new Error('Failed to upload images. Please try again.');
      }
    }
    let imageUrl = imageUrls[0]
    console.log(imageUrl);

    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      title: newCampaign.title,
      category: newCampaign.category,
      targetAmount: parseFloat(newCampaign.targetAmount || '0'),
      raisedAmount: 0,
      currency: newCampaign.currency,
      status: 'pending',
      donors: 0,
      description: newCampaign.description,
      imageUrl: imageUrl,
      createdAt: new Date().toISOString().split('T')[0],
      endDate: newCampaign.endDate,
      impactGoal: newCampaign.impactGoal,
      updates: []
    };

    try {
      if (!isAuthenticatedAdmin) throw new Error('Not authenticated');

      const headers = await getAuthHeaders();
      const res = await fetch('https://medfinet-backend.onrender.com/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(campaign)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
      }

      const created = await res.json();
      console.log(created)

      await fetchCampaigns();
      // on success: add campaign, clear form and close modal
      setCampaigns(prev => [...prev, created || campaign]);
      setIsCreateCampaignModalOpen(false);
      setNewCampaign({
        title: '',
        category: 'vaccination',
        targetAmount: '',
        currency: 'USDC',
        description: '',
        impactGoal: '',
        endDate: '',
        images: []
      });
    } catch (err: any) {
      // keep modal open so user can retry; show error
      console.warn('Create campaign failed:', err);
      setCreateCampaignError('Failed to create campaign. Please check input or try again.');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const handlePublishUpdate = async () => {
    if (!selectedCampaign) return;

    // Upload images to Supabase if any
    let imageUrls: string[] = [];
    if (newUpdate.images.length > 0) {
      imageUrls = await uploadImagesToSupabase(newUpdate.images);
    }

    const updateData = {
      title: newUpdate.title,
      content: newUpdate.content,
      images: imageUrls // Use uploaded URLs
    };

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`https://medfinet-backend.onrender.com/api/campaigns/${selectedCampaign.id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      // Refresh campaigns to get the updated data
      await fetchCampaigns();

    } catch (err) {
      console.warn('Publish update failed:', err);
      // Fallback to local update if API fails
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === selectedCampaign.id
          ? {
            ...campaign,
            updates: [...campaign.updates, {
              id: `update_${Date.now()}`,
              title: newUpdate.title,
              content: newUpdate.content,
              date: new Date().toISOString().split('T')[0],
              images: newUpdate.images.length > 0 ? ['https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300'] : undefined
            }]
          }
          : campaign
      ));
    } finally {
      setIsUpdateModalOpen(false);
      setNewUpdate({ title: '', content: '', images: [] });
      setSelectedCampaign(null);
    }
  };

  // Check if campaign can be withdrawn
  const canWithdrawCampaign = (campaign: Campaign): boolean => {
    //   // Campaign must be active or completed
    //   if (campaign.status === 'withdrawn') return false;

    //   // Check if campaign has ended (end date passed)
    //   const endDate = new Date(campaign.endDate);
    //   const today = new Date();
    //   const hasEnded = endDate <= today;

    //   // Or check if funding goal is reached
    //   const goalReached = campaign.raisedAmount >= campaign.targetAmount;

    //   // Must have funds to withdraw
    //   const hasFunds = campaign.raisedAmount > 0 && (campaign.escrowBalance || campaign.raisedAmount) > 0;

    //   return (hasEnded || goalReached) && hasFunds;
    // };
    // Quick frontend checks
    if (campaign.status === 'withdrawn') return false;

    const endDate = new Date(campaign.endDate);
    const today = new Date();
    const hasEnded = endDate <= today;

    const goalReached = campaign.raisedAmount >= campaign.targetAmount;
    const hasFunds = campaign.raisedAmount > 0 && (campaign.escrowBalance || campaign.raisedAmount) > 0;

    return (hasEnded || goalReached) && hasFunds;
  };

  // Optional: Enhanced version that checks with backend
  // const checkWithdrawalEligibility = async (campaignId: string) => {
  //   try {
  //     const headers = await getAuthHeaders();
  //     const response = await fetch(
  //       `http://localhost:5000/api/withdrawal/campaigns/${campaignId}/can-withdraw`,
  //       {
  //         headers
  //       }
  //     );

  //     if (response.ok) {
  //       const result = await response.json();
  //       return result.data;
  //     }
  //   } catch (error) {
  //     console.error('Failed to check withdrawal eligibility:', error);
  //   }

  //   return { canWithdraw: false, reason: 'Unable to check eligibility' };
  // };

  // Handle withdrawal with two-step process
  const handleWithdrawFunds = async (campaign: Campaign) => {
    if (!isAuthenticatedAdmin) {
      setWithdrawalError('Authentication required');
      return;
    }

    setIsWithdrawing(campaign.id);
    setWithdrawalError(null);

    try {
      const headers = await getAuthHeaders();

      // Step 1: Initiate withdrawal using the new endpoint
      const initiateResponse = await fetch(
        `https://medfinet-backend.onrender.com/api/withdrawals/${campaign.id}/withdraw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            recipientWallet: clinicProfile.walletAddress
          })
        }
      );

      if (!initiateResponse.ok) {
        const errorText = await initiateResponse.text();
        throw new Error(`Withdrawal initiation failed: ${initiateResponse.status} ${errorText}`);
      }

      const initiateResult = await initiateResponse.json();

      // Step 2: Sign the transaction (you'll need to implement wallet integration)
      console.log('Transaction to sign:', initiateResult.data.unsignedTransaction);

      // For now, we'll complete the withdrawal without signing (for testing)
      // const signedTransaction = await signTransaction(initiateResult.data.unsignedTransaction);
      const signedTransaction = await peraWalletService.signTransaction(
        initiateResult.data.unsignedTransaction
      );
      // Step 3: Complete withdrawal with signed transaction
      const completeResponse = await fetch(
        `https://medfinet-backend.onrender.com/api/withdrawals/${initiateResult.data.withdrawalId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            signedTransaction: signedTransaction
          })
        }
      );

      if (!completeResponse.ok) {
        const errorText = await completeResponse.text();
        throw new Error(`Withdrawal completion failed: ${completeResponse.status} ${errorText}`);
      }

      const completeResult = await completeResponse.json();

      // Refresh campaigns to update status
      await fetchCampaigns();

      // Show success message
      console.log('Withdrawal successful:', completeResult);

      // Optional: Show success notification to user
      alert(`Successfully withdrew ${completeResult.data.amount} ${campaign.currency}! Transaction: ${completeResult.data.transactionHash}`);

    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setWithdrawalError(err.message || 'Failed to withdraw funds');
    } finally {
      setIsWithdrawing(null);
    }
  };

  // Update campaign status based on conditions
  const getCampaignStatus = (campaign: Campaign) => {
    const endDate = new Date(campaign.endDate);
    const today = new Date();

    if (campaign.status === 'withdrawn') return 'withdrawn';
    if (endDate <= today) return 'completed';
    if (campaign.raisedAmount >= campaign.targetAmount) return 'completed';
    return campaign.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-50 border-success-200';
      case 'completed': return 'text-primary-600 bg-primary-50 border-primary-200';
      case 'pending': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'paused': return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vaccination': return <Shield className="h-4 w-4" />;
      case 'equipment': return <Activity className="h-4 w-4" />;
      case 'nutrition': return <Heart className="h-4 w-4" />;
      case 'telemedicine': return <Globe className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Healthcare Admin functions
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return <Shield className="h-4 w-4 text-primary-600" />;
      case 'registration':
        return <UserPlus className="h-4 w-4 text-success-600" />;
      case 'parent':
        return <Users className="h-4 w-4 text-secondary-600" />;
      case 'vaccine':
        return <Activity className="h-4 w-4 text-accent-600" />;
      default:
        return <Activity className="h-4 w-4 text-neutral-600" />;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-50';
      case 'pending':
        return 'text-warning-600 bg-warning-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  // Render functions for each tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Combined Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clinic Metrics */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Funds Raised</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                ${clinicProfile.totalRaised.toLocaleString()}
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            +15% this month
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Campaigns</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {clinicProfile.activeCampaigns}
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
              <Activity className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-primary-600 dark:text-primary-400">
            <Target className="h-4 w-4 mr-1" />
            2 pending approval
          </div>
        </div>

        {/* Healthcare Metrics */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Health Workers</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.activeHealthWorkers}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                of {stats.totalHealthWorkers} total
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
              <Stethoscope className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12% this month
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Children Registered</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.totalChildren.toLocaleString()}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {stats.totalParents} parents
              </p>
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
              <Baby className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            +8% this month
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setIsCreateCampaignModalOpen(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-primary-600 dark:text-primary-400">Create Campaign</p>
            </div>
          </button>

          <Link
            to="/admin/users?tab=health-workers&action=add"
            className="flex items-center justify-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
          >
            <div className="text-center">
              <UserPlus className="h-8 w-8 text-secondary-600 dark:text-secondary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-neutral-900 dark:text-white">Add Health Worker</p>
            </div>
          </Link>

          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center justify-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
          >
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-accent-600 dark:text-accent-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-neutral-900 dark:text-white">Generate Report</p>
            </div>
          </button>

          <button className="flex items-center justify-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group">
            <div className="text-center">
              <Wallet className="h-8 w-8 text-success-600 dark:text-success-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-neutral-900 dark:text-white">Connect Wallet</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity & Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity from Healthcare Admin */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Activity</h3>
            <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {activity.message}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                      <Users className="h-3 w-3 mr-1" />
                      {activity.user}
                    </div>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Performance from Clinic Dashboard */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Campaign Performance</h3>
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">{campaign.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  <span>{Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}% funded</span>
                  <span>{campaign.donors} donors</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-1">
                  <div
                    className="bg-primary-600 h-1 rounded-full"
                    style={{ width: `${(campaign.raisedAmount / campaign.targetAmount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            System Health
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Database</span>
              </div>
              <span className="text-sm text-success-600 dark:text-success-400 font-medium">Operational</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">API Services</span>
              </div>
              <span className="text-sm text-success-600 dark:text-success-400 font-medium">99.9% Uptime</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-warning-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Data Sync</span>
              </div>
              <span className="text-sm text-warning-600 dark:text-warning-400 font-medium">Syncing</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Authentication</span>
              </div>
              <span className="text-sm text-success-600 dark:text-success-400 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Critical Alerts
          </h3>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning-800 dark:text-warning-300">
                  {stats.overdueVaccinations} children have overdue vaccinations
                </p>
                <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                  Requires immediate follow-up
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
              <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary-800 dark:text-primary-300">
                  System running optimally
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  All services operational
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success-800 dark:text-success-300">
                  All systems operational
                </p>
                <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                  No critical issues detected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Keep all other render functions from ClinicDashboard (campaigns, donations, reports, settings)
  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Your Campaigns</h2>
        <button
          onClick={() => setIsCreateCampaignModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </button>
      </div>

      {/* Withdrawal Error Alert */}
      {withdrawalError && (
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-400 mr-3" />
            <p className="text-error-800 dark:text-error-300">{withdrawalError}</p>
            <button
              onClick={() => setWithdrawalError(null)}
              className="ml-auto text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isLoadingCampaigns ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : apiError ? (
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-warning-600 dark:text-warning-400 mx-auto mb-2" />
          <p className="text-warning-800 dark:text-warning-300">{apiError}</p>
          <button
            onClick={fetchCampaigns}
            className="mt-3 bg-warning-600 hover:bg-warning-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <Activity className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No campaigns found</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            You haven't created any campaigns yet. Start your first fundraising campaign to make an impact.
          </p>
          <button
            onClick={() => setIsCreateCampaignModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium flex items-center mx-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map(campaign => {
            const canWithdraw = canWithdrawCampaign(campaign);
            const isWithdrawingThis = isWithdrawing === campaign.id;
            const campaignStatus = getCampaignStatus(campaign);

            return (
              <div key={campaign.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={campaign.images || 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Withdrawal Badge */}
                  {campaign.status === 'withdrawn' && (
                    <div className="absolute top-3 right-3 bg-success-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Funds Withdrawn
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-primary-100 dark:bg-primary-900/20 p-1 rounded mr-2">
                        {getCategoryIcon(campaign.category)}
                      </div>
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400 capitalize">
                        {campaign.category}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaignStatus)}`}>
                      {campaignStatus}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {campaign.title}
                  </h3>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600 dark:text-neutral-300">Progress</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {campaign.raisedAmount} / {campaign.targetAmount} {campaign.currency}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      <span>{Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}% funded</span>
                      <span>{campaign.donors} donors</span>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400">End Date:</span>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400">Raised:</span>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {campaign.raisedAmount} {campaign.currency}
                      </p>
                    </div>
                  </div>

                  {/* Withdrawal Section */}
                  {canWithdraw && campaign.status !== 'withdrawn' && (
                    <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-success-800 dark:text-success-300">
                            Funds ready for withdrawal
                          </p>
                          <p className="text-xs text-success-600 dark:text-success-400">
                            {campaign.escrowBalance || campaign.raisedAmount} {campaign.currency} available
                          </p>
                        </div>
                        <button
                          onClick={() => handleWithdrawFunds(campaign)}
                          disabled={isWithdrawingThis}
                          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${isWithdrawingThis
                              ? 'bg-success-400 cursor-not-allowed'
                              : 'bg-success-600 hover:bg-success-700'
                            } text-white`}
                        >
                          {isWithdrawingThis ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Withdrawing...
                            </>
                          ) : (
                            <>
                              <Wallet className="h-4 w-4 mr-2" />
                              Withdraw Funds
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {campaign.status === 'withdrawn' && campaign.withdrawnAmount && (
                    <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {campaign.withdrawnAmount} {campaign.currency} withdrawn
                          </p>
                          {campaign.withdrawnAt && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(campaign.withdrawnAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setIsUpdateModalOpen(true);
                      }}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Publish Update
                    </button>
                    <div className="flex space-x-2">
                      {/* <button className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300">
                      <Eye className="h-4 w-4" />
                    </button> */}
                      <button
                        onClick={() => window.open(`https://testnet.explorer.perawallet.app/transactions/?transaction_list_address=${campaign.escrowAddress}`, '_blank')}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderDonations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Donation History</h2>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  NFT Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Transaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {donations.map(donation => (
                <tr key={donation.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white">
                    {donation.campaignTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                    {donation.amount} {donation.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                    {donation.nftCertificate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                    {donation.transactionHash.substring(0, 10)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Impact Reports</h2>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Monthly Impact Report</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Children Vaccinated:</span>
              <span className="font-medium text-neutral-900 dark:text-white">150</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Funds Raised:</span>
              <span className="font-medium text-neutral-900 dark:text-white">$2,300</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">New Donors:</span>
              <span className="font-medium text-neutral-900 dark:text-white">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Equipment Purchased:</span>
              <span className="font-medium text-neutral-900 dark:text-white">1 Solar Fridge</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
            Download PDF Report
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Share Updates</h3>
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            Keep your donors engaged by sharing regular updates about your impact.
          </p>
          <div className="space-y-3">
            {campaigns.filter(c => c.status === 'active').map(campaign => (
              <button
                key={campaign.id}
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setIsUpdateModalOpen(true);
                }}
                className="w-full text-left p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{campaign.title}</span>
                  <Send className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Clinic Settings</h2>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Clinic Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Clinic Name
            </label>
            <input
              type="text"
              value={clinicProfile.name}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={clinicProfile.location}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={clinicProfile.contact}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={clinicProfile.walletAddress}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-mono text-sm"
              readOnly
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Verification Status</h3>
        <div className="flex items-center p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
          <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400 mr-3" />
          <div>
            <p className="font-medium text-success-800 dark:text-success-300">Clinic Verified</p>
            <p className="text-sm text-success-600 dark:text-success-400">Your clinic has been verified and approved for fundraising</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHealthcare = () => (
    <div className="space-y-6">
      {/* Healthcare Admin Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Health Workers</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.activeHealthWorkers}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                of {stats.totalHealthWorkers} total
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
              <Stethoscope className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12% this month
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Children</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.totalChildren}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {stats.totalParents} parents
              </p>
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
              <Baby className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            +8% this month
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Vaccinations (Month)</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.vaccinationsThisMonth}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {stats.availableVaccines} vaccine types
              </p>
            </div>
            <div className="bg-accent-100 dark:bg-accent-900/20 p-3 rounded-full">
              <Shield className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            +15% vs last month
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Overdue Vaccines</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.overdueVaccinations}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                require attention
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900/20 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-warning-600 dark:text-warning-400">
            <Clock className="h-4 w-4 mr-1" />
            Action needed
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/admin/users?tab=health-workers&action=add"
              className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group block"
            >
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Add Health Worker</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Create new account</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/vaccines?action=add"
              className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group block"
            >
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-secondary-600 dark:text-secondary-400 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Add Vaccine</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Upload new vaccine</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group block"
            >
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-accent-600 dark:text-accent-400 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Generate Reports</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Export analytics</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/api"
              className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group block"
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-neutral-600 dark:text-neutral-400 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">API Management</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Configure access</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {activity.message}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                      <Users className="h-3 w-3 mr-1" />
                      {activity.user}
                    </div>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- Auth UI gating ---------------------------------------------------------------
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-300">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  if (authError || !isAuthenticatedAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning-600 dark:text-warning-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Admin Authentication Required
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            {authError || 'Please sign in with an admin account to continue.'}
          </p>
          <button
            onClick={() => navigate('/admin/login', { replace: true })}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  // If authenticated, render original admin dashboard UI
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                className="md:hidden mr-2 p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/healthfinance" className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors">
                <Shield className="h-8 w-8 mr-2" />
                <div>
                  <span className="text-xl font-bold">MedFiNet</span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">Central Admin</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              <button className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-neutral-800"></span>
              </button>

              <div className="flex items-center space-x-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg p-2 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <User className="h-5 w-5" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{adminProfile?.name || 'Central Administrator'}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">MedFiNet Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'campaigns', label: 'Campaigns', icon: Activity },
                { id: 'donations', label: 'Donations', icon: DollarSign },
                { id: 'healthcare', label: 'Healthcare', icon: Stethoscope },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === item.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'campaigns', label: 'Campaigns', icon: Activity },
                  { id: 'donations', label: 'Donations', icon: DollarSign },
                  { id: 'healthcare', label: 'Healthcare', icon: Stethoscope },
                  { id: 'reports', label: 'Reports', icon: FileText },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeTab === item.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => navigate('/healthfinance')}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Back to HealthFinance
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'campaigns' && renderCampaigns()}
            {activeTab === 'donations' && renderDonations()}
            {activeTab === 'healthcare' && renderHealthcare()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>

      {/* Create Campaign Modal */}
      {isCreateCampaignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsCreateCampaignModalOpen(false)}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-2xl mx-auto z-10">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Create New Campaign</h3>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="e.g., Vaccinate 100 children against polio"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={newCampaign.category}
                        onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value as Campaign['category'] })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      >
                        <option value="vaccination">Vaccination</option>
                        <option value="equipment">Equipment</option>
                        <option value="nutrition">Nutrition</option>
                        <option value="telemedicine">Telemedicine</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={newCampaign.endDate}
                        onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Target Amount *
                      </label>
                      <input
                        type="number"
                        value={newCampaign.targetAmount}
                        onChange={(e) => setNewCampaign({ ...newCampaign, targetAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Currency *
                      </label>
                      <select
                        value={newCampaign.currency}
                        onChange={(e) => setNewCampaign({ ...newCampaign, currency: e.target.value as Campaign['currency'] })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      >
                        <option value="USDC">USDC</option>
                        <option value="ADA">ADA</option>
                        <option value="ALGO">ALGO</option>
                        <option value="CUSD">CUSD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Impact Goal *
                    </label>
                    <input
                      type="text"
                      value={newCampaign.impactGoal}
                      onChange={(e) => setNewCampaign({ ...newCampaign, impactGoal: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="e.g., 200 children protected from measles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="Describe your campaign, budget breakdown, and expected impact..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Campaign Images
                    </label>

                    {/* Show selected images preview */}
                    {newCampaign.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          Selected images ({newCampaign.images.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {newCampaign.images.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeSelectedImage(index)}
                                className="absolute -top-1 -right-1 bg-error-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        Upload photos of your clinic, equipment, or community
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="campaign-images"
                        onChange={handleImageSelection}
                      />
                      <label
                        htmlFor="campaign-images"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block"
                      >
                        Choose Images
                      </label>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        PNG, JPG, JPEG up to 5MB each
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    if (isCreatingCampaign) return;
                    setIsCreateCampaignModalOpen(false);
                    setCreateCampaignError(null);
                  }}
                  className={`mr-3 px-4 py-2 rounded ${isCreatingCampaign ? 'opacity-50 cursor-not-allowed' : 'bg-neutral-200'}`}
                  disabled={isCreatingCampaign}
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCreateCampaign}
                    disabled={isCreatingCampaign}
                    className={`px-4 py-2 text-white rounded ${isCreatingCampaign ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
                  >
                    {isCreatingCampaign ? 'Creating...' : 'Create Campaign'}
                  </button>
                  {createCampaignError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {createCampaignError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Update Modal */}
      {isUpdateModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsUpdateModalOpen(false)}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-2xl mx-auto z-10">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Publish Update - {selectedCampaign.title}
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Update Title *
                    </label>
                    <input
                      type="text"
                      value={newUpdate.title}
                      onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="e.g., 75% Funding Milestone Reached"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Update Content *
                    </label>
                    <textarea
                      value={newUpdate.content}
                      onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="Share your progress, impact achieved, or any challenges..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Update Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-4 text-center">
                      <Camera className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        Add photos to show your progress
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="update-images"
                      />
                      <label
                        htmlFor="update-images"
                        className="bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block"
                      >
                        Choose Images
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishUpdate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralAdminDashboard;