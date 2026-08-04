import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Calendar, 
  CheckCircle, 
  ArrowLeft,
  Menu,
  X,
  ArrowRight,
  Upload,
  Database,
  FileCheck
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

const HowItWorksPage = () => {
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
                className="text-primary-600 dark:text-primary-400 font-medium"
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
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                >
                  Features
                </Link>
                <Link 
                  to="/how-it-works"
                  className="block px-3 py-2 text-primary-600 dark:text-primary-400 font-medium"
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
              How MedFiNet Works
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
              Simple steps to secure your child's healthcare journey with blockchain technology.
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

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
              <div className={`transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6">
                  01
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  Create Child Profile
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  Register your child and create a secure digital health profile with blockchain verification. This serves as the foundation for all health records.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Enter basic information like name, birth date, and gender</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Secure with blockchain verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Create multiple profiles for all your children</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Learn more about profile creation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className={`relative transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <img
                  src="https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Create child profile"
                  className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 transition-all duration-1000 hover:scale-110">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Profile Created</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Step 1 Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
              <div className={`relative order-2 md:order-1 transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <img
                  src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Nurse documentation"
                  className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute -top-6 -left-6 bg-secondary-600 text-white p-4 rounded-xl shadow-lg transition-all duration-1000 hover:scale-110 hover:rotate-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">02</p>
                    <p className="text-xs opacity-90">Verification</p>
                  </div>
                </div>
              </div>
              <div className={`order-1 md:order-2 transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-secondary-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6">
                  02
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  Nurse Documentation
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  Healthcare professionals document vaccination records directly into the secure system, ensuring accuracy and completeness.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Nurses and doctors record vaccinations in real-time</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Digital signature verification by healthcare providers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Complete vaccine details including batch numbers and dates</span>
                  </li>
                </ul>
                <Link
                  to="/health-worker/register"
                  className="inline-flex items-center text-secondary-600 dark:text-secondary-400 font-medium hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                >
                  For healthcare professionals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
              <div className={`transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-accent-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6">
                  03
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  Blockchain Verification
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  All records are verified and stored on the blockchain for permanent, tamper-proof documentation that can be accessed anywhere.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Records are cryptographically secured on blockchain</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Immutable record that cannot be altered</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Verifiable by third parties with proper authorization</span>
                  </li>
                </ul>
                <Link
                  to="/api"
                  className="inline-flex items-center text-accent-600 dark:text-accent-400 font-medium hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
                >
                  Learn about our blockchain technology
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className={`relative transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <img
                  src="https://images.pexels.com/photos/8370754/pexels-photo-8370754.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Blockchain verification"
                  className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 transition-all duration-1000 hover:scale-110">
                  <div className="flex items-center">
                    <FileCheck className="h-5 w-5 text-accent-600 dark:text-accent-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Verified on Blockchain</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">100% Secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={`relative order-2 md:order-1 transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Access and share"
                  className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute -top-6 -left-6 bg-success-600 text-white p-4 rounded-xl shadow-lg transition-all duration-1000 hover:scale-110 hover:rotate-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">04</p>
                    <p className="text-xs opacity-90">Access</p>
                  </div>
                </div>
              </div>
              <div className={`order-1 md:order-2 transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`}>
                <div className="w-16 h-16 bg-success-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6">
                  04
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  Access and Share
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  Access your child's health records anytime, anywhere, and securely share them with healthcare providers when needed.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">24/7 access to complete health records</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Secure sharing with healthcare providers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">QR codes for quick access during appointments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-200">Downloadable certificates and reports</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="inline-flex items-center text-success-600 dark:text-success-400 font-medium hover:text-success-700 dark:hover:text-success-300 transition-colors"
                >
                  Start managing your records
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              The Complete Process
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              From registration to accessing your records, our streamlined process makes healthcare management simple and secure.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Process line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-primary-200 dark:bg-primary-800 transform -translate-x-1/2 hidden md:block"></div>

            {/* Process steps */}
            <div className="space-y-24">
              {/* Registration */}
              <div className="relative">
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                  1
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-8 md:mt-0">
                  <div className={`transition-all duration-1000 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`} style={{ transitionDelay: '0.2s' }}>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                      Registration
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Create your account and connect your blockchain wallet for secure access to all features.
                    </p>
                  </div>
                  <div className="md:order-first md:text-right">
                    <div className={`inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 transition-all duration-1000 ${
                      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: '0.3s' }}>
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Creation */}
              <div className="relative">
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                  2
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-8 md:mt-0">
                  <div className="md:text-right">
                    <div className={`inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 transition-all duration-1000 ${
                      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: '0.3s' }}>
                      <Upload className="h-8 w-8" />
                    </div>
                  </div>
                  <div className={`transition-all duration-1000 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`} style={{ transitionDelay: '0.2s' }}>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                      Profile Creation
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Add your children's profiles with essential health information and medical history.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vaccination Records */}
              <div className="relative">
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                  3
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-8 md:mt-0">
                  <div className={`transition-all duration-1000 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`} style={{ transitionDelay: '0.2s' }}>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                      Vaccination Records
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Healthcare providers add vaccination records directly to your child's profile during visits.
                    </p>
                  </div>
                  <div className="md:order-first md:text-right">
                    <div className={`inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 transition-all duration-1000 ${
                      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: '0.3s' }}>
                      <Shield className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Verification */}
              <div className="relative">
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                  4
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-8 md:mt-0">
                  <div className="md:text-right">
                    <div className={`inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 transition-all duration-1000 ${
                      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: '0.3s' }}>
                      <Database className="h-8 w-8" />
                    </div>
                  </div>
                  <div className={`transition-all duration-1000 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`} style={{ transitionDelay: '0.2s' }}>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                      Blockchain Verification
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Records are automatically verified and stored on the blockchain for permanent, tamper-proof documentation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Access Anywhere */}
              <div className="relative">
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                  5
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-8 md:mt-0">
                  <div className={`transition-all duration-1000 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`} style={{ transitionDelay: '0.2s' }}>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                      Access Anywhere
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Access your child's complete health records anytime, anywhere, from any device with internet access.
                    </p>
                  </div>
                  <div className="md:order-first md:text-right">
                    <div className={`inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 transition-all duration-1000 ${
                      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: '0.3s' }}>
                      <Globe className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Sharing */}
              <div className="relative">
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                  6
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-8 md:mt-0">
                  <div className="md:text-right">
                    <div className={`inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 transition-all duration-1000 ${
                      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: '0.3s' }}>
                      <FileCheck className="h-8 w-8" />
                    </div>
                  </div>
                  <div className={`transition-all duration-1000 ${
                    isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                  }`} style={{ transitionDelay: '0.2s' }}>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                      Secure Sharing
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Securely share records with schools, camps, or healthcare providers using QR codes or direct access links.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families already using MedFiNet to protect and manage their children's healthcare records.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Create Your Account
            </Link>
            <Link
              to="/features"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Explore Features
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

export default HowItWorksPage;