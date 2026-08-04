import { useState, useEffect } from 'react';
import { 
  Shield, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  User,
  Download,
  Filter,
  Search,
  ExternalLink,
  FileText,
  BarChart3
} from 'lucide-react';

interface VaccinationStats {
  totalVaccinations: number;
  thisMonth: number;
  overdue: number;
  upToDate: number;
  coverageRate: number;
  monthlyGrowth: number;
}

interface VaccinationRecord {
  id: string;
  childName: string;
  parentName: string;
  vaccineName: string;
  dateAdministered: string;
  clinic: string;
  healthWorker: string;
  blockchainHash: string;
  verified: boolean;
  doseNumber: number;
  nextDueDate?: string;
  status: 'completed' | 'overdue' | 'upcoming';
}

interface Certificate {
  id: string;
  childName: string;
  parentName: string;
  vaccineType: string;
  issueDate: string;
  expiryDate: string;
  certificateHash: string;
  status: 'valid' | 'expired' | 'revoked';
  downloadCount: number;
}

const VaccinationOversight = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'certificates'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  const [stats] = useState<VaccinationStats>({
    totalVaccinations: 2847,
    thisMonth: 342,
    overdue: 23,
    upToDate: 1734,
    coverageRate: 94.2,
    monthlyGrowth: 15.3
  });

  const [records] = useState<VaccinationRecord[]>([
    {
      id: 'vr_001',
      childName: 'Emma Davis',
      parentName: 'Maria Davis',
      vaccineName: 'DTaP',
      dateAdministered: '2024-01-15',
      clinic: 'City Pediatrics',
      healthWorker: 'Dr. Sarah Johnson',
      blockchainHash: '0x7f9e8d...6b2c1a',
      verified: true,
      doseNumber: 1,
      nextDueDate: '2024-04-15',
      status: 'completed'
    },
    {
      id: 'vr_002',
      childName: 'Jacob Williams',
      parentName: 'John Williams',
      vaccineName: 'MMR',
      dateAdministered: '2024-01-10',
      clinic: 'Metro Medical Center',
      healthWorker: 'Nurse Maria Rodriguez',
      blockchainHash: '0x3a5b7c...9e8f2d',
      verified: true,
      doseNumber: 2,
      status: 'completed'
    },
    {
      id: 'vr_003',
      childName: 'Sophie Chen',
      parentName: 'Lisa Chen',
      vaccineName: 'Hepatitis B',
      dateAdministered: '2023-12-20',
      clinic: 'Community Health Center',
      healthWorker: 'Dr. Michael Chen',
      blockchainHash: '0x1b2c3d...4e5f6g',
      verified: false,
      doseNumber: 3,
      nextDueDate: '2024-01-10',
      status: 'overdue'
    }
  ]);

  const [certificates] = useState<Certificate[]>([
    {
      id: 'cert_001',
      childName: 'Emma Davis',
      parentName: 'Maria Davis',
      vaccineType: 'DTaP Series',
      issueDate: '2024-01-15',
      expiryDate: '2029-01-15',
      certificateHash: '0xabc123...def456',
      status: 'valid',
      downloadCount: 3
    },
    {
      id: 'cert_002',
      childName: 'Jacob Williams',
      parentName: 'John Williams',
      vaccineType: 'MMR Complete',
      issueDate: '2024-01-10',
      expiryDate: '2029-01-10',
      certificateHash: '0xghi789...jkl012',
      status: 'valid',
      downloadCount: 1
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'valid':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'overdue':
      case 'expired':
        return 'text-error-600 bg-error-50 border-error-200';
      case 'upcoming':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'revoked':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const handleGenerateCertificate = (recordId: string) => {
    console.log('Generating certificate for record:', recordId);
  };

  const handleValidateCertificate = (certificateId: string) => {
    console.log('Validating certificate:', certificateId);
  };

  const handleExportData = () => {
    console.log('Exporting vaccination data...');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Vaccinations</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.totalVaccinations.toLocaleString()}
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            +{stats.monthlyGrowth}% this month
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">This Month</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.thisMonth}
              </p>
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="h-4 w-4 mr-1" />
            {Math.round(stats.thisMonth / 30)} per day avg
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Coverage Rate</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.coverageRate}%
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <CheckCircle className="h-4 w-4 mr-1" />
            {stats.upToDate} children up-to-date
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Overdue</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {stats.overdue}
              </p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900/20 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-warning-600 dark:text-warning-400">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Requires follow-up
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Vaccination Trends
          </h3>
          <div className="h-64 bg-neutral-50 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500 dark:text-neutral-400">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Vaccine Distribution
          </h3>
          <div className="space-y-4">
            {[
              { name: 'DTaP', count: 847, percentage: 29.8 },
              { name: 'MMR', count: 623, percentage: 21.9 },
              { name: 'Hepatitis B', count: 534, percentage: 18.8 },
              { name: 'Polio', count: 456, percentage: 16.0 },
              { name: 'Other', count: 387, percentage: 13.5 }
            ].map((vaccine) => (
              <div key={vaccine.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {vaccine.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {vaccine.count}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-500">
                    ({vaccine.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search records..."
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
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <button
          onClick={handleExportData}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Child & Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Vaccine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Date & Clinic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Health Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Verification
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
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {record.childName}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Parent: {record.parentName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white">
                      {record.vaccineName}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Dose {record.doseNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white">
                      {new Date(record.dateAdministered).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {record.clinic}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    {record.healthWorker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {record.verified ? (
                        <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning-600 mr-2" />
                      )}
                      <div>
                        <div className="text-sm text-neutral-900 dark:text-white">
                          {record.verified ? 'Verified' : 'Pending'}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                          {record.blockchainHash}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`https://algoexplorer.io/tx/${record.blockchainHash}`, '_blank')}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                        title="View on blockchain"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleGenerateCertificate(record.id)}
                        className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-300"
                        title="Generate certificate"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      {/* Certificate Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search certificates..."
              className="pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
            <Shield className="h-4 w-4 mr-2" />
            Validate Certificate
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Generate Certificate
          </button>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certificates.map((certificate) => (
          <div key={certificate.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {certificate.vaccineType}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Certificate #{certificate.id}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(certificate.status)}`}>
                {certificate.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Child:</span>
                <span className="text-sm text-neutral-900 dark:text-white">{certificate.childName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Parent:</span>
                <span className="text-sm text-neutral-900 dark:text-white">{certificate.parentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Issue Date:</span>
                <span className="text-sm text-neutral-900 dark:text-white">
                  {new Date(certificate.issueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Expiry Date:</span>
                <span className="text-sm text-neutral-900 dark:text-white">
                  {new Date(certificate.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Downloads:</span>
                <span className="text-sm text-neutral-900 dark:text-white">{certificate.downloadCount}</span>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Certificate Hash:</span>
                <button
                  onClick={() => window.open(`https://algoexplorer.io/tx/${certificate.certificateHash}`, '_blank')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono mt-1">
                {certificate.certificateHash}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleValidateCertificate(certificate.id)}
                className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 text-sm font-medium flex items-center"
              >
                <Shield className="h-4 w-4 mr-1" />
                Validate
              </button>
              <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Vaccination Oversight
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Monitor vaccination records, generate certificates, and track immunization coverage
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'records', label: 'Vaccination Records', icon: Shield },
            { id: 'certificates', label: 'Digital Certificates', icon: FileText }
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

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'records' && renderRecords()}
      {activeTab === 'certificates' && renderCertificates()}
    </div>
  );
};

export default VaccinationOversight;