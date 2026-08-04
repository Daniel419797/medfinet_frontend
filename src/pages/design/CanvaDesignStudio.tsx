import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Palette,
  Image,
  FileText,
  Download,
  Share,
  Plus,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle
} from 'lucide-react';
import { medfinetDesignApi } from '../../services/medfinetDesignApi';
import UserContext from '../../contexts/UserContext';

interface DesignTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  description: string;
}

interface UserDesign {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: string;
  lastModified: string;
  category: string;
}

const CanvaDesignStudio = () => {
  const { organizationId } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<'templates' | 'myDesigns'>('templates');
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<UserDesign | null>(null);
  const [isCreatingDesign, setIsCreatingDesign] = useState<boolean>(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isCanvaSDKLoaded, setIsCanvaSDKLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadCanvaSDK = () => {
      const script = document.createElement('script');
      script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
      script.async = true;
      script.onload = () => {
        setIsCanvaSDKLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadCanvaSDK();
  }, []);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [templatesData, designsData, categoriesData] = await Promise.all([
        medfinetDesignApi.listTemplates(organizationId),
        medfinetDesignApi.listUserDesigns(organizationId),
        medfinetDesignApi.listCategories(organizationId),
      ]);
      setTemplates(templatesData as DesignTemplate[]);
      setUserDesigns(designsData as UserDesign[]);
      setCategories([
        { id: 'all', name: 'All Templates' },
        ...categoriesData.map((cat: string) => ({ id: cat, name: cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) })),
      ]);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to load design studio data',
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredDesigns = userDesigns.filter(design => {
    return design.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateDesign = async (template: DesignTemplate) => {
    if (!organizationId) return;
    setSelectedTemplate(template);
    setIsCreatingDesign(true);
    try {
      await medfinetDesignApi.saveDesign(organizationId, {
        name: `New ${template.name}`,
        templateId: template.id,
        category: template.category,
        content: {},
      });
      await load();
      setActiveTab('myDesigns');
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to create design',
      );
    } finally {
      setIsCreatingDesign(false);
    }
  };

  const handleEditDesign = (design: UserDesign) => {
    setSelectedDesign(design);
    window.open('https://www.canva.com/design', '_blank');
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!organizationId) return;
    if (!confirm('Are you sure you want to delete this design?')) return;
    try {
      await medfinetDesignApi.deleteDesign(organizationId, designId);
      setUserDesigns(prev => prev.filter(design => design.id !== designId));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to delete design',
      );
    }
  };

  const handleExportDesign = (design: UserDesign, format: 'pdf' | 'png' | 'jpg') => {
    alert(`Exporting design as ${format.toUpperCase()}...`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Design Studio
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Create and customize healthcare documents, certificates, and educational materials
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 mb-6">
          <div className="flex border-b border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
                activeTab === 'templates'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('myDesigns')}
              className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
                activeTab === 'myDesigns'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              My Designs
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
            <p className="text-error-800 text-sm">{error}</p>
            <button onClick={load} className="mt-2 text-sm font-medium text-error-600 hover:text-error-800">
              Retry
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder={activeTab === 'templates' ? "Search templates..." : "Search my designs..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            </div>

            {activeTab === 'templates' && (
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
            <span className="ml-2 text-neutral-600 dark:text-neutral-300">Loading...</span>
          </div>
        ) : (
          <>
            {activeTab === 'templates' ? (
              <>
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="h-40 overflow-hidden">
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                              {template.name}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 capitalize">
                              {template.category.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                            {template.description}
                          </p>
                          <button
                            onClick={() => handleCreateDesign(template)}
                            disabled={isCreatingDesign || !isCanvaSDKLoaded}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                          >
                            {isCreatingDesign && selectedTemplate?.id === template.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Palette className="h-4 w-4 mr-2" />
                                Use Template
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                    <Palette className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      No templates found
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                      {searchTerm ? "Try adjusting your search or filters" : "No templates available for this category"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {filteredDesigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDesigns.map(design => (
                      <div
                        key={design.id}
                        className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="h-40 overflow-hidden relative group">
                          <img
                            src={design.thumbnail}
                            alt={design.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditDesign(design)}
                                className="p-2 bg-white rounded-full hover:bg-primary-100 transition-colors"
                                title="Edit design"
                              >
                                <Edit className="h-5 w-5 text-primary-600" />
                              </button>
                              <button
                                onClick={() => handleExportDesign(design, 'pdf')}
                                className="p-2 bg-white rounded-full hover:bg-primary-100 transition-colors"
                                title="Export as PDF"
                              >
                                <Download className="h-5 w-5 text-primary-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteDesign(design.id)}
                                className="p-2 bg-white rounded-full hover:bg-error-100 transition-colors"
                                title="Delete design"
                              >
                                <Trash2 className="h-5 w-5 text-error-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                              {design.name}
                            </h3>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(design.lastModified).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 capitalize">
                              {design.category.replace('-', ' ')}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditDesign(design)}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                title="Edit design"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleExportDesign(design, 'pdf')}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                title="Export as PDF"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                    <Image className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      No designs found
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                      {searchTerm ? "Try adjusting your search" : "You haven't created any designs yet"}
                    </p>
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Design
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Canva SDK Integration Info */}
        <div className="mt-8 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            About Canva Integration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mb-3">
                <Palette className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Professional Templates</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Access professionally designed healthcare templates for certificates, educational materials, and more.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full mb-3">
                <Edit className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Easy Customization</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Customize designs with your own content, colors, and branding without design skills.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-accent-100 dark:bg-accent-900/20 p-3 rounded-full mb-3">
                <Share className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Export & Share</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Export your designs as PDF, PNG, or JPG to share with patients or colleagues.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-primary-800 dark:text-primary-300 mb-1">
                  Powered by Canva
                </h3>
                <p className="text-sm text-primary-700 dark:text-primary-400">
                  This feature integrates with Canva's powerful design platform. You can create, edit, and export professional-quality healthcare documents directly from MedFiNet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaDesignStudio;
