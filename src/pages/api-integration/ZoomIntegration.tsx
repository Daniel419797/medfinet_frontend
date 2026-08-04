import { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Users, 
  Settings, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Download,
  Plus,
  Loader2,
  Link,
  Copy
} from 'lucide-react';

interface ZoomAccount {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  plan: 'basic' | 'pro' | 'business';
}

interface ZoomMeeting {
  id: string;
  topic: string;
  type: 'scheduled' | 'recurring' | 'instant';
  startTime: string;
  duration: number;
  timezone: string;
  joinUrl: string;
  password: string;
  status: 'waiting' | 'started' | 'finished' | 'cancelled';
  hostId: string;
  participants: number;
}

const ZoomIntegration = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'settings'>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<ZoomAccount | null>(null);
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<ZoomMeeting | null>(null);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Mock data for demonstration
      setIsConnected(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleConnectZoom = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnected(true);
    setAccount({
      id: 'u1234567890',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@medfinet.com',
      status: 'active',
      plan: 'pro'
    });
    
    setMeetings([
      {
        id: 'm1234567890',
        topic: 'Telemedicine Consultation - Jacob Williams',
        type: 'scheduled',
        startTime: '2024-06-15T10:00:00Z',
        duration: 30,
        timezone: 'America/New_York',
        joinUrl: 'https://zoom.us/j/1234567890?pwd=abcdef',
        password: '123456',
        status: 'waiting',
        hostId: 'u1234567890',
        participants: 0
      },
      {
        id: 'm0987654321',
        topic: 'Follow-up Appointment - Emma Davis',
        type: 'scheduled',
        startTime: '2024-06-16T14:30:00Z',
        duration: 15,
        timezone: 'America/New_York',
        joinUrl: 'https://zoom.us/j/0987654321?pwd=ghijkl',
        password: '654321',
        status: 'waiting',
        hostId: 'u1234567890',
        participants: 0
      },
      {
        id: 'm5678901234',
        topic: 'Vaccination Consultation - Sophie Chen',
        type: 'scheduled',
        startTime: '2024-06-14T09:15:00Z',
        duration: 20,
        timezone: 'America/New_York',
        joinUrl: 'https://zoom.us/j/5678901234?pwd=mnopqr',
        password: '789012',
        status: 'finished',
        hostId: 'u1234567890',
        participants: 2
      }
    ]);
    
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Zoom account? This will disable telemedicine functionality.')) {
      setIsLoading(true);
      
      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConnected(false);
      setAccount(null);
      setMeetings([]);
      
      setIsLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    setSelectedMeeting(null);
    setShowMeetingModal(true);
  };

  const handleEditMeeting = (meeting: ZoomMeeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleSaveMeeting = (meeting: ZoomMeeting) => {
    if (selectedMeeting) {
      // Update existing meeting
      setMeetings(meetings.map(m => m.id === meeting.id ? meeting : m));
    } else {
      // Add new meeting
      setMeetings([...meetings, { ...meeting, id: `m${Date.now()}` }]);
    }
    setShowMeetingModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'finished':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'pending':
      case 'waiting':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'suspended':
      case 'cancelled':
        return 'text-error-600 bg-error-50 border-error-200';
      case 'started':
        return 'text-primary-600 bg-primary-50 border-primary-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-300">Loading Zoom integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Zoom Telemedicine Integration
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Manage virtual healthcare consultations and telemedicine appointments
        </p>
      </div>

      {isConnected ? (
        <>
          {/* Tabs */}
          <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Video },
                { id: 'meetings', label: 'Meetings', icon: Calendar },
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
                      <Video className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{account?.name}</h2>
                      <p className="text-neutral-600 dark:text-neutral-300">{account?.email}</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(account?.status || '')}`}>
                          {account?.status}
                        </span>
                        <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded-full capitalize">
                          {account?.plan} Plan
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://zoom.us/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Zoom Dashboard
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Upcoming Meetings</h3>
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                      {meetings.filter(m => m.status === 'waiting').length}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                      Next: {meetings.filter(m => m.status === 'waiting').length > 0 ? 
                        new Date(meetings.filter(m => m.status === 'waiting')[0].startTime).toLocaleString() : 
                        'None scheduled'}
                    </p>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Completed Meetings</h3>
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                      {meetings.filter(m => m.status === 'finished').length}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                      Total participants: {meetings.filter(m => m.status === 'finished').reduce((sum, m) => sum + m.participants, 0)}
                    </p>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={handleCreateMeeting}
                        className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        Schedule New Meeting
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors flex items-center">
                        <Video className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        Start Instant Meeting
                      </button>
                      <button 
                        onClick={handleDisconnect}
                        className="w-full text-left px-3 py-2 text-sm text-error-700 dark:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors flex items-center"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Disconnect Zoom Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Meetings */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Upcoming Meetings</h3>
                  <button 
                    onClick={() => setActiveTab('meetings')}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {meetings.filter(m => m.status === 'waiting').slice(0, 3).map((meeting) => (
                    <div key={meeting.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {meeting.topic}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                              {new Date(meeting.startTime).toLocaleString()} ({meeting.duration} min)
                            </p>
                            <div className="flex items-center mt-2">
                              <button
                                onClick={() => copyToClipboard(meeting.joinUrl)}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center"
                              >
                                <Link className="h-3 w-3 mr-1" />
                                Copy Join Link
                              </button>
                              <span className="mx-2 text-neutral-300 dark:text-neutral-600">|</span>
                              <button
                                onClick={() => handleEditMeeting(meeting)}
                                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {meetings.filter(m => m.status === 'waiting').length === 0 && (
                    <div className="p-6 text-center">
                      <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                        No upcoming meetings
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                        Schedule your first telemedicine appointment
                      </p>
                      <button
                        onClick={handleCreateMeeting}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Telemedicine Meetings
                </h2>
                <button
                  onClick={handleCreateMeeting}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </button>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Meeting
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                      {meetings.map((meeting) => (
                        <tr key={meeting.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {meeting.topic}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              ID: {meeting.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {new Date(meeting.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {meeting.duration} minutes
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                              {meeting.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                            {meeting.participants}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {meeting.status === 'waiting' && (
                                <a
                                  href={meeting.joinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                >
                                  Start
                                </a>
                              )}
                              <button
                                onClick={() => copyToClipboard(meeting.joinUrl)}
                                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                              >
                                <Link className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditMeeting(meeting)}
                                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                              >
                                <Edit className="h-4 w-4" />
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
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* API Keys */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  API Keys
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Manage your Zoom API keys for secure telemedicine integration
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">API Key</h3>
                      <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="•••••••••••••••••••••••••••••••••"
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
                      <h3 className="font-medium text-neutral-900 dark:text-white">API Secret</h3>
                      <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="•••••••••••••••••••••••••••••••••"
                        readOnly
                        className="flex-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 text-sm font-mono text-neutral-500 dark:text-neutral-400"
                      />
                      <button className="ml-2 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-warning-600 dark:text-warning-400">
                      Keep your API secret confidential. Never expose it in client-side code or public repositories.
                    </p>
                  </div>
                </div>
              </div>

              {/* Meeting Settings */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Meeting Settings
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Configure default settings for telemedicine appointments
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Default Meeting Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">Enable waiting room</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={true} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">Mute participants upon entry</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={true} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">Require meeting password</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={true} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">Enable HD video</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={true} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Default Meeting Duration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Initial Consultation
                        </label>
                        <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                          <option value="15">15 minutes</option>
                          <option value="30" selected>30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Follow-up Appointment
                        </label>
                        <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                          <option value="15" selected>15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Settings */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Compliance Settings
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Configure settings to ensure HIPAA compliance for telemedicine
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 dark:text-neutral-300">Enable end-to-end encryption</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={true} />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 dark:text-neutral-300">Disable cloud recording</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={true} />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 dark:text-neutral-300">Require authentication for all participants</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={true} />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 dark:text-neutral-300">Display HIPAA compliance notice</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={true} />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-primary-800 dark:text-primary-300 mb-1">
                          HIPAA Compliance
                        </h4>
                        <p className="text-sm text-primary-700 dark:text-primary-400">
                          Your Zoom integration is configured for HIPAA compliance. Ensure you have a signed BAA (Business Associate Agreement) with Zoom for full compliance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Modal */}
          {showMeetingModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMeetingModal(false)}></div>
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-2xl mx-auto z-10">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                      {selectedMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Meeting Topic
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedMeeting?.topic}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          placeholder="e.g., Telemedicine Consultation - [Patient Name]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            defaultValue={selectedMeeting ? new Date(selectedMeeting.startTime).toISOString().split('T')[0] : undefined}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            defaultValue={selectedMeeting ? new Date(selectedMeeting.startTime).toTimeString().slice(0, 5) : undefined}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Duration
                          </label>
                          <select 
                            defaultValue={selectedMeeting?.duration.toString() || "30"}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Timezone
                          </label>
                          <select 
                            defaultValue={selectedMeeting?.timezone || "America/New_York"}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          >
                            <option value="America/New_York">Eastern Time (US & Canada)</option>
                            <option value="America/Chicago">Central Time (US & Canada)</option>
                            <option value="America/Denver">Mountain Time (US & Canada)</option>
                            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Meeting Options
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="waiting-room"
                              defaultChecked={true}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                            />
                            <label htmlFor="waiting-room" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                              Enable waiting room
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="mute-entry"
                              defaultChecked={true}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                            />
                            <label htmlFor="mute-entry" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                              Mute participants upon entry
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="auto-record"
                              defaultChecked={false}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                            />
                            <label htmlFor="auto-record" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                              Automatically record meeting (local recording only)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowMeetingModal(false)}
                      className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveMeeting({
                        id: selectedMeeting?.id || '',
                        topic: 'New Telemedicine Appointment',
                        type: 'scheduled',
                        startTime: new Date().toISOString(),
                        duration: 30,
                        timezone: 'America/New_York',
                        joinUrl: 'https://zoom.us/j/1234567890',
                        password: '123456',
                        status: 'waiting',
                        hostId: account?.id || '',
                        participants: 0
                      })}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      {selectedMeeting ? 'Update Meeting' : 'Schedule Meeting'}
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
              <Video className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Connect Zoom Account
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Connect your Zoom account to enable telemedicine consultations and virtual healthcare appointments.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleConnectZoom}
                disabled={isConnecting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Connecting to Zoom...
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5 mr-2" />
                    Connect Zoom Account
                  </>
                )}
              </button>
              
              <a
                href="https://zoom.us/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm"
              >
                Don't have a Zoom account? Sign up here
              </a>
            </div>
            
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Benefits of Zoom Integration</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Virtual Consultations</span> - Conduct secure telemedicine appointments with patients
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">HIPAA Compliance</span> - Secure, encrypted video meetings for healthcare
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Seamless Scheduling</span> - Integrate with appointment system for automatic meeting creation
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3 mt-0.5" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">Expanded Access</span> - Provide healthcare services to patients regardless of location
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

export default ZoomIntegration;