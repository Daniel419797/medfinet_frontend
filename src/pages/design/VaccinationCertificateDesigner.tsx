import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Share,
  Edit,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Shield,
  User,
  Calendar,
  MapPin,
} from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { medfinetDesignApi } from '../../services/medfinetDesignApi';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';
import { medfinetClinicalApi } from '../../services/medfinetClinicalApi';

interface ChildData {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
}

interface VaccinationData {
  id: string;
  vaccineName: string;
  date: string;
  location: string;
  provider: string;
  dose: number;
  blockchainHash?: string;
}

const VaccinationCertificateDesigner = () => {
  const { childId, vaccinationId } = useParams();
  const navigate = useNavigate();
  const { organizationId } = useContext(UserContext);
  const canvaContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [vaccinationData, setVaccinationData] = useState<VaccinationData | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('template_001');
  const [isCanvaSDKLoaded, setIsCanvaSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
    script.async = true;
    script.onload = () => {
      setIsCanvaSDKLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  const loadData = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const targetChildId = childId || '';

      const childResult = await medfinetIdentityApi.getChild(organizationId, targetChildId);
      setChildData({
        id: childResult.id,
        name: `${childResult.firstName} ${childResult.lastName}`,
        birthDate: childResult.dateOfBirth,
        gender: childResult.sex,
      });

      if (vaccinationId) {
        const timeline = await medfinetClinicalApi.getClinicalTimeline(organizationId, targetChildId);
        const imm = timeline.immunizations.find((i) => i.id === vaccinationId);
        if (imm) {
          setVaccinationData({
            id: imm.id,
            vaccineName: imm.vaccineCode,
            date: imm.administeredAt,
            location: '',
            provider: '',
            dose: imm.doseNumber,
          });
        }
      }

      setDesignId(`design_${targetChildId}_${vaccinationId || 'new'}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to load certificate data'
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, childId, vaccinationId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (isCanvaSDKLoaded && designId && canvaContainerRef.current) {
      try {
        console.log('Initializing Canva preview with design ID:', designId);
      } catch (err) {
        console.error('Error initializing Canva preview:', err);
      }
    }
  }, [isCanvaSDKLoaded, designId]);

  const handleEditDesign = () => {
    setIsEditing(true);
    window.open('https://www.canva.com/design', '_blank');
  };

  const handleSaveDesign = async () => {
    if (!organizationId || !designId) return;
    setIsSaving(true);
    try {
      await medfinetDesignApi.saveCertificate(organizationId, {
        name: `Certificate for ${childData?.name || 'Child'}`,
        templateId: selectedTemplate,
        category: 'vaccination',
        childId: childData?.id,
        vaccinationId,
        content: {
          childName: childData?.name,
          vaccineName: vaccinationData?.vaccineName,
          dose: vaccinationData?.dose,
          date: vaccinationData?.date,
        },
      });
      alert('Design saved successfully!');
    } catch (reason) {
      console.error('Error saving design:', reason);
      alert('Failed to save design. Please try again.');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleExportDesign = async (format: 'pdf' | 'png' | 'jpg') => {
    if (!organizationId || !designId) return;
    setIsExporting(true);
    try {
      const result = await medfinetDesignApi.exportCertificate(organizationId, designId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
      alert(`Design exported as ${format.toUpperCase()} successfully!`);
    } catch (reason) {
      console.error(`Error exporting design as ${format}:`, reason);
      alert(`Failed to export design as ${format}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareDesign = () => {
    alert('Sharing functionality would be implemented here.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-300">Loading certificate designer...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-error-600 dark:text-error-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              Vaccination Certificate Designer
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Create and customize a vaccination certificate for {childData?.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Design Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Certificate Preview</h2>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveDesign}
                      disabled={isSaving}
                      className="flex items-center px-3 py-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm rounded-md transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleEditDesign}
                      className="flex items-center px-3 py-1 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm rounded-md transition-colors"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div
                  ref={canvaContainerRef}
                  className="bg-white border border-neutral-200 dark:border-neutral-700 rounded-lg aspect-[1.414/1] w-full overflow-hidden"
                >
                  <div className="h-full flex flex-col items-center justify-center p-8">
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center mb-4">
                        <Shield className="h-12 w-12 text-primary-600 dark:text-primary-400 mr-3" />
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">MedFiNet</h2>
                      </div>
                      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        Vaccination Certificate
                      </h1>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        This certifies that
                      </p>
                    </div>

                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        {childData?.name}
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        Born on {new Date(childData?.birthDate || '').toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-center mb-8">
                      <p className="text-neutral-600 dark:text-neutral-300 mb-2">
                        Has received the following vaccination:
                      </p>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                        {vaccinationData?.vaccineName}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        Dose {vaccinationData?.dose} · {new Date(vaccinationData?.date || '').toLocaleDateString()}
                      </p>
                    </div>

                    {vaccinationData?.location && (
                      <div className="text-center">
                        <p className="text-neutral-600 dark:text-neutral-300 mb-2">
                          Administered by:
                        </p>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                          {vaccinationData.provider}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                          {vaccinationData.location}
                        </p>
                      </div>
                    )}

                    {vaccinationData?.blockchainHash && (
                      <div className="mt-8 text-center">
                        <div className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-full text-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verified on Blockchain
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                          {vaccinationData.blockchainHash}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Design Options */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Certificate Options</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Template Selection */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Certificate Template
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'template_001', name: 'Standard', thumbnail: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=150' },
                      { id: 'template_002', name: 'Modern', thumbnail: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?auto=compress&cs=tinysrgb&w=150' },
                      { id: 'template_003', name: 'Classic', thumbnail: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=150' },
                      { id: 'template_004', name: 'Colorful', thumbnail: 'https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg?auto=compress&cs=tinysrgb&w=150' }
                    ].map(template => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedTemplate === template.id
                            ? 'border-primary-500 shadow-md'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        <div className="h-20 overflow-hidden">
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            {template.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificate Information */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Certificate Information
                  </h3>
                  <div className="space-y-3 bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Child</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {childData?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Vaccine</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {vaccinationData?.vaccineName} (Dose {vaccinationData?.dose})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Date</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {new Date(vaccinationData?.date || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Provider</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {vaccinationData?.provider}{vaccinationData?.location ? `, ${vaccinationData.location}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Customization
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Color Theme
                      </label>
                      <div className="flex space-x-2">
                        {['#0066e1', '#00dfaf', '#ff7300', '#2ee165', '#ffc300'].map(color => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                              color === '#0066e1' ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Font Style
                      </label>
                      <select className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white">
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="elegant">Elegant</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Include Logo
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="include-logo"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="include-logo" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                          Show MedFiNet logo
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Include Blockchain Verification
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="include-verification"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="include-verification" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                          Show blockchain verification
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Export Options
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleExportDesign('pdf')}
                      disabled={isExporting}
                      className="flex items-center justify-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Export PDF
                    </button>
                    <button
                      onClick={() => handleExportDesign('png')}
                      disabled={isExporting}
                      className="flex items-center justify-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export PNG
                    </button>
                  </div>
                  <button
                    onClick={handleShareDesign}
                    className="mt-3 w-full flex items-center justify-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationCertificateDesigner;
