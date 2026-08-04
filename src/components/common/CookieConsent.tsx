import { useState, useEffect } from 'react';
import { Cookie, X, Settings, Shield, BarChart3 } from 'lucide-react';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieConsent = ({ onAccept, onDecline }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setIsVisible(false);
    onAccept?.();
  };

  const handleDeclineAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setIsVisible(false);
    onDecline?.();
  };

  const handleSavePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setIsVisible(false);
    onAccept?.();
  };

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl border border-neutral-200 max-w-4xl w-full pointer-events-auto animate-slide-up">
        {!showDetails ? (
          // Simple consent banner
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Cookie className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  We value your privacy
                </h3>
                <p className="text-neutral-600 mb-4">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more about our cookie policy.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="btn-primary flex-1 sm:flex-none"
                  >
                    Accept All Cookies
                  </button>
                  <button
                    onClick={handleDeclineAll}
                    className="btn-outline flex-1 sm:flex-none"
                  >
                    Decline All
                  </button>
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-primary-600 hover:text-primary-800 font-medium flex items-center justify-center"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDeclineAll}
                className="flex-shrink-0 ml-4 p-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // Detailed preferences
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-neutral-600 mb-6">
              Choose which cookies you want to accept. You can change these settings at any time.
            </p>
            
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-success-600 mr-2" />
                    <h4 className="font-semibold text-neutral-900">Necessary Cookies</h4>
                    <span className="ml-2 text-xs bg-success-100 text-success-800 px-2 py-1 rounded-full">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-6 bg-success-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-5 w-5 text-primary-600 mr-2" />
                    <h4 className="font-semibold text-neutral-900">Analytics Cookies</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handlePreferenceChange('analytics')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      preferences.analytics ? 'bg-primary-500' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.analytics ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Cookie className="h-5 w-5 text-accent-600 mr-2" />
                    <h4 className="font-semibold text-neutral-900">Marketing Cookies</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    These cookies are used to track visitors across websites to display relevant and engaging advertisements.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handlePreferenceChange('marketing')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      preferences.marketing ? 'bg-primary-500' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.marketing ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Settings className="h-5 w-5 text-secondary-600 mr-2" />
                    <h4 className="font-semibold text-neutral-900">Functional Cookies</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handlePreferenceChange('functional')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      preferences.functional ? 'bg-primary-500' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.functional ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSavePreferences}
                className="btn-primary flex-1"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="btn-outline flex-1"
              >
                Accept All
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <a 
                href="/privacy-policy" 
                className="text-sm text-primary-600 hover:text-primary-800 underline"
              >
                Read our Privacy Policy
              </a>
              <span className="text-neutral-400 mx-2">•</span>
              <a 
                href="/cookie-policy" 
                className="text-sm text-primary-600 hover:text-primary-800 underline"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;