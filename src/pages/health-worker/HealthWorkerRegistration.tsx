import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  User,
  Building,
  FileText,
  Wallet,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { medfinetHealthWorkerApi } from '../../services/medfinetHealthWorkerApi';
import NotificationToast from '../../components/health-worker/NotificationToast';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect({ network: 'testnet' });

interface RegistrationData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  professionalInfo: {
    role: 'doctor' | 'nurse' | 'administrator' | 'technician';
    licenseNumber: string;
    licenseState: string;
    specialization: string;
    yearsOfExperience: string;
  };
  facilityInfo: {
    facilityName: string;
    facilityType: 'hospital' | 'clinic' | 'health_center' | 'pharmacy';
    address: string;
    city: string;
    state: string;
    zipCode: string;
    facilityPhone: string;
  };
  documents: {
    licenseDocument: File | null;
    idDocument: File | null;
    facilityAffiliation: File | null;
  };
  walletAddress: string;
}

const HealthWorkerRegistration = () => {
  const navigate = useNavigate();
  const { organizationId } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  const [formData, setFormData] = useState<RegistrationData>({
    personalInfo: { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' },
    professionalInfo: {
      role: 'nurse',
      licenseNumber: '',
      licenseState: '',
      specialization: '',
      yearsOfExperience: '',
    },
    facilityInfo: {
      facilityName: '',
      facilityType: 'clinic',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      facilityPhone: '',
    },
    documents: { licenseDocument: null, idDocument: null, facilityAffiliation: null },
    walletAddress: '',
  });

  const handleInputChange = (section: keyof RegistrationData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), [field]: value },
    }));
  };

  const handleFileUpload = (documentType: keyof RegistrationData['documents'], file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [documentType]: file },
    }));
  };

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      const accounts = await peraWallet.connect();
      const walletAddress = accounts[0];
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
      case 1: return Object.values(formData.personalInfo).every(v => v.trim() !== '');
      case 2: return Object.values(formData.professionalInfo).every(v => v.trim() !== '');
      case 3: return Object.values(formData.facilityInfo).every(v => v.trim() !== '');
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
      await medfinetHealthWorkerApi.register(organizationId, {
        personalInfo: formData.personalInfo,
        professionalInfo: formData.professionalInfo,
        facilityInfo: formData.facilityInfo,
        walletAddress: formData.walletAddress,
      });

      setNotification({
        type: 'success',
        message: 'Registration submitted successfully! You will receive verification status within 24-48 hours.',
        isVisible: true,
      });
      setTimeout(() => navigate('/health-worker/dashboard'), 2000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Registration failed. Please try again.', isVisible: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Professional Details', icon: Shield },
    { number: 3, title: 'Facility Information', icon: Building },
    { number: 4, title: 'Document Upload', icon: FileText },
    { number: 5, title: 'Wallet Connection', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 dark:from-neutral-800 dark:to-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-4 hover:opacity-80 transition-opacity">
            <Shield className="h-12 w-12 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">MedFiNet Health Worker Portal</h1>
          </Link>
          <p className="text-primary-100 dark:text-neutral-300">Join our verified network of healthcare professionals</p>
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
                      : isActive ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}`}>Step {step.number}</p>
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
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">First Name *</label>
                    <input type="text" value={formData.personalInfo.firstName} onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Last Name *</label>
                    <input type="text" value={formData.personalInfo.lastName} onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="Enter your last name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address *</label>
                    <input type="email" value={formData.personalInfo.email} onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="your.email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phone Number *</label>
                    <input type="tel" value={formData.personalInfo.phone} onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="(555) 123-4567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Date of Birth *</label>
                    <input type="date" value={formData.personalInfo.dateOfBirth} onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Professional Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Professional Role *</label>
                    <select value={formData.professionalInfo.role} onChange={(e) => handleInputChange('professionalInfo', 'role', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                      <option value="doctor">Doctor/Physician</option>
                      <option value="nurse">Registered Nurse</option>
                      <option value="administrator">Healthcare Administrator</option>
                      <option value="technician">Medical Technician</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">License Number *</label>
                    <input type="text" value={formData.professionalInfo.licenseNumber} onChange={(e) => handleInputChange('professionalInfo', 'licenseNumber', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="e.g., MD-12345-NY" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">License State *</label>
                    <input type="text" value={formData.professionalInfo.licenseState} onChange={(e) => handleInputChange('professionalInfo', 'licenseState', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="e.g., New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Years of Experience *</label>
                    <select value={formData.professionalInfo.yearsOfExperience} onChange={(e) => handleInputChange('professionalInfo', 'yearsOfExperience', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                      <option value="">Select experience</option>
                      <option value="0-2">0-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11-15">11-15 years</option>
                      <option value="16+">16+ years</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Specialization *</label>
                    <input type="text" value={formData.professionalInfo.specialization} onChange={(e) => handleInputChange('professionalInfo', 'specialization', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="e.g., Pediatrics, Family Medicine, Immunology" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Facility Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Facility Name *</label>
                    <input type="text" value={formData.facilityInfo.facilityName} onChange={(e) => handleInputChange('facilityInfo', 'facilityName', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="e.g., City Medical Center" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Facility Type *</label>
                    <select value={formData.facilityInfo.facilityType} onChange={(e) => handleInputChange('facilityInfo', 'facilityType', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="health_center">Health Center</option>
                      <option value="pharmacy">Pharmacy</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Address *</label>
                    <input type="text" value={formData.facilityInfo.address} onChange={(e) => handleInputChange('facilityInfo', 'address', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="Street address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">City *</label>
                    <input type="text" value={formData.facilityInfo.city} onChange={(e) => handleInputChange('facilityInfo', 'city', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">State *</label>
                    <input type="text" value={formData.facilityInfo.state} onChange={(e) => handleInputChange('facilityInfo', 'state', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="State" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">ZIP Code *</label>
                    <input type="text" value={formData.facilityInfo.zipCode} onChange={(e) => handleInputChange('facilityInfo', 'zipCode', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="ZIP Code" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Facility Phone *</label>
                    <input type="tel" value={formData.facilityInfo.facilityPhone} onChange={(e) => handleInputChange('facilityInfo', 'facilityPhone', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white" placeholder="(555) 123-4567" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Document Upload</h2>
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

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Professional License Document *</label>
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Upload your professional license</p>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleFileUpload('licenseDocument', e.target.files[0])} className="hidden" id="license-upload" />
                      <label htmlFor="license-upload" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block">Choose File</label>
                      {formData.documents.licenseDocument && <p className="text-sm text-success-600 dark:text-success-400 mt-2">\u2713 {formData.documents.licenseDocument.name}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Government-Issued ID *</label>
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Upload your driver's license or passport</p>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleFileUpload('idDocument', e.target.files[0])} className="hidden" id="id-upload" />
                      <label htmlFor="id-upload" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block">Choose File</label>
                      {formData.documents.idDocument && <p className="text-sm text-success-600 dark:text-success-400 mt-2">\u2713 {formData.documents.idDocument.name}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Facility Affiliation Document *</label>
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Upload employment letter or affiliation document</p>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleFileUpload('facilityAffiliation', e.target.files[0])} className="hidden" id="affiliation-upload" />
                      <label htmlFor="affiliation-upload" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer inline-block">Choose File</label>
                      {formData.documents.facilityAffiliation && <p className="text-sm text-success-600 dark:text-success-400 mt-2">\u2713 {formData.documents.facilityAffiliation.name}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Wallet Connection</h2>
                <div className="text-center">
                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-8 mb-6">
                    <Wallet className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-300 mb-2">Connect Your Algorand Wallet</h3>
                    <p className="text-primary-700 dark:text-primary-400 mb-6">Your wallet will be used to sign vaccination records and receive verification tokens.</p>

                    {formData.walletAddress ? (
                      <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                        <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400 mx-auto mb-2" />
                        <p className="text-success-800 dark:text-success-300 font-medium mb-2">Wallet Connected Successfully!</p>
                        <p className="text-success-700 dark:text-success-400 font-mono text-sm">{formData.walletAddress}</p>
                      </div>
                    ) : (
                      <button onClick={connectWallet} disabled={isConnectingWallet} className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center mx-auto">
                        {isConnectingWallet ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" />Connecting...</>) : (<><Wallet className="h-5 w-5 mr-2" />Connect Pera Wallet</>)}
                      </button>
                    )}
                  </div>

                  <div className="text-left bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                    <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Instructions:</h4>
                    <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
                      <li>\u2022 Make sure you have the Pera Wallet app installed on your mobile device</li>
                      <li>\u2022 Click the "Connect Pera Wallet" button</li>
                      <li>\u2022 Approve the connection in your Pera Wallet app</li>
                      <li>\u2022 Your wallet address will be securely stored for verification purposes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <button onClick={prevStep} disabled={currentStep === 1} className="bg-neutral-200 hover:bg-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400 text-neutral-700 font-medium py-2 px-4 rounded-md transition-colors">Previous</button>
            {currentStep < 5 ? (
              <button onClick={nextStep} className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors">Next Step</button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting || !formData.walletAddress} className="bg-success-600 hover:bg-success-700 disabled:bg-success-400 text-white font-medium py-2 px-6 rounded-md flex items-center transition-colors">
                {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>) : (<><CheckCircle className="h-4 w-4 mr-2" />Submit Registration</>)}
              </button>
            )}
          </div>
        </div>

        <div className="text-center text-primary-100 dark:text-neutral-400 text-sm">
          <p>Already have an account? <Link to="/health-worker/login" className="text-white hover:underline font-medium">Sign in here</Link></p>
        </div>
      </div>

      <NotificationToast type={notification.type} message={notification.message} isVisible={notification.isVisible} onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
};

export default HealthWorkerRegistration;
