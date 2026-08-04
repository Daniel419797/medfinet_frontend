import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Zap, 
  CheckCircle, 
  ArrowLeft,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

const FeaturesPage = () => {
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
                className="text-primary-600 dark:text-primary-400 font-medium"
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
                className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
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
                  className="block px-3 py-2 text-primary-600 dark:text-primary-400 font-medium"
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
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
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
              Comprehensive Healthcare Management Features
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
              Everything you need to manage your family's healthcare journey in one secure, blockchain-powered platform.
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

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
            }`}>
              <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                Child Profile Management
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                Securely store and manage your children's health profiles with blockchain verification. Keep all important health information in one place.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Create digital health profiles for each child</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Blockchain verification for data integrity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Secure sharing with healthcare providers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Complete vaccination history tracking</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className={`relative transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
            }`} style={{ transitionDelay: '0.3s' }}>
              <img
                src="https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Child profile management"
                className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 transition-all duration-1000 hover:scale-110">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-success-500 rounded-full mr-3 animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Profile Secured</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Blockchain Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className={`relative order-2 md:order-1 transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
            }`} style={{ transitionDelay: '0.3s' }}>
              <img
                src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Nurse-verified records"
                className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -top-6 -left-6 bg-secondary-600 text-white p-4 rounded-xl shadow-lg transition-all duration-1000 hover:scale-110 hover:rotate-3">
                <div className="text-center">
                  <p className="text-2xl font-bold animate-pulse">100%</p>
                  <p className="text-xs opacity-90">Verified</p>
                </div>
              </div>
            </div>
            <div className={`order-1 md:order-2 transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
            }`}>
              <div className="bg-secondary-100 dark:bg-secondary-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                Nurse-Verified Records
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                All vaccination records are verified by certified healthcare professionals, ensuring accuracy and reliability.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Records verified by licensed professionals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Digital signatures for authenticity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Tamper-proof blockchain storage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Compliant with healthcare regulations</span>
                </li>
              </ul>
              <Link
                to="/health-worker/register"
                className="inline-flex items-center bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
              >
                For Healthcare Providers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
            }`}>
              <div className="bg-accent-100 dark:bg-accent-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-accent-600 dark:text-accent-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                Healthcare Finance
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                Tokenize medical invoices and access innovative financing solutions to make healthcare more affordable and accessible.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Tokenize medical invoices on blockchain</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Access to invoice financing marketplace</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Secure payment processing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Transparent transaction history</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
              >
                Explore Finance Options
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className={`relative transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
            }`} style={{ transitionDelay: '0.3s' }}>
              <img
                src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Healthcare finance"
                className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 transition-all duration-1000 hover:scale-110">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-accent-600 dark:text-accent-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Invoice Tokenized</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Ready for financing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className={`relative order-2 md:order-1 transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
            }`} style={{ transitionDelay: '0.3s' }}>
              <img
                src="https://images.pexels.com/photos/7089626/pexels-photo-7089626.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Pediatric center locator"
                className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -top-6 -right-6 bg-success-600 text-white p-4 rounded-xl shadow-lg transition-all duration-1000 hover:scale-110 hover:rotate-3">
                <div className="text-center">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-xs opacity-90">Access</p>
                </div>
              </div>
            </div>
            <div className={`order-1 md:order-2 transition-all duration-1000 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
            }`}>
              <div className="bg-success-100 dark:bg-success-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                Pediatric Center Locator
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                Find nearby pediatric healthcare centers and vaccination clinics with our interactive map and search tools.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Location-based search for healthcare facilities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Filter by services and available vaccines</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Real-time availability information</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-200">Directions and contact details</span>
                </li>
              </ul>
              <Link
                to="/health-centers"
                className="inline-flex items-center bg-success-600 hover:bg-success-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
              >
                Find Health Centers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families already using MedFiNet to protect and manage their children's healthcare records.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Sign In
            </Link>
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

export default FeaturesPage;