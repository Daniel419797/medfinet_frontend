import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Globe, 
  Brain, 
  Shield, 
  Map, 
  Database, 
  Code,
  ExternalLink,
  ArrowRight,
  CreditCard,
  Zap,
  Stethoscope,
  Activity
} from 'lucide-react';

const ApiIntegrationDashboard = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const apiCategories = [
    { id: 'all', label: 'All APIs' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'blockchain', label: 'Blockchain' },
    { id: 'ai', label: 'Artificial Intelligence' },
    { id: 'payment', label: 'Payment Processing' },
    { id: 'location', label: 'Location Services' },
  ];
  
  const apiExamples = [
    {
      id: 'fhir',
      title: 'FHIR Healthcare Data',
      description: 'Access and manage standardized healthcare data using the FHIR API',
      icon: FileText,
      category: 'healthcare',
      path: '/api-examples/fhir',
      color: 'primary',
      status: 'active',
    },
    {
      id: 'cdc',
      title: 'CDC Data Integration',
      description: 'Access public health data and vaccination statistics from the CDC',
      icon: Database,
      category: 'healthcare',
      path: '/api-examples/cdc',
      color: 'secondary',
      status: 'active',
    },
    {
      id: 'blockchain',
      title: 'Blockchain Verification',
      description: 'Verify healthcare records and credentials on the blockchain',
      icon: Shield,
      category: 'blockchain',
      path: '/api-examples/blockchain',
      color: 'accent',
      status: 'active',
    },
    {
      id: 'openai',
      title: 'AI Health Assistant',
      description: 'Interact with an AI assistant for health information and guidance',
      icon: Brain,
      category: 'ai',
      path: '/api-examples/openai',
      color: 'success',
      status: 'active',
    },
    {
      id: 'mapbox',
      title: 'Health Center Mapping',
      description: 'Find and visualize nearby healthcare facilities on interactive maps',
      icon: Map,
      category: 'location',
      path: '/api-examples/mapbox',
      color: 'warning',
      status: 'active',
    },
    {
      id: 'vaccine',
      title: 'Vaccine Information',
      description: 'Access detailed information about vaccines and immunization schedules',
      icon: Stethoscope,
      category: 'healthcare',
      path: '/api-examples/vaccine',
      color: 'error',
      status: 'active',
    },
    {
      id: 'stripe',
      title: 'Stripe Payment Processing',
      description: 'Process payments for healthcare services and invoices',
      icon: CreditCard,
      category: 'payment',
      path: '/finance/payment',
      color: 'primary',
      status: 'active',
    },
    {
      id: 'twilio',
      title: 'Twilio SMS Notifications',
      description: 'Send appointment reminders and vaccination alerts via SMS',
      icon: Activity,
      category: 'healthcare',
      path: '/api-examples/twilio',
      color: 'secondary',
      status: 'coming-soon',
    },
    {
      id: 'zoom',
      title: 'Zoom Telemedicine',
      description: 'Integrate video consultations for remote healthcare services',
      icon: Globe,
      category: 'healthcare',
      path: '/api-examples/zoom',
      color: 'accent',
      status: 'coming-soon',
    }
  ];
  
  const filteredExamples = activeCategory === 'all' 
    ? apiExamples 
    : apiExamples.filter(example => example.category === activeCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          API Integration Hub
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Explore and manage all external API integrations for the MedFiNet platform
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {apiCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExamples.map((example) => {
          const Icon = example.icon;
          return (
            <Link
              key={example.id}
              to={example.status === 'active' ? example.path : '#'}
              className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${
                example.status !== 'active' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <div className={`bg-${example.color}-100 dark:bg-${example.color}-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 text-${example.color}-600 dark:text-${example.color}-400`} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {example.title}
                </h3>
                {example.status === 'coming-soon' && (
                  <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                {example.description}
              </p>
              <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                {example.status === 'active' ? (
                  <>
                    Explore Integration
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Coming Soon'
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* API Documentation */}
      <div className="mt-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
          External API Documentation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'FHIR API',
              description: 'Fast Healthcare Interoperability Resources standard for healthcare data exchange',
              url: 'https://hl7.org/fhir/',
              icon: FileText,
            },
            {
              title: 'CDC Open Data',
              description: 'Public health data and statistics from the Centers for Disease Control',
              url: 'https://data.cdc.gov/',
              icon: Database,
            },
            {
              title: 'OpenAI API',
              description: 'AI models for natural language processing and healthcare assistance',
              url: 'https://platform.openai.com/docs/api-reference',
              icon: Brain,
            },
            {
              title: 'Mapbox API',
              description: 'Location data and mapping services for healthcare facilities',
              url: 'https://docs.mapbox.com/',
              icon: Map,
            },
            {
              title: 'Algorand API',
              description: 'Blockchain API for secure healthcare record verification',
              url: 'https://developer.algorand.org/docs/rest-apis/algod/v2/',
              icon: Shield,
            },
            {
              title: 'Stripe API',
              description: 'Payment processing for healthcare services and invoices',
              url: 'https://stripe.com/docs/api',
              icon: CreditCard,
            },
          ].map((doc, index) => {
            const Icon = doc.icon;
            return (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
              >
                <Icon className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                    {doc.description}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </a>
            );
          })}
        </div>
      </div>

      {/* API Status Dashboard */}
      <div className="mt-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
          API Status Dashboard
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  API Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Last Checked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {[
                { name: 'FHIR API', status: 'Operational', latency: '87ms', uptime: '99.9%', lastChecked: '2 minutes ago' },
                { name: 'CDC Data API', status: 'Operational', latency: '124ms', uptime: '99.7%', lastChecked: '5 minutes ago' },
                { name: 'OpenAI API', status: 'Operational', latency: '156ms', uptime: '99.8%', lastChecked: '3 minutes ago' },
                { name: 'Mapbox API', status: 'Operational', latency: '92ms', uptime: '99.9%', lastChecked: '4 minutes ago' },
                { name: 'Algorand API', status: 'Operational', latency: '103ms', uptime: '99.9%', lastChecked: '2 minutes ago' },
                { name: 'Stripe API', status: 'Operational', latency: '78ms', uptime: '100%', lastChecked: '1 minute ago' },
              ].map((service, index) => (
                <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300">
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    {service.latency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    {service.uptime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {service.lastChecked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegrationDashboard;