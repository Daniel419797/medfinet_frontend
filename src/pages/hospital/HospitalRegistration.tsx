import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building,
  User,
  FileText,
  Wallet,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  MapPin,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import UserContext from '../../contexts/UserContext';
import { medfinetHospitalApi } from '../../services/medfinetHospitalApi';
import NotificationToast from '../../components/health-worker/NotificationToast';
import peraWalletService from '../../services/peraWalletService';

interface HospitalRegistrationData {
  hospitalInfo: {
    name: string;
    type: 'hospital' | 'clinic' | 'health_center' | 'pharmacy';
    email: string;
    phone: string;
    website: string;
    establishedYear: string;
    bedCount: string;
    specialties: string[];
  };
  addressInfo: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  adminInfo: {
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    adminTitle: string;
  };
  documents: {
    hospitalLicense: File | null;
    accreditation: File | null;
    insuranceCertificate: File | null;
    adminId: File | null;
  };
  walletAddress: string;
}

const HospitalRegistration = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { organizationId } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  const [formData, setFormData] = useState<HospitalRegistrationData>({
    hospitalInfo: {
      name: '',
      type: 'hospital',
      email: '',
      phone: '',
      website: '',
      establishedYear: '',
      bedCount: '',
      specialties: [],
    },
    addressInfo: { street: '', city: '', state: '', zipCode: '', country: 'United States' },
    adminInfo: { adminName: '', adminEmail: '', adminPhone: '', adminTitle: '' },
    documents: { hospitalLicense: null, accreditation: null, insuranceCertificate: null, adminId: null },
    walletAddress: '',
  });

  const handleInputChange = (section: keyof HospitalRegistrationData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), [field]: value },
    }));
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      hospitalInfo: {
        ...prev.hospitalInfo,
        specialties: checked
          ? [...prev.hospitalInfo.specialties, specialty]
          : prev.hospitalInfo.specialties.filter(s => s !== specialty),
      },
    }));
  };

  const handleFileUpload = (documentType: keyof HospitalRegistrationData['documents'], file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [documentType]: file },
    }));
  };

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      const walletAddress = await peraWalletService.connect();
      setFormData(prev => ({ ...prev, walletAddress }));
      setNotification({ type: 'success', message: 'Wallet connected successfully!', isVisible: true });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to connect wallet. Please try again.', isVisible: true });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return Object.values(formData.hospitalInfo).every(v => Array.isArray(v) ? true : v.trim() !== '');
      case 2: return Object.values(formData.addressInfo).every(v => v.trim() !== '');
      case 3: return Object.values(formData.adminInfo).every(v => v.trim() !== '');
      case 4: return Object.values(formData.documents).every(doc => doc !== null);
      case 5: return formData.walletAddress !== '';
      default: return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      setNotification({ type: 'error', message: 'Please fill in all required fields before proceeding.', isVisible: true });
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      setNotification({ type: 'error', message: 'Please complete all steps before submitting.', isVisible: true });
      return;
    }
    if (!organizationId) {
      setNotification({ type: 'error', message: 'No organization selected. Please log in first.', isVisible: true });
      return;
    }

    setIsSubmitting(true);
    try {
      await medfinetHospitalApi.register(organizationId, {
        hospitalInfo: formData.hospitalInfo,
        addressInfo: formData.addressInfo,
        adminInfo: formData.adminInfo,
        walletAddress: formData.walletAddress,
      });

      setNotification({
        type: 'success',
        message: 'Hospital registration submitted successfully! You will receive verification status within 24-48 hours.',
        isVisible: true,
      });
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Registration failed. Please try again.', isVisible: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Hospital Information', icon: Building },
    { number: 2, title: 'Address Details', icon: MapPin },
    { number: 3, title: 'Administrator Info', icon: User },
    { number: 4, title: 'Document Upload', icon: FileText },
    { number: 5, title: 'Wallet Connection', icon: Wallet },
  ];

  const specialtyOptions = [
    'Pediatrics', 'Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine',
    'Internal Medicine', 'Surgery', 'Radiology', 'Pathology', 'Anesthesiology',
    'Dermatology', 'Psychiatry', 'Oncology', 'Immunology', 'Infectious Disease',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-600 to-accent-800 dark:from-neutral-800 dark:to-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center text-white hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">MedFiNet</span>
            </Link>
            <ThemeToggle className="text-white hover:bg-white hover:bg-opacity-20" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Hospital Registration</h1>
          <p className="text-accent-100 dark:text-neutral-300">Join our verified network of healthcare institutions</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-success-500 border-success-500 text-white'
                      : isActive ? 'bg-accent-500 border-accent-500 text-white'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-500 dark:text-neutral-400'}`}>Step {step.number}</p>
                    <p className={`text-xs ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-success-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Hospital Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Hospital/Facility Name *</label>
                    <input type="text" value={formData.hospitalInfo.name} onChange={(e) => handleInputChange('hospitalInfo', 'name', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="Enter hospital or facility name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Facility Type *</label>
                    <select value={formData.hospitalInfo.type} onChange={(e) => handleInputChange('hospitalInfo', 'type', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white">
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="health_center">Health Center</option>
                      <option value="pharmacy">Pharmacy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Established Year *</label>
                    <input type="number" value={formData.hospitalInfo.establishedYear} onChange={(e) => handleInputChange('hospitalInfo', 'establishedYear', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="e.g., 1985" min="1800" max={new Date().getFullYear()} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address *</label>
                    <input type="email" value={formData.hospitalInfo.email} onChange={(e) => handleInputChange('hospitalInfo', 'email', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="contact@hospital.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phone Number *</label>
                    <input type="tel" value={formData.hospitalInfo.phone} onChange={(e) => handleInputChange('hospitalInfo', 'phone', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Website</label>
                    <input type="url" value={formData.hospitalInfo.website} onChange={(e) => handleInputChange('hospitalInfo', 'website', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="https://www.hospital.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Number of Beds</label>
                    <input type="number" value={formData.hospitalInfo.bedCount} onChange={(e) => handleInputChange('hospitalInfo', 'bedCount', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="e.g., 250" min="1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Medical Specialties</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-neutral-300 dark:border-neutral-600 rounded-md p-3">
                      {specialtyOptions.map((specialty) => (
                        <label key={specialty} className="flex items-center text-sm">
                          <input type="checkbox" checked={formData.hospitalInfo.specialties.includes(specialty)} onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)} className="mr-2 h-4 w-4 text-accent-600 focus:ring-accent-500 border-neutral-300 rounded" />
                          {specialty}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Address Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Street Address *</label>
                    <input type="text" value={formData.addressInfo.street} onChange={(e) => handleInputChange('addressInfo', 'street', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="123 Medical Center Drive" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">City *</label>
                    <input type="text" value={formData.addressInfo.city} onChange={(e) => handleInputChange('addressInfo', 'city', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">State/Province *</label>
                    <input type="text" value={formData.addressInfo.state} onChange={(e) => handleInputChange('addressInfo', 'state', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="State or Province" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">ZIP/Postal Code *</label>
                    <input type="text" value={formData.addressInfo.zipCode} onChange={(e) => handleInputChange('addressInfo', 'zipCode', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="ZIP or Postal Code" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Country *</label>
                    <select value={formData.addressInfo.country} onChange={(e) => handleInputChange('addressInfo', 'country', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white">
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Administrator Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Administrator Name *</label>
                    <input type="text" value={formData.adminInfo.adminName} onChange={(e) => handleInputChange('adminInfo', 'adminName', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="Full name of administrator" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Administrator Title *</label>
                    <input type="text" value={formData.adminInfo.adminTitle} onChange={(e) => handleInputChange('adminInfo', 'adminTitle', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="e.g., Chief Medical Officer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Administrator Email *</label>
                    <input type="email" value={formData.adminInfo.adminEmail} onChange={(e) => handleInputChange('adminInfo', 'adminEmail', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="admin@hospital.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Administrator Phone *</label>
                    <input type="tel" value={formData.adminInfo.adminPhone} onChange={(e) => handleInputChange('adminInfo', 'adminPhone', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-neutral-700 dark:text-white" placeholder="(555) 123-4567" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Required Documents</h2>
                <div className="space-y-6">
                  <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-warning-800 dark:text-warning-300 mb-1">Document Requirements</h3>
                        <p className="text-sm text-warning-700 dark:text-warning-400">All documents must be clear, legible, and in PDF or image format (JPG, PNG). Maximum file size: 10MB per document.</p>
                      </div>
                    </div>
                  </div>

                  {[
                    { key: 'hospitalLicense' as const, label: 'Hospital Operating License', id: 'license-upload' },
                    { key: 'accreditation' as const, label: 'Accreditation Certificate', id: 'accreditation-upload' },
                    { key: 'insuranceCertificate' as const, label: 'Insurance Certificate', id: 'insurance-upload' },
                    { key: 'adminId' as const, label: 'Administrator ID Document', id: 'admin-id-upload' },
                  ].map(({ key, label, id }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">{label} *</label>
                      <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Upload {label.toLowerCase()}</p>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleFileUpload(key, e.target.files[0])} className="hidden" id={id} />
                        <label htmlFor={id} className="bg-accent-600 hover:bg-accent-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block">Choose File</label>
                        {formData.documents[key] && <p className="text-sm text-success-600 dark:text-success-400 mt-2">\u2713 {formData.documents[key]!.name}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Blockchain Wallet Connection</h2>
                <div className="text-center">
                  <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg p-8 mb-6">
                    <Wallet className="h-16 w-16 text-accent-600 dark:text-accent-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-300 mb-2">Connect Hospital Wallet</h3>
                    <p className="text-accent-700 dark:text-accent-400 mb-6">Your wallet will be used for blockchain verification and secure transactions.</p>

                    {formData.walletAddress ? (
                      <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                        <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400 mx-auto mb-2" />
                        <p className="text-success-800 dark:text-success-300 font-medium mb-2">Wallet Connected Successfully!</p>
                        <p className="text-success-700 dark:text-success-400 font-mono text-sm">{formData.walletAddress}</p>
                      </div>
                    ) : (
                      <button onClick={connectWallet} disabled={isConnectingWallet} className="bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center mx-auto">
                        {isConnectingWallet ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" />Connecting...</>) : (<><Wallet className="h-5 w-5 mr-2" />Connect Algorand Wallet</>)}
                      </button>
                    )}
                  </div>

                  <div className="text-left bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Supported Wallets:</h4>
                    <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
                      <li>\u2022 Pera Wallet (Recommended)</li>
                      <li>\u2022 AlgoSigner</li>
                      <li>\u2022 MyAlgo Wallet</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <button onClick={prevStep} disabled={currentStep === 1} className="bg-neutral-200 hover:bg-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400 text-neutral-700 font-medium py-2 px-4 rounded-md transition-colors">Previous</button>
            {currentStep < 5 ? (
              <button onClick={nextStep} className="bg-accent-600 hover:bg-accent-700 text-white font-medium py-2 px-6 rounded-md transition-colors">Next Step</button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting || !formData.walletAddress} className="bg-success-600 hover:bg-success-700 disabled:bg-success-400 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors">
                {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>) : (<><CheckCircle className="h-4 w-4 mr-2" />Submit Registration</>)}
              </button>
            )}
          </div>
        </div>

        <div className="text-center text-accent-100 dark:text-neutral-400 text-sm">
          <p>Need help with registration? <a href="mailto:support@medfinet.com" className="text-white hover:underline font-medium">Contact Support</a></p>
        </div>
      </div>

      <NotificationToast type={notification.type} message={notification.message} isVisible={notification.isVisible} onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
};

export default HospitalRegistration;
