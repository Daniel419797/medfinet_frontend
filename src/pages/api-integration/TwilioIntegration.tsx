import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Bell, 
  Calendar, 
  Settings, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Download,
  Plus,
  Loader2,
  Phone,
  Send,
  TrendingUp,
  Stethoscope,
  AlertTriangle,
  Copy
} from 'lucide-react';

interface TwilioAccount {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  phoneNumbers: string[];
  smsEnabled: boolean;
  voiceEnabled: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: 'appointment' | 'vaccination' | 'reminder' | 'alert';
  content: string;
  variables: string[];
  active: boolean;
}

interface MessageLog {
  id: string;
  to: string;
  from: string;
  body: string;
  status: 'delivered' | 'failed' | 'sent' | 'undelivered';
  date: string;
  type: 'appointment' | 'vaccination' | 'reminder' | 'alert';
}

const TwilioIntegration = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'logs' | 'settings'>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<TwilioAccount | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Mock data for demonstration
      setIsConnected(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleConnectTwilio = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnected(true);
    setAccount({
      id: 'AC_DEMO_ACCOUNT_ID_1234567890',
      name: 'MedFiNet Healthcare',
      status: 'active',
      phoneNumbers: ['+15551234567', '+15559876543'],
      smsEnabled: true,
      voiceEnabled: true
    });
    
    setTemplates([
      {
        id: 'tpl_001',
        name: 'Appointment Reminder',
        type: 'appointment',
        content: 'Hi {{name}}, this is a reminder about your appointment at {{clinic}} on {{date}} at {{time}}. Reply Y to confirm or call {{phone}} to reschedule.',
        variables: ['name', 'clinic', 'date', 'time', 'phone'],
        active: true
      },
      {
        id: 'tpl_002',
        name: 'Vaccination Due',
        type: 'vaccination',
        content: 'Hi {{name}}, {{childName}} is due for {{vaccine}} vaccination. Please schedule an appointment at {{clinic}} by calling {{phone}}.',
        variables: ['name', 'childName', 'vaccine', 'clinic', 'phone'],
        active: true
      },
      {
        id: 'tpl_003',
        name: 'Medication Reminder',
        type: 'reminder',
        content: 'Reminder: It\'s time for {{childName}} to take {{medication}}. Follow the prescribed dosage of {{dosage}}.',
        variables: ['childName', 'medication', 'dosage'],
        active: true
      }
    ]);
    
    setLogs([
      {
        id: 'msg_001',
        to: '+15551234567',
        from: '+15559876543',
        body: 'Hi John, this is a reminder about your appointment at City Pediatrics on June 15, 2024 at 10:00 AM. Reply Y to confirm or call (555) 987-6543 to reschedule.',
        status: 'delivered',
        date: '2024-06-10T14:30:00Z',
        type: 'appointment'
      },
      {
        id: 'msg_002',
        to: '+15552345678',
        from: '+15559876543',
        body: 'Hi Maria, Emma is due for DTaP vaccination. Please schedule an appointment at Metro Medical Center by calling (555) 987-6543.',
        status: 'delivered',
        date: '2024-06-08T10:15:00Z',
        type: 'vaccination'
      },
      {
        id: 'msg_003',
        to: '+15553456789',
        from: '+15559876543',
        body: 'Reminder: It\'s time for Jacob to take Albuterol. Follow the prescribed dosage of 2 puffs every 4-6 hours as needed.',
        status: 'sent',
        date: '2024-06-05T08:45:00Z',
        type: 'reminder'
      }
    ]);
    
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Twilio account? This will disable SMS notifications.')) {
      setIsLoading(true);
      
      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConnected(false);
      setAccount(null);
      setTemplates([]);
      setLogs([]);
      
      setIsLoading(false);
    }
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = (template: MessageTemplate) => {
    if (selectedTemplate) {
      // Update existing template
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      // Add new template
      setTemplates([...templates, { ...template, id: `tpl_${Date.now()}` }]);
    }
    setShowTemplateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'pending':
      case 'sent':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'suspended':
      case 'failed':
      case 'undelivered':
        return 'text-error-600 bg-error-50 border-error-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-primary-600" />;
      case 'vaccination':
        return <Stethoscope className="h-5 w-5 text-secondary-600" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-warning-600" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-error-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-neutral-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-300">Loading Twilio integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Twilio SMS Integration
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Manage SMS notifications for appointments, vaccinations, and healthcare reminders
        </p>
      </div>

      {isConnected ? (
        <>
          {/* Tabs */}
          <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: MessageSquare },
                { id: 'templates', label: 'Message Templates', icon: FileText },
                { id: 'logs', label: 'Message Logs', icon: Clock },
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
                      <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{account?.name}</h2>
                      <p className="text-neutral-600 dark:text-neutral-300">Account ID: {account?.id}</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(account?.status || '')}`}>
                          {account?.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://www.twilio.com/console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Twilio Console
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Account Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">SMS Enabled:</span>
                        <span className={`text-sm font-medium ${account?.smsEnabled ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                          {account?.smsEnabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Voice Enabled:</span>
                        <span className={`text-sm font-medium ${account?.voiceEnabled ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                          {account?.voiceEnabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Phone Numbers</h3>
                    <div className="space-y-2">
                      {account?.phoneNumbers.map((number, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">
                            {number}
                          </span>
                          {index === 0 && (
                            <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded-full">
                              Primary
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
                        Download Message Logs
                      </button>
                      <button 
                        onClick={handleDisconnect}
                        className="w-full text-left px-3 py-2 text-sm text-error-700 dark:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors flex items-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Disconnect Twilio Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Messages Sent</p>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                        247
                      </p>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
                      <Send className="h-6 w-6 text-primary-600 dark:text-primary-400" />
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
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Delivery Rate</p>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                        98.7%
                      </p>
                    </div>
                    <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-success-600 dark:text-success-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Above industry average
                  </div>
                </div>
                
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Templates</p>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                        {templates.filter(t => t.active).length}
                      </p>
                    </div>
                    <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <Plus className="h-4 w-4 mr-1" />
                    <button onClick={handleAddTemplate}>Add new template</button>
                  </div>
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Recent Messages</h3>
                  <button 
                    onClick={() => setActiveTab('logs')}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {log.type === 'appointment' ? (
                              <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            ) : log.type === 'vaccination' ? (
                              <Stethoscope className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                            ) : (
                              <Bell className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-neutral-900 dark:text-white">
                              To: {log.to}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                              {log.body.length > 100 ? log.body.substring(0, 100) + '...' : log.body}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              {new Date(log.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Message Templates
                </h2>
                <button
                  onClick={handleAddTemplate}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div 
                    key={template.id} 
                    className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg mr-3">
                          {getTemplateTypeIcon(template.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900 dark:text-white">{template.name}</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                            {template.type} Template
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          template.active 
                            ? 'text-success-600 bg-success-50 border-success-200' 
                            : 'text-neutral-600 bg-neutral-50 border-neutral-200'
                        }`}>
                          {template.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 mb-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-line">
                        {template.content}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.variables.map((variable) => (
                        <span key={variable} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        Edit Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <h3 className="font-medium text-neutral-900 dark:text-white">Message Logs</h3>
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  Export Logs
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(log.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                          {log.to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                          {log.from}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 capitalize">
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                          <div className="max-w-xs truncate">
                            {log.body}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
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
                  Manage your Twilio API keys for secure SMS and voice communications
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">Account SID</h3>
                      <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="AC•••••••••••••••••••••••••••••••••"
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
                      <h3 className="font-medium text-neutral-900 dark:text-white">Auth Token</h3>
                      <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="••••••••••••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 text-sm font-mono text-neutral-500 dark:text-neutral-400"
                      />
                      <button className="ml-2 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-warning-600 dark:text-warning-400">
                      Keep your auth token confidential. Never expose it in client-side code or public repositories.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Notification Settings
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Configure when and how SMS notifications are sent to patients
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Appointment Reminders</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">Send appointment reminders</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={true} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          When to send reminders
                        </label>
                        <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                          <option value="24">24 hours before appointment</option>
                          <option value="48">48 hours before appointment</option>
                          <option value="72">72 hours before appointment</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Vaccination Reminders</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">Send vaccination due reminders</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={true} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          When to send reminders
                        </label>
                        <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                          <option value="7">7 days before due date</option>
                          <option value="14">14 days before due date</option>
                          <option value="30">30 days before due date</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Opt-out Management</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="include-optout"
                          checked={true}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                        <label htmlFor="include-optout" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                          Include opt-out instructions in messages
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="honor-optout"
                          checked={true}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                        <label htmlFor="honor-optout" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                          Automatically honor opt-out requests
                        </label>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        Patients can opt out by replying with STOP at any time. This is required for compliance with messaging regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Modal */}
          {showTemplateModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowTemplateModal(false)}></div>
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-2xl mx-auto z-10">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                      {selectedTemplate ? 'Edit Message Template' : 'Create Message Template'}
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Template Name
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedTemplate?.name}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          placeholder="e.g., Appointment Reminder"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Template Type
                        </label>
                        <select 
                          defaultValue={selectedTemplate?.type || 'appointment'}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                        >
                          <option value="appointment">Appointment</option>
                          <option value="vaccination">Vaccination</option>
                          <option value="reminder">Reminder</option>
                          <option value="alert">Alert</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Message Content
                        </label>
                        <textarea
                          defaultValue={selectedTemplate?.content}
                          rows={5}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          placeholder="Enter message content with {{variables}}"
                        ></textarea>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          Use {{variable_name}} for dynamic content. Example: Hello {{name}}, your appointment is on {{date}}.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Variables
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate?.variables.map((variable, index) => (
                            <div key={index} className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs flex items-center">
                              <span>{variable}</span>
                              <button className="ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                                ×
                              </button>
                            </div>
                          ))}
                          <button className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                            + Add Variable
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="template-active"
                          defaultChecked={selectedTemplate?.active ?? true}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                        <label htmlFor="template-active" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                          Template is active
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowTemplateModal(false)}
                      className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveTemplate({
                        id: selectedTemplate?.id || '',
                        name: 'New Template',
                        type: 'appointment',
                        content: 'Hello {{name}}, this is a reminder about your appointment.',
                        variables: ['name'],
                        active: true
                      })}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      {selectedTemplate ? 'Update Template' : 'Create Template'}
                    </button>
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
              <MessageSquare className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Connect Twilio Account
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Connect your Twilio account to send automated SMS notifications for appointments, vaccination reminders, and healthcare alerts.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleConnectTwilio}
                disabled={isConnecting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Connecting to Twilio...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Connect Twilio Account
                  </>
                )}
              </button>
              
              <a
                href="https://www.twilio.com/try-twilio"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm"
              >
                Don't have a Twilio account? Sign up here
              </a>
            </div>
            
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Benefits of Twilio Integration</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Automated Reminders</span> - Send appointment and vaccination reminders to reduce no-shows
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Customizable Templates</span> - Create personalized message templates for different scenarios
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Two-way Communication</span> - Allow patients to respond to messages for confirmation
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Delivery Tracking</span> - Monitor message delivery status and engagement
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

export default TwilioIntegration;