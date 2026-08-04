import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Star, 
  ArrowLeft,
  Menu,
  X,
  Quote,
  User,
  MessageSquare,
  Users,
  Globe
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

const TestimonialsPage = () => {
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
                className="text-primary-600 dark:text-primary-400 font-medium"
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
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                >
                  How It Works
                </Link>
                <Link 
                  to="/testimonials"
                  className="block px-3 py-2 text-primary-600 dark:text-primary-400 font-medium"
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
              Trusted by Families Worldwide
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
              See what parents and healthcare professionals are saying about MedFiNet.
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

      {/* Featured Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
              <div className={`transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-20 opacity-0'
              }`}>
                <div className="relative mb-6">
                  <Quote className="absolute -top-6 -left-6 h-12 w-12 text-primary-200 dark:text-primary-800 transform rotate-180" />
                  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 italic mb-6">
                      "MedFiNet has completely transformed how I manage my children's health records. Having all their vaccination history in one secure place gives me peace of mind, especially when traveling or switching doctors. The blockchain verification is a game-changer!"
                    </p>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <img 
                    src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
                    alt="Sarah Johnson"
                    className="w-14 h-14 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Sarah Johnson</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Mother of two</p>
                  </div>
                </div>
              </div>
              <div className={`transition-all duration-1000 ${
                isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-20 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                <div className="relative mb-6">
                  <Quote className="absolute -top-6 -left-6 h-12 w-12 text-secondary-200 dark:text-secondary-800 transform rotate-180" />
                  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 italic mb-6">
                      "As a pediatrician, I've seen many health record systems, but MedFiNet stands out for its security and ease of use. The blockchain verification ensures records can't be tampered with, and the interface makes documenting vaccinations quick and efficient."
                    </p>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <img 
                    src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=150"
                    alt="Dr. Emily Rodriguez"
                    className="w-14 h-14 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Dr. Emily Rodriguez</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Pediatrician</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Grid */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Hear from parents, healthcare providers, and administrators who use MedFiNet every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Michael Chen',
                role: 'Father of three',
                content: 'The ability to access my children\'s complete vaccination history from my phone has been invaluable during doctor visits and school registrations.',
                rating: 5,
                avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
                delay: '0.1s'
              },
              {
                name: 'Dr. James Wilson',
                role: 'Family Physician',
                content: 'MedFiNet has streamlined our vaccination process. The blockchain verification gives both our clinic and patients confidence in the records\' authenticity.',
                rating: 5,
                avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
                delay: '0.3s'
              },
              {
                name: 'Lisa Thompson',
                role: 'School Nurse',
                content: 'Verifying student vaccination records has never been easier. The QR code system allows for instant verification without compromising privacy.',
                rating: 5,
                avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
                delay: '0.5s'
              },
              {
                name: 'Robert Garcia',
                role: 'Healthcare Administrator',
                content: 'Implementing MedFiNet at our clinic has reduced administrative overhead and improved record accuracy. The API integration was seamless.',
                rating: 4,
                avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150',
                delay: '0.2s'
              },
              {
                name: 'Jennifer Kim',
                role: 'Mother of one',
                content: 'As a new parent, keeping track of my baby\'s vaccinations was overwhelming until I found MedFiNet. Now I feel confident that I\'m not missing anything important.',
                rating: 5,
                avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
                delay: '0.4s'
              },
              {
                name: 'Dr. Samantha Lee',
                role: 'Pediatric Specialist',
                content: 'The detailed health records available through MedFiNet help me provide better care for my patients. Having the complete history at my fingertips is invaluable.',
                rating: 5,
                avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
                delay: '0.6s'
              },
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-neutral-700 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 ${
                  isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: testimonial.delay }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                  ))}
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Video Testimonials
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Watch real users share their experiences with MedFiNet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'How MedFiNet Helped Our Family',
                person: 'The Williams Family',
                thumbnail: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=600',
                delay: '0.2s'
              },
              {
                title: 'A Pediatrician\'s Perspective',
                person: 'Dr. Michael Chen',
                thumbnail: 'https://images.pexels.com/photos/5327584/pexels-photo-5327584.jpeg?auto=compress&cs=tinysrgb&w=600',
                delay: '0.4s'
              }
            ].map((video, index) => (
              <div 
                key={index}
                className={`bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden transition-all duration-1000 ${
                  isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: video.delay }}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-primary-600 ml-1"></div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{video.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">{video.person}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Stats */}
      <section className="py-16 bg-primary-600 dark:bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '10,000+', label: 'Families', icon: Users },
                { number: '1,500+', label: 'Healthcare Providers', icon: Stethoscope },
                { number: '98.5%', label: 'Satisfaction Rate', icon: Star },
                { number: '50,000+', label: 'Vaccinations Recorded', icon: Shield }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className={`transition-all duration-1000 ${
                      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 0.1 + 0.2}s` }}
                  >
                    <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8" />
                    </div>
                    <p className="text-3xl font-bold mb-2">{stat.number}</p>
                    <p className="text-primary-100">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Share Your Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                  Share Your Story
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  We'd love to hear about your experience with MedFiNet. Your feedback helps us improve and inspires other families.
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
                      Your Story
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      placeholder="Share your experience with MedFiNet..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg w-full"
                  >
                    Submit Your Story
                  </button>
                </form>
              </div>
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-white opacity-80 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Join Our Community</h3>
                  <p className="text-primary-100 mb-6">
                    Your story could be featured on our website and help other families discover the benefits of secure health records.
                  </p>
                  <div className="flex justify-center space-x-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
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
            Join Our Growing Community
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Experience the benefits of secure, blockchain-verified healthcare records for your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/features"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Learn More
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

export default TestimonialsPage;