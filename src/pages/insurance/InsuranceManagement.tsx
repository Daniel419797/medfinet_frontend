import { useState, useContext } from 'react';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  User, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Shield,
  Download,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { useApi, useApiLazy } from '../../hooks/useMedfinetApi';
import { medfinetInsuranceApi } from '../../services/medfinetInsuranceApi';

interface InsurancePolicy {
  id: string;
  policyNumber: string;
  provider: string;
  type: 'health' | 'dental' | 'vision' | 'supplemental';
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  premium: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  coverage: {
    individual: boolean;
    family: boolean;
    members: string[];
  };
  benefits: {
    name: string;
    description: string;
    coverage: string;
  }[];
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
  nextPaymentDate: string;
}

interface Claim {
  id: string;
  policyId: string;
  claimNumber: string;
  patientName: string;
  serviceDate: string;
  provider: string;
  service: string;
  amount: number;
  status: 'submitted' | 'in-review' | 'approved' | 'denied' | 'paid';
  submissionDate: string;
  documents: string[];
  notes?: string;
}

const InsuranceManagement = () => {
  const { organizationId } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'payments'>('policies');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const { execute: submitClaim, loading: submittingClaim } = useApiLazy();
  const { execute: createPolicy, loading: creatingPolicy } = useApiLazy();

  const { data: policiesData, loading: policiesLoading, error: policiesError } = useApi(
    () => organizationId ? medfinetInsuranceApi.listPolicies(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const { data: claimsData, loading: claimsLoading, error: claimsError } = useApi(
    () => organizationId ? medfinetInsuranceApi.listClaims(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const policies: InsurancePolicy[] = policiesData ?? [];
  const claims: Claim[] = claimsData ?? [];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'paid':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'pending':
      case 'in-review':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'expired':
      case 'denied':
        return 'text-error-600 bg-error-50 border-error-200';
      case 'cancelled':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'pending':
      case 'in-review':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'expired':
      case 'denied':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'health':
        return <Shield className="h-5 w-5 text-primary-600" />;
      case 'dental':
        return <User className="h-5 w-5 text-secondary-600" />;
      case 'vision':
        return <User className="h-5 w-5 text-accent-600" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Insurance Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Manage your insurance policies, claims, and payments
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'policies', label: 'Insurance Policies', icon: CreditCard },
              { id: 'claims', label: 'Claims', icon: FileText },
              { id: 'payments', label: 'Payments', icon: DollarSign }
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

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              >
                <option value="all">All Status</option>
                {activeTab === 'policies' ? (
                  <>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                ) : (
                  <>
                    <option value="submitted">Submitted</option>
                    <option value="in-review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="paid">Paid</option>
                  </>
                )}
              </select>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'policies' ? 'Add Policy' : 'Submit Claim'}
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {(policiesLoading || claimsLoading) && (
          <div className="text-center py-8 text-neutral-500">Loading...</div>
        )}
        {(policiesError || claimsError) && (
          <div className="text-center py-8 text-error-600">{policiesError || claimsError}</div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'policies' && !policiesLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => (
                <div 
                  key={policy.id} 
                  className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow"
                  onClick={() => setSelectedPolicy(policy)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg mr-3">
                        {getPolicyTypeIcon(policy.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                          {policy.provider}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                          {policy.type} Insurance
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(policy.status)}`}>
                      {getStatusIcon(policy.status)}
                      <span className="capitalize">{policy.status}</span>
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Policy Number:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{policy.policyNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Coverage:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {policy.coverage.family ? 'Family' : 'Individual'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Premium:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        ${policy.premium}/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Valid Until:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {new Date(policy.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      Next payment: {new Date(policy.nextPaymentDate).toLocaleDateString()}
                    </div>
                    <Link 
                      to="/finance/PaymentPage"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                    >
                      Make Payment
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No insurance policies found
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first insurance policy to get started'}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Insurance Policy
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && !claimsLoading && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            {filteredClaims.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Claim Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {filteredClaims.map((claim) => (
                      <tr 
                        key={claim.id} 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {claim.claimNumber}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              Patient: {claim.patientName}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              Submitted: {new Date(claim.submissionDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-900 dark:text-white">
                            {claim.service}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {claim.provider}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Service date: {new Date(claim.serviceDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            ${claim.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
                            {getStatusIcon(claim.status)}
                            <span className="capitalize">{claim.status.replace('-', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle view details
                              }}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            >
                              View
                            </button>
                            {claim.status === 'approved' && (
                              <Link
                                to="/finance/PaymentPage"
                                onClick={(e) => e.stopPropagation()}
                                className="text-success-600 dark:text-success-400 hover:text-success-900 dark:hover:text-success-300"
                              >
                                Pay
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No claims found
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Submit your first claim to get started'}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Claim
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && !policiesLoading && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Upcoming Payments
              </h3>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <div className="flex items-center">
                      <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg mr-3">
                        <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">
                          {policy.provider} - {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Due: {new Date(policy.nextPaymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        ${policy.premium.toFixed(2)}
                      </p>
                      <Link
                        to="/finance/PaymentPage"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
                      >
                        Pay Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Policy Detail Modal */}
        {selectedPolicy && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedPolicy(null)}></div>
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-4xl mx-auto z-10">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg mr-3">
                      {getPolicyTypeIcon(selectedPolicy.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        {selectedPolicy.provider}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Policy #{selectedPolicy.policyNumber}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedPolicy.status)}`}>
                    {getStatusIcon(selectedPolicy.status)}
                    <span className="capitalize">{selectedPolicy.status}</span>
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                        Policy Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Type:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                            {selectedPolicy.type} Insurance
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Coverage:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {selectedPolicy.coverage.family ? 'Family' : 'Individual'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Start Date:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {new Date(selectedPolicy.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">End Date:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {new Date(selectedPolicy.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Premium:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            ${selectedPolicy.premium}/{selectedPolicy.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                        Covered Members
                      </h4>
                      <div className="space-y-2">
                        {selectedPolicy.coverage.members.map((member, index) => (
                          <div key={index} className="flex items-center p-2 bg-neutral-50 dark:bg-neutral-700 rounded-md">
                            <User className="h-4 w-4 text-neutral-500 mr-2" />
                            <span className="text-sm text-neutral-900 dark:text-white">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                      Benefits Summary
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                              Benefit
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                              Coverage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                          {selectedPolicy.benefits.map((benefit, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                                {benefit.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
                                {benefit.description}
                              </td>
                              <td className="px-4 py-3 text-sm text-neutral-900 dark:text-white">
                                {benefit.coverage}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                      Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPolicy.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          className="flex items-center p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-neutral-500 mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {doc.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
                              {doc.type}
                            </p>
                          </div>
                          <Download className="h-4 w-4 text-neutral-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-between">
                  <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    Next payment: {new Date(selectedPolicy.nextPaymentDate).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedPolicy(null)}
                      className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                    >
                      Close
                    </button>
                    <Link
                      to="/finance/PaymentPage"
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Make Payment
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claim Detail Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedClaim(null)}></div>
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-2xl mx-auto z-10">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    Claim Details
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Claim Number</p>
                      <p className="text-lg font-medium text-neutral-900 dark:text-white">
                        {selectedClaim.claimNumber}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedClaim.status)}`}>
                      {getStatusIcon(selectedClaim.status)}
                      <span className="capitalize">{selectedClaim.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                        Claim Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Patient:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {selectedClaim.patientName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Service Date:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {new Date(selectedClaim.serviceDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Provider:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {selectedClaim.provider}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Service:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {selectedClaim.service}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">Amount:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            ${selectedClaim.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                        Claim Documents
                      </h4>
                      <div className="space-y-2">
                        {selectedClaim.documents.map((doc, index) => (
                          <div key={index} className="flex items-center p-2 bg-neutral-50 dark:bg-neutral-700 rounded-md">
                            <FileText className="h-4 w-4 text-neutral-500 mr-2" />
                            <span className="text-sm text-neutral-900 dark:text-white flex-1">{doc}</span>
                            <button className="text-primary-600 dark:text-primary-400">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {selectedClaim.notes && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                        Notes
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-700 p-3 rounded-md">
                        {selectedClaim.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                    <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                      Claim Timeline
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-success-500 mt-1"></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            Claim Submitted
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(selectedClaim.submissionDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {selectedClaim.status === 'in-review' || selectedClaim.status === 'approved' || selectedClaim.status === 'denied' || selectedClaim.status === 'paid' ? (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-4 w-4 rounded-full bg-primary-500 mt-1"></div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              Claim In Review
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(new Date(selectedClaim.submissionDate).getTime() + 86400000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {selectedClaim.status === 'approved' || selectedClaim.status === 'paid' ? (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-4 w-4 rounded-full bg-success-500 mt-1"></div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              Claim Approved
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(new Date(selectedClaim.submissionDate).getTime() + 172800000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {selectedClaim.status === 'denied' ? (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-4 w-4 rounded-full bg-error-500 mt-1"></div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              Claim Denied
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(new Date(selectedClaim.submissionDate).getTime() + 172800000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {selectedClaim.status === 'paid' ? (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-4 w-4 rounded-full bg-success-500 mt-1"></div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              Payment Processed
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(new Date(selectedClaim.submissionDate).getTime() + 259200000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedClaim(null)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                  >
                    Close
                  </button>
                  {selectedClaim.status === 'approved' && (
                    <Link
                      to="/finance/PaymentPage"
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Pay Claim
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceManagement;
