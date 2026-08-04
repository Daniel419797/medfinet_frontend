import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Code, 
  ArrowLeft,
  Menu,
  X,
  CheckCircle,
  FileText,
  Database,
  Server,
  Lock,
  Key,
  Globe
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

const ApiPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
                <span className="text-xl font-bold text-neutral-900 dark:text-white">MedFiNet</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/features"
                className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
              >
                Features
              </Link>
              <Link 
                to="/how-it-works"
                className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
              >
                How It Works
              </Link>
              <Link 
                to="/testimonials"
                className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
              >
                Testimonials
              </Link>
              <Link 
                to="/api"
                className="text-primary-600 dark:text-primary-400 font-medium"
              >
                API
              </Link>
              <ThemeToggle />
              <Link
                to="/login"
                className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden transition-all duration-500 ease-out overflow-hidden ${
            isMobileMenuOpen 
              ? 'max-h-96 opacity-100 transform translate-y-0' 
              : 'max-h-0 opacity-0 transform -translate-y-4'
          }`}>
            <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 rounded-b-lg shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  to="/features"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                >
                  Features
                </Link>
                <Link 
                  to="/how-it-works"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                >
                  How It Works
                </Link>
                <Link 
                  to="/testimonials"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                >
                  Testimonials
                </Link>
                <Link 
                  to="/api"
                  className="block px-3 py-2 text-primary-600 dark:text-primary-400 font-medium"
                >
                  API
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-primary-600 text-white rounded-lg font-medium transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-800 dark:to-neutral-900">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
              Developer API Access
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
              Integrate MedFiNet's powerful healthcare and blockchain features directly into your applications.
            </p>
            <Link
              to="/"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* API Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
              <div className={`transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`}>
                <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Code className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  Powerful Healthcare APIs
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  Access our comprehensive suite of healthcare APIs to build innovative applications that leverage secure, blockchain-verified health data.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">FHIR-compliant healthcare data access</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Blockchain verification and tokenization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Secure authentication and authorization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Comprehensive documentation and SDKs</span>
                  </li>
                </ul>
                <a
                  href="#"
                  className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                >
                  View API Documentation
                </a>
              </div>
              <div className={`relative transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <div className="bg-neutral-900 dark:bg-neutral-800 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                    <code>
{`// Example API request to retrieve vaccination records
const getVaccinationRecords = async (childId) => {
  const response = await fetch(
    \`https://api.medfinet.com/v1/children/\${childId}/vaccinations\`,
    {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
};

// Example response
{
  "records": [
    {
      "id": "vax_123456",
      "vaccineName": "DTaP",
      "dateAdministered": "2023-06-15",
      "provider": "Dr. Smith",
      "verified": true,
      "blockchainHash": "0x7f9e8d...6b2c1a"
    }
  ]
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Features */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              API Features
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Explore the powerful capabilities of our developer APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Healthcare Data API',
                description: 'Access standardized healthcare data using our FHIR-compliant API. Securely retrieve and manage patient records, immunization data, and more.',
                icon: FileText,
                delay: '0.1s',
                color: 'primary'
              },
              {
                title: 'Blockchain Verification',
                description: 'Leverage our blockchain infrastructure to verify and tokenize healthcare records, ensuring data integrity and immutability.',
                icon: Shield,
                delay: '0.3s',
                color: 'secondary'
              },
              {
                title: 'Authentication & Security',
                description: 'Robust authentication and authorization mechanisms to ensure secure access to sensitive healthcare data.',
                icon: Lock,
                delay: '0.5s',
                color: 'accent'
              },
              {
                title: 'Health Center Locator',
                description: 'Integrate our location-based API to help users find nearby healthcare facilities and vaccination centers.',
                icon: Globe,
                delay: '0.2s',
                color: 'success'
              },
              {
                title: 'Vaccination Management',
                description: 'APIs for managing vaccination records, schedules, and reminders for patients of all ages.',
                icon: Database,
                delay: '0.4s',
                color: 'warning'
              },
              {
                title: 'Developer SDKs',
                description: 'Comprehensive SDKs for web, mobile, and backend integration to accelerate your development process.',
                icon: Code,
                delay: '0.6s',
                color: 'error'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white dark:bg-neutral-700 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: feature.delay }}
                >
                  <div className={`bg-${feature.color}-100 dark:bg-${feature.color}-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">{feature.description}</p>
                  <a href="#" className={`text-${feature.color}-600 dark:text-${feature.color}-400 font-medium hover:underline`}>
                    Learn more →
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className={`transition-all duration-1000 ${
                  isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
                }`}>
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                    Comprehensive Documentation
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                    Our detailed API documentation provides everything you need to integrate MedFiNet into your applications.
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">Getting Started Guides</h4>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Step-by-step tutorials for quick integration</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">API Reference</h4>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Complete endpoint documentation with examples</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">SDK Libraries</h4>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Client libraries for multiple programming languages</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">Sample Applications</h4>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Example projects demonstrating API usage</p>
                      </div>
                    </li>
                  </ul>
                  <a
                    href="#"
                    className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Explore Documentation
                  </a>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className={`bg-neutral-900 dark:bg-neutral-800 rounded-xl p-6 shadow-xl transition-all duration-1000 ${
                  isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
                }`} style={{ transitionDelay: '0.3s' }}>
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="ml-4 text-xs text-neutral-400">API Documentation</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="col-span-1 bg-neutral-800 dark:bg-neutral-700 rounded-lg p-4">
                      <ul className="space-y-2 text-sm">
                        <li className="text-primary-400 font-medium">Getting Started</li>
                        <li className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Authentication</li>
                        <li className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Patients</li>
                        <li className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Vaccinations</li>
                        <li className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Blockchain</li>
                        <li className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Health Centers</li>
                        <li className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Error Handling</li>
                      </ul>
                    </div>
                    <div className="col-span-2 bg-neutral-800 dark:bg-neutral-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Authentication</h4>
                      <p className="text-neutral-300 text-sm mb-4">
                        All API requests require authentication using API keys or OAuth 2.0 tokens.
                      </p>
                      <div className="bg-neutral-900 p-3 rounded-lg mb-4">
                        <pre className="text-green-400 font-mono text-xs overflow-x-auto">
                          <code>
{`// API Key Authentication
fetch('https://api.medfinet.com/v1/patients', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})

// OAuth 2.0 Authentication
const tokenResponse = await fetch('https://api.medfinet.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    grant_type: 'client_credentials'
  })
});

const { access_token } = await tokenResponse.json();`}
                          </code>
                        </pre>
                      </div>
                      <h5 className="text-white text-sm font-medium mb-2">Security Best Practices</h5>
                      <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                        <li>Never expose API keys in client-side code</li>
                        <li>Implement proper scope restrictions for OAuth tokens</li>
                        <li>Rotate API keys regularly</li>
                        <li>Use HTTPS for all API requests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Pricing */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              API Pricing
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Flexible pricing options to suit your development needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Developer',
                price: 'Free',
                description: 'Perfect for testing and development',
                features: [
                  '1,000 API calls per month',
                  'Basic authentication',
                  'Access to core endpoints',
                  'Community support',
                  'Standard rate limiting'
                ],
                cta: 'Get Started Free',
                featured: false,
                delay: '0.1s'
              },
              {
                title: 'Professional',
                price: '$99',
                period: 'per month',
                description: 'For production applications and businesses',
                features: [
                  '100,000 API calls per month',
                  'OAuth 2.0 authentication',
                  'Access to all endpoints',
                  'Email support',
                  'Higher rate limits',
                  'Webhook notifications'
                ],
                cta: 'Subscribe Now',
                featured: true,
                delay: '0.3s'
              },
              {
                title: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations with specific needs',
                features: [
                  'Unlimited API calls',
                  'Custom authentication options',
                  'Dedicated infrastructure',
                  'Priority support',
                  'Custom rate limits',
                  'SLA guarantees',
                  'On-premises deployment options'
                ],
                cta: 'Contact Sales',
                featured: false,
                delay: '0.5s'
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-neutral-700 rounded-xl shadow-lg overflow-hidden transition-all duration-1000 ${
                  plan.featured ? 'border-2 border-primary-500 dark:border-primary-400 transform md:-translate-y-4' : 'border border-neutral-200 dark:border-neutral-600'
                } ${
                  isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: plan.delay }}
              >
                {plan.featured && (
                  <div className="bg-primary-500 text-white py-2 text-center text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{plan.title}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">{plan.price}</span>
                    {plan.period && <span className="text-neutral-500 dark:text-neutral-400 text-sm"> {plan.period}</span>}
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                        <span className="text-neutral-700 dark:text-neutral-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      plan.featured 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                        : 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Sign up for a developer account to get your API keys and start building with MedFiNet.
                </p>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg w-full"
                  >
                    Get API Access
                  </button>
                </form>
              </div>
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 flex items-center justify-center">
                <div className="text-center">
                  <Key className="h-16 w-16 text-white opacity-80 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Developer Resources</h3>
                  <ul className="space-y-3 text-left mb-6">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-200 mr-3 mt-0.5" />
                      <span className="text-primary-100">Comprehensive API documentation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-200 mr-3 mt-0.5" />
                      <span className="text-primary-100">Interactive API explorer</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-200 mr-3 mt-0.5" />
                      <span className="text-primary-100">SDK libraries for multiple languages</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-200 mr-3 mt-0.5" />
                      <span className="text-primary-100">Sample applications and code snippets</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-200 mr-3 mt-0.5" />
                      <span className="text-primary-100">Developer community and support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 dark:bg-neutral-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <Shield className="h-8 w-8 text-primary-400 mr-2" />
            <span className="text-xl font-bold">MedFiNet</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <Link to="/" className="text-neutral-400 hover:text-white transition-colors">Home</Link>
            <Link to="/features" className="text-neutral-400 hover:text-white transition-colors">Features</Link>
            <Link to="/how-it-works" className="text-neutral-400 hover:text-white transition-colors">How It Works</Link>
            <Link to="/testimonials" className="text-neutral-400 hover:text-white transition-colors">Testimonials</Link>
            <Link to="/api" className="text-neutral-400 hover:text-white transition-colors">API</Link>
            <Link to="/login" className="text-neutral-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="text-neutral-400 hover:text-white transition-colors">Register</Link>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 MedFiNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApiPage;