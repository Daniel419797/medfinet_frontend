import { useState, useEffect } from 'react';
import { 
  Activity, 
  Key, 
  Globe, 
  Shield, 
  BarChart3, 
  Settings,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'revoked';
  createdDate: string;
  lastUsed: string;
  requestCount: number;
  rateLimit: number;
  owner: string;
}

interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  module: 'users' | 'vaccinations' | 'facilities' | 'analytics';
  status: 'enabled' | 'disabled' | 'maintenance';
  requestCount: number;
  avgResponseTime: number;
  errorRate: number;
}

interface APIUsage {
  endpoint: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  timestamp: string;
}

const APIManagement = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'endpoints' | 'usage'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create-key' | 'view-key' | 'edit-endpoint'>('create-key');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showKey, setShowKey] = useState<string | null>(null);

  const [apiKeys] = useState<APIKey[]>([
    {
      id: 'key_001',
      name: 'Mobile App API',
      key: 'mk_live_abc123def456ghi789jkl012mno345',
      permissions: ['users:read', 'vaccinations:read', 'facilities:read'],
      status: 'active',
      createdDate: '2024-01-15',
      lastUsed: '2024-01-21T10:30:00Z',
      requestCount: 15847,
      rateLimit: 1000,
      owner: 'Mobile Team'
    },
    {
      id: 'key_002',
      name: 'Analytics Dashboard',
      key: 'ak_live_def456ghi789jkl012mno345pqr678',
      permissions: ['analytics:read', 'users:read', 'vaccinations:read'],
      status: 'active',
      createdDate: '2024-01-10',
      lastUsed: '2024-01-21T09:15:00Z',
      requestCount: 8934,
      rateLimit: 500,
      owner: 'Analytics Team'
    },
    {
      id: 'key_003',
      name: 'Third Party Integration',
      key: 'tk_live_ghi789jkl012mno345pqr678stu901',
      permissions: ['facilities:read'],
      status: 'inactive',
      createdDate: '2024-01-05',
      lastUsed: '2024-01-18T16:45:00Z',
      requestCount: 2341,
      rateLimit: 100,
      owner: 'External Partner'
    }
  ]);

  const [endpoints] = useState<APIEndpoint[]>([
    {
      id: 'ep_001',
      path: '/api/v1/users',
      method: 'GET',
      description: 'Retrieve user information and profiles',
      module: 'users',
      status: 'enabled',
      requestCount: 12847,
      avgResponseTime: 145,
      errorRate: 0.2
    },
    {
      id: 'ep_002',
      path: '/api/v1/vaccinations',
      method: 'GET',
      description: 'Get vaccination records and history',
      module: 'vaccinations',
      status: 'enabled',
      requestCount: 9634,
      avgResponseTime: 89,
      errorRate: 0.1
    },
    {
      id: 'ep_003',
      path: '/api/v1/facilities',
      method: 'GET',
      description: 'List healthcare facilities and locations',
      module: 'facilities',
      status: 'enabled',
      requestCount: 5423,
      avgResponseTime: 67,
      errorRate: 0.3
    },
    {
      id: 'ep_004',
      path: '/api/v1/analytics',
      method: 'GET',
      description: 'Access analytics and reporting data',
      module: 'analytics',
      status: 'maintenance',
      requestCount: 1234,
      avgResponseTime: 234,
      errorRate: 1.2
    }
  ]);

  const [usageData] = useState<APIUsage[]>([
    { endpoint: '/api/v1/users', requests: 1247, errors: 3, avgResponseTime: 145, timestamp: '2024-01-21T10:00:00Z' },
    { endpoint: '/api/v1/vaccinations', requests: 934, errors: 1, avgResponseTime: 89, timestamp: '2024-01-21T10:00:00Z' },
    { endpoint: '/api/v1/facilities', requests: 567, errors: 2, avgResponseTime: 67, timestamp: '2024-01-21T10:00:00Z' },
    { endpoint: '/api/v1/analytics', requests: 123, errors: 5, avgResponseTime: 234, timestamp: '2024-01-21T10:00:00Z' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'enabled':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'inactive':
      case 'disabled':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      case 'maintenance':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'revoked':
        return 'text-error-600 bg-error-50 border-error-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-success-600 bg-success-50';
      case 'POST':
        return 'text-primary-600 bg-primary-50';
      case 'PUT':
        return 'text-warning-600 bg-warning-50';
      case 'DELETE':
        return 'text-error-600 bg-error-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openModal = (type: 'create-key' | 'view-key' | 'edit-endpoint', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* API Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Requests</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                27.2K
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
              <Activity className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <Zap className="h-4 w-4 mr-1" />
            +15% this week
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active API Keys</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {apiKeys.filter(key => key.status === 'active').length}
              </p>
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
              <Key className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <Key className="h-4 w-4 mr-1" />
            {apiKeys.length} total keys
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Avg Response Time</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                134ms
              </p>
            </div>
            <div className="bg-accent-100 dark:bg-accent-900/20 p-3 rounded-full">
              <Clock className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <CheckCircle className="h-4 w-4 mr-1" />
            -12ms improved
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Error Rate</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                0.3%
              </p>
            </div>
            <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-full">
              <Shield className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
            <CheckCircle className="h-4 w-4 mr-1" />
            Within SLA
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Endpoint Status
          </h3>
          <div className="space-y-3">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-3 ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {endpoint.path}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {endpoint.requestCount.toLocaleString()} requests
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(endpoint.status)}`}>
                  {endpoint.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Recent API Activity
          </h3>
          <div className="space-y-3">
            {usageData.map((usage, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {usage.endpoint}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(usage.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {usage.requests} requests
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {usage.avgResponseTime}ms avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeys = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">API Keys</h3>
          <p className="text-neutral-600 dark:text-neutral-300">Manage API access keys and permissions</p>
        </div>
        <button
          onClick={() => openModal('create-key')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </button>
      </div>

      {/* API Keys Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Name & Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {apiKey.name}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                          {showKey === apiKey.id ? apiKey.key : `${apiKey.key.substring(0, 20)}...`}
                        </span>
                        <button
                          onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                          className="ml-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {showKey === apiKey.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="ml-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.slice(0, 2).map((permission) => (
                        <span key={permission} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-50 text-primary-700">
                          {permission}
                        </span>
                      ))}
                      {apiKey.permissions.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-neutral-50 text-neutral-700">
                          +{apiKey.permissions.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white">
                      {apiKey.requestCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Limit: {apiKey.rateLimit}/hour
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(apiKey.status)}`}>
                      {apiKey.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(apiKey.lastUsed).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openModal('view-key', apiKey)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-error-600 dark:text-error-400 hover:text-error-900 dark:hover:text-error-300">
                        <Trash2 className="h-4 w-4" />
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

  const renderEndpoints = () => (
    <div className="space-y-6">
      {/* Endpoints Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">API Endpoints</h3>
          <p className="text-neutral-600 dark:text-neutral-300">Configure and monitor API endpoint access</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Performance
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
              {endpoints.map((endpoint) => (
                <tr key={endpoint.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-3 ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {endpoint.path}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {endpoint.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-50 text-secondary-700 capitalize">
                      {endpoint.module}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white">
                      {endpoint.requestCount.toLocaleString()} requests
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {endpoint.avgResponseTime}ms avg • {endpoint.errorRate}% errors
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(endpoint.status)}`}>
                      {endpoint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openModal('edit-endpoint', endpoint)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-6">
      {/* Usage Analytics */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          API Usage Analytics
        </h3>
        <div className="h-64 bg-neutral-50 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-500 dark:text-neutral-400">Usage charts would be displayed here</p>
          </div>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Real-time Usage</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Errors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Avg Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {usageData.map((usage, index) => (
                <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                    {usage.endpoint}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    {usage.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${usage.errors > 0 ? 'text-error-600' : 'text-success-600'}`}>
                      {usage.errors}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    {usage.avgResponseTime}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(usage.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          API Management
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Monitor API performance, manage access keys, and configure endpoints
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'endpoints', label: 'Endpoints', icon: Globe },
            { id: 'usage', label: 'Usage Analytics', icon: BarChart3 }
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'keys' && renderKeys()}
      {activeTab === 'endpoints' && renderEndpoints()}
      {activeTab === 'usage' && renderUsage()}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-2xl mx-auto z-10">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {modalType === 'create-key' ? 'Create API Key' : 
                   modalType === 'view-key' ? 'API Key Details' : 'Edit Endpoint'}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 dark:text-neutral-300">
                  Modal content for {modalType} would go here...
                </p>
                {selectedItem && (
                  <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Selected Item: {selectedItem.name || selectedItem.path}
                    </p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  {modalType === 'create-key' ? 'Create' : modalType === 'view-key' ? 'Close' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIManagement;