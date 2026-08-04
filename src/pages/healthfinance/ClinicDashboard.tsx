import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  DollarSign, 
  Activity, 
  Users, 
  Plus, 
  Edit, 
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
  X
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

interface Campaign {
  id: string;
  title: string;
  category: 'vaccination' | 'equipment' | 'nutrition' | 'telemedicine';
  targetAmount: number;
  raisedAmount: number;
  currency: 'ADA' | 'ALGO' | 'USDC' | 'CUSD';
  status: 'active' | 'completed' | 'pending' | 'paused';
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

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'donations' | 'reports' | 'settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [clinicProfile] = useState<ClinicProfile>({
    id: 'clinic_001',
    name: 'Nasarawa Primary Health Center',
    location: 'Nasarawa State, Nigeria',
    contact: 'info@nasarawaphc.org',
    walletAddress: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt6ll2h',
    verified: true,
    totalRaised: 8450,
    activeCampaigns: 3,
    totalDonors: 67,
    patientsImpacted: 342
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp_001',
      title: 'Vaccinate 200 children against measles',
      category: 'vaccination',
      targetAmount: 2000,
      raisedAmount: 1400,
      currency: 'USDC',
      status: 'active',
      donors: 28,
      description: 'Help us provide measles vaccination to 200 children in our community. This campaign will fund vaccines, syringes, and medical supplies needed for a comprehensive vaccination drive.',
      images: ['https://images.pexels.com/photos/7089626/pexels-photo-7089626.jpeg?auto=compress&cs=tinysrgb&w=400'],
      createdAt: '2024-05-15',
      endDate: '2024-07-15',
      impactGoal: '200 children protected from measles',
      updates: [
        {
          id: 'update_001',
          title: 'Campaign Launch',
          content: 'We have officially launched our measles vaccination campaign. Thank you to our early supporters!',
          date: '2024-05-15'
        },
        {
          id: 'update_002',
          title: '50% Funding Milestone',
          content: 'Amazing news! We have reached 50% of our funding goal. 100 children have already been vaccinated.',
          date: '2024-06-01',
          images: ['https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300']
        }
      ]
    },
    {
      id: 'camp_002',
      title: 'Solar Fridge for vaccine storage',
      category: 'equipment',
      targetAmount: 500,
      raisedAmount: 500,
      currency: 'ADA',
      status: 'completed',
      donors: 15,
      description: 'Fund a solar-powered refrigerator to maintain the cold chain for vaccines in our remote clinic.',
      images: ['https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400'],
      createdAt: '2024-04-01',
      endDate: '2024-05-01',
      impactGoal: 'Reliable vaccine storage for 1,000+ patients',
      updates: [
        {
          id: 'update_003',
          title: 'Solar Fridge Installed',
          content: 'The solar fridge has been successfully installed and is now operational. Thank you to all our donors!',
          date: '2024-05-10'
        }
      ]
    }
  ]);

  const [donations] = useState<Donation[]>([
    {
      id: 'don_001',
      campaignId: 'camp_001',
      campaignTitle: 'Vaccinate 200 children against measles',
      donorId: 'donor_001',
      amount: 100,
      currency: 'USDC',
      date: '2024-06-15T10:30:00Z',
      nftCertificate: 'NFT-001',
      transactionHash: '0x7f9e8d...6b2c1a'
    },
    {
      id: 'don_002',
      campaignId: 'camp_001',
      campaignTitle: 'Vaccinate 200 children against measles',
      donorId: 'donor_002',
      amount: 50,
      currency: 'ADA',
      date: '2024-06-14T14:20:00Z',
      nftCertificate: 'NFT-002',
      transactionHash: '0x3a5b7c...9e8f2d'
    }
  ]);

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

  const handleCreateCampaign = () => {
    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      title: newCampaign.title,
      category: newCampaign.category,
      targetAmount: parseFloat(newCampaign.targetAmount),
      raisedAmount: 0,
      currency: newCampaign.currency,
      status: 'pending',
      donors: 0,
      description: newCampaign.description,
      images: ['https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400'],
      createdAt: new Date().toISOString().split('T')[0],
      endDate: newCampaign.endDate,
      impactGoal: newCampaign.impactGoal,
      updates: []
    };

    setCampaigns(prev => [...prev, campaign]);
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
  };

  const handlePublishUpdate = () => {
    if (!selectedCampaign) return;

    const update = {
      id: `update_${Date.now()}`,
      title: newUpdate.title,
      content: newUpdate.content,
      date: new Date().toISOString().split('T')[0],
      images: newUpdate.images.length > 0 ? ['https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300'] : undefined
    };

    setCampaigns(prev => prev.map(campaign => 
      campaign.id === selectedCampaign.id 
        ? { ...campaign, updates: [...campaign.updates, update] }
        : campaign
    ));

    setIsUpdateModalOpen(false);
    setNewUpdate({ title: '', content: '', images: [] });
    setSelectedCampaign(null);
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

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Donors Supported</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {clinicProfile.totalDonors}
              </p>
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
              <Users className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-secondary-600 dark:text-secondary-400">
            <Heart className="h-4 w-4 mr-1" />
            From 12 countries
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Patients Impacted</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {clinicProfile.patientsImpacted}
              </p>
            </div>
            <div className="bg-accent-100 dark:bg-accent-900/20 p-3 rounded-full">
              <Heart className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-accent-600 dark:text-accent-400">
            <CheckCircle className="h-4 w-4 mr-1" />
            Lives changed
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
              <p className="font-medium text-primary-600 dark:text-primary-400">Create New Campaign</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('donations')}
            className="flex items-center justify-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
          >
            <div className="text-center">
              <Eye className="h-8 w-8 text-secondary-600 dark:text-secondary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-neutral-900 dark:text-white">View Donations</p>
            </div>
          </button>
          
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Recent Donations</h3>
          <div className="space-y-3">
            {donations.slice(0, 5).map(donation => (
              <div key={donation.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {donation.amount} {donation.currency}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(donation.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">NFT: {donation.nftCertificate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
    </div>
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img 
                src={campaign.images[0]} 
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
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
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
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
                  <button className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">HealthFinance</span>
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
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{clinicProfile.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{clinicProfile.location}</p>
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
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === item.id
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
                  { id: 'reports', label: 'Reports', icon: FileText },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === item.id
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
                      onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
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
                        onChange={(e) => setNewCampaign({...newCampaign, category: e.target.value as Campaign['category']})}
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
                        onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
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
                        onChange={(e) => setNewCampaign({...newCampaign, targetAmount: e.target.value})}
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
                        onChange={(e) => setNewCampaign({...newCampaign, currency: e.target.value as Campaign['currency']})}
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
                      onChange={(e) => setNewCampaign({...newCampaign, impactGoal: e.target.value})}
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
                      onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="Describe your campaign, budget breakdown, and expected impact..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Campaign Images
                    </label>
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
                      />
                      <label
                        htmlFor="campaign-images"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block"
                      >
                        Choose Images
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateCampaignModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Submit for Verification
                </button>
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
                      onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
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
                      onChange={(e) => setNewUpdate({...newUpdate, content: e.target.value})}
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

export default ClinicDashboard;