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
  ArrowRight
} from 'lucide-react';

const ApiExamplesIndex = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const apiExamples = [
    {
      id: 'fhir',
      title: 'FHIR Healthcare Data',
      description: 'Access and manage standardized healthcare data using the FHIR API',
      icon: FileText,
      category: 'healthcare',
      path: '/api-examples/fhir',
      color: 'primary',
    },
    {
      id: 'cdc',
      title: 'CDC Data Integration',
      description: 'Access public health data and vaccination statistics from the CDC',
      icon: Database,
      category: 'healthcare',
      path: '/api-examples/cdc',
      color: 'secondary',
    },
    {
      id: 'blockchain',
      title: 'Blockchain Verification',
      description: 'Verify healthcare records and credentials on the blockchain',
      icon: Shield,
      category: 'blockchain',
      path: '/api-examples/blockchain',
      color: 'accent',
    },
    {
      id: 'openai',
      title: 'AI Health Assistant',
      description: 'Interact with an AI assistant for health information and guidance',
      icon: Brain,
      category: 'ai',
      path: '/api-examples/openai',
      color: 'success',
    },
    {
      id: 'mapbox',
      title: 'Health Center Mapping',
      description: 'Find and visualize nearby healthcare facilities on interactive maps',
      icon: Map,
      category: 'location',
      path: '/api-examples/mapbox',
      color: 'warning',
    },
    {
      id: 'vaccine',
      title: 'Vaccine Information',
      description: 'Access detailed information about vaccines and immunization schedules',
      icon: Shield,
      category: 'healthcare',
      path: '/api-examples/vaccine',
      color: 'error',
    },
  ];
  
  const filteredExamples = activeCategory === 'all' 
    ? apiExamples 
    : apiExamples.filter(example => example.category === activeCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          API Integration Examples
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Explore examples of how MedFiNet integrates with various healthcare APIs
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All APIs' },
            { id: 'healthcare', label: 'Healthcare' },
            { id: 'blockchain', label: 'Blockchain' },
            { id: 'ai', label: 'Artificial Intelligence' },
            { id: 'location', label: 'Location Services' },
          ].map((category) => (
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
              to={example.path}
              className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`bg-${example.color}-100 dark:bg-${example.color}-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 text-${example.color}-600 dark:text-${example.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {example.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                {example.description}
              </p>
              <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Explore Example
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* External API Documentation */}
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
              icon: Code,
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
    </div>
  );
};

export default ApiExamplesIndex;