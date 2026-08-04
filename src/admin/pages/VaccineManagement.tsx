import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Package,
  Loader2,
  X,
  Save,
  FileText,
  Stethoscope
} from 'lucide-react';

interface Vaccine {
  id: string;
  name: string;
  manufacturer: string;
  description: string;
  ageGroup: string;
  dosesRequired: number;
  intervalBetweenDoses: string;
  sideEffects: string[];
  contraindications: string[];
  storageRequirements: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

interface VaccineBatch {
  id: string;
  vaccineId: string;
  vaccineName: string;
  batchNumber: string;
  manufacturer: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  quantityUsed: number;
  quantityRemaining: number;
  lotNumber: string;
  status: 'available' | 'expired' | 'recalled' | 'depleted';
  storageLocation: string;
  receivedDate: string;
}

const VaccineManagement = () => {
  const [activeTab, setActiveTab] = useState<'vaccines' | 'batches'>('vaccines');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [vaccineForm, setVaccineForm] = useState({
    name: '',
    manufacturer: '',
    description: '',
    ageGroup: '',
    dosesRequired: 1,
    intervalBetweenDoses: '',
    sideEffects: [] as string[],
    contraindications: [] as string[],
    storageRequirements: ''
  });

  const [batchForm, setBatchForm] = useState({
    vaccineId: '',
    batchNumber: '',
    manufacturer: '',
    manufactureDate: '',
    expiryDate: '',
    quantity: 0,
    lotNumber: '',
    storageLocation: ''
  });

  // Mock data
  const [vaccines, setVaccines] = useState<Vaccine[]>([
    {
      id: 'v_001',
      name: 'DTaP',
      manufacturer: 'Sanofi Pasteur',
      description: 'Diphtheria, Tetanus, and Pertussis vaccine',
      ageGroup: '2 months - 6 years',
      dosesRequired: 5,
      intervalBetweenDoses: '2 months between first 3 doses',
      sideEffects: ['Mild fever', 'Soreness at injection site', 'Fussiness'],
      contraindications: ['Severe allergic reaction to previous dose', 'Encephalopathy'],
      storageRequirements: 'Store at 2-8°C (36-46°F)',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'v_002',
      name: 'MMR',
      manufacturer: 'Merck',
      description: 'Measles, Mumps, and Rubella vaccine',
      ageGroup: '12 months+',
      dosesRequired: 2,
      intervalBetweenDoses: '4 weeks minimum between doses',
      sideEffects: ['Mild rash', 'Fever', 'Swollen glands'],
      contraindications: ['Pregnancy', 'Immunocompromised patients', 'Severe illness'],
      storageRequirements: 'Store frozen at -50°C to -15°C',
      status: 'active',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20'
    }
  ]);

  const [batches, setBatches] = useState<VaccineBatch[]>([
    {
      id: 'b_001',
      vaccineId: 'v_001',
      vaccineName: 'DTaP',
      batchNumber: 'DTaP-2024-001',
      manufacturer: 'Sanofi Pasteur',
      manufactureDate: '2024-01-01',
      expiryDate: '2025-01-01',
      quantity: 100,
      quantityUsed: 25,
      quantityRemaining: 75,
      lotNumber: 'SP-DTaP-240101',
      status: 'available',
      storageLocation: 'Refrigerator A-1',
      receivedDate: '2024-01-15'
    },
    {
      id: 'b_002',
      vaccineId: 'v_002',
      vaccineName: 'MMR',
      batchNumber: 'MMR-2024-002',
      manufacturer: 'Merck',
      manufactureDate: '2023-12-15',
      expiryDate: '2024-12-15',
      quantity: 50,
      quantityUsed: 12,
      quantityRemaining: 38,
      lotNumber: 'MK-MMR-231215',
      status: 'available',
      storageLocation: 'Freezer B-2',
      receivedDate: '2024-01-10'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'inactive':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      case 'discontinued':
      case 'expired':
      case 'recalled':
        return 'text-error-600 bg-error-50 border-error-200';
      case 'depleted':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const openModal = (type: 'add' | 'edit' | 'view', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    
    if (type === 'edit' && item) {
      if (activeTab === 'vaccines') {
        setVaccineForm({
          name: item.name,
          manufacturer: item.manufacturer,
          description: item.description,
          ageGroup: item.ageGroup,
          dosesRequired: item.dosesRequired,
          intervalBetweenDoses: item.intervalBetweenDoses,
          sideEffects: item.sideEffects,
          contraindications: item.contraindications,
          storageRequirements: item.storageRequirements
        });
      } else {
        setBatchForm({
          vaccineId: item.vaccineId,
          batchNumber: item.batchNumber,
          manufacturer: item.manufacturer,
          manufactureDate: item.manufactureDate,
          expiryDate: item.expiryDate,
          quantity: item.quantity,
          lotNumber: item.lotNumber,
          storageLocation: item.storageLocation
        });
      }
    } else {
      // Reset forms for add mode
      setVaccineForm({
        name: '',
        manufacturer: '',
        description: '',
        ageGroup: '',
        dosesRequired: 1,
        intervalBetweenDoses: '',
        sideEffects: [],
        contraindications: [],
        storageRequirements: ''
      });
      setBatchForm({
        vaccineId: '',
        batchNumber: '',
        manufacturer: '',
        manufactureDate: '',
        expiryDate: '',
        quantity: 0,
        lotNumber: '',
        storageLocation: ''
      });
    }
    
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'vaccines') {
        const newVaccine: Vaccine = {
          id: modalType === 'add' ? `v_${Date.now()}` : selectedItem.id,
          ...vaccineForm,
          status: 'active',
          createdAt: modalType === 'add' ? new Date().toISOString() : selectedItem.createdAt,
          updatedAt: new Date().toISOString()
        };
        
        if (modalType === 'add') {
          setVaccines(prev => [...prev, newVaccine]);
        } else {
          setVaccines(prev => prev.map(v => v.id === selectedItem.id ? newVaccine : v));
        }
      } else {
        const selectedVaccine = vaccines.find(v => v.id === batchForm.vaccineId);
        const newBatch: VaccineBatch = {
          id: modalType === 'add' ? `b_${Date.now()}` : selectedItem.id,
          ...batchForm,
          vaccineName: selectedVaccine?.name || '',
          quantityUsed: modalType === 'add' ? 0 : selectedItem.quantityUsed,
          quantityRemaining: modalType === 'add' ? batchForm.quantity : batchForm.quantity - selectedItem.quantityUsed,
          status: 'available',
          receivedDate: modalType === 'add' ? new Date().toISOString().split('T')[0] : selectedItem.receivedDate
        };
        
        if (modalType === 'add') {
          setBatches(prev => [...prev, newBatch]);
        } else {
          setBatches(prev => prev.map(b => b.id === selectedItem.id ? newBatch : b));
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'vaccines') {
        setVaccines(prev => prev.filter(v => v.id !== id));
      } else {
        setBatches(prev => prev.filter(b => b.id !== id));
      }
    }
  };

  const addSideEffectOrContraindication = (type: 'sideEffects' | 'contraindications') => {
    const value = prompt(`Enter ${type === 'sideEffects' ? 'side effect' : 'contraindication'}:`);
    if (value) {
      setVaccineForm(prev => ({
        ...prev,
        [type]: [...prev[type], value]
      }));
    }
  };

  const removeSideEffectOrContraindication = (type: 'sideEffects' | 'contraindications', index: number) => {
    setVaccineForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const renderVaccines = () => (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Vaccine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Manufacturer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Age Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Doses Required
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {vaccines.map((vaccine) => (
              <tr key={vaccine.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {vaccine.name}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {vaccine.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                  {vaccine.manufacturer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                  {vaccine.ageGroup}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                  {vaccine.dosesRequired}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(vaccine.status)}`}>
                    {vaccine.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => openModal('view', vaccine)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal('edit', vaccine)}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vaccine.id)}
                      className="text-error-600 dark:text-error-400 hover:text-error-900 dark:hover:text-error-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBatches = () => (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Batch Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Vaccine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Storage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {batch.batchNumber}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Lot: {batch.lotNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900 dark:text-white">
                    {batch.vaccineName}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {batch.manufacturer}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900 dark:text-white">
                    Mfg: {new Date(batch.manufactureDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900 dark:text-white">
                    {batch.quantityRemaining} / {batch.quantity}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {batch.quantityUsed} used
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                  {batch.storageLocation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => openModal('view', batch)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal('edit', batch)}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="text-error-600 dark:text-error-400 hover:text-error-900 dark:hover:text-error-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Vaccine Management
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Manage vaccine types, batches, and inventory tracking
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'vaccines', label: 'Vaccine Types', icon: Shield },
            { id: 'batches', label: 'Vaccine Batches', icon: Package }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => openModal('add')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === 'vaccines' ? 'Vaccine' : 'Batch'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'vaccines' && renderVaccines()}
      {activeTab === 'batches' && renderBatches()}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-4xl mx-auto z-10">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {modalType === 'add' ? 'Add' : modalType === 'edit' ? 'Edit' : 'View'} {
                    activeTab === 'vaccines' ? 'Vaccine' : 'Vaccine Batch'
                  }
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Vaccine Form */}
                {activeTab === 'vaccines' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Vaccine Name *
                        </label>
                        <input
                          type="text"
                          value={vaccineForm.name}
                          onChange={(e) => setVaccineForm({...vaccineForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., DTaP, MMR, Hepatitis B"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Manufacturer *
                        </label>
                        <input
                          type="text"
                          value={vaccineForm.manufacturer}
                          onChange={(e) => setVaccineForm({...vaccineForm, manufacturer: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., Sanofi Pasteur, Merck"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={vaccineForm.description}
                          onChange={(e) => setVaccineForm({...vaccineForm, description: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          rows={3}
                          placeholder="Brief description of what this vaccine protects against"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Age Group *
                        </label>
                        <input
                          type="text"
                          value={vaccineForm.ageGroup}
                          onChange={(e) => setVaccineForm({...vaccineForm, ageGroup: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., 2 months - 6 years"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Doses Required *
                        </label>
                        <input
                          type="number"
                          value={vaccineForm.dosesRequired}
                          onChange={(e) => setVaccineForm({...vaccineForm, dosesRequired: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          min="1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Interval Between Doses
                        </label>
                        <input
                          type="text"
                          value={vaccineForm.intervalBetweenDoses}
                          onChange={(e) => setVaccineForm({...vaccineForm, intervalBetweenDoses: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., 2 months between first 3 doses"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Storage Requirements *
                        </label>
                        <input
                          type="text"
                          value={vaccineForm.storageRequirements}
                          onChange={(e) => setVaccineForm({...vaccineForm, storageRequirements: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., Store at 2-8°C (36-46°F)"
                        />
                      </div>
                    </div>
                    
                    {/* Side Effects */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Common Side Effects
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {vaccineForm.sideEffects.map((effect, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                            {effect}
                            {modalType !== 'view' && (
                              <button
                                onClick={() => removeSideEffectOrContraindication('sideEffects', index)}
                                className="ml-1 text-warning-600 hover:text-warning-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        {modalType !== 'view' && (
                          <button
                            onClick={() => addSideEffectOrContraindication('sideEffects')}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                          >
                            + Add Side Effect
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Contraindications */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Contraindications
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {vaccineForm.contraindications.map((contraindication, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
                            {contraindication}
                            {modalType !== 'view' && (
                              <button
                                onClick={() => removeSideEffectOrContraindication('contraindications', index)}
                                className="ml-1 text-error-600 hover:text-error-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        {modalType !== 'view' && (
                          <button
                            onClick={() => addSideEffectOrContraindication('contraindications')}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                          >
                            + Add Contraindication
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Batch Form */}
                {activeTab === 'batches' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Vaccine *
                        </label>
                        <select
                          value={batchForm.vaccineId}
                          onChange={(e) => setBatchForm({...batchForm, vaccineId: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                        >
                          <option value="">Select Vaccine</option>
                          {vaccines.map(vaccine => (
                            <option key={vaccine.id} value={vaccine.id}>
                              {vaccine.name} - {vaccine.manufacturer}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Batch Number *
                        </label>
                        <input
                          type="text"
                          value={batchForm.batchNumber}
                          onChange={(e) => setBatchForm({...batchForm, batchNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., DTaP-2024-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Lot Number *
                        </label>
                        <input
                          type="text"
                          value={batchForm.lotNumber}
                          onChange={(e) => setBatchForm({...batchForm, lotNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., SP-DTaP-240101"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={batchForm.quantity}
                          onChange={(e) => setBatchForm({...batchForm, quantity: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Manufacture Date *
                        </label>
                        <input
                          type="date"
                          value={batchForm.manufactureDate}
                          onChange={(e) => setBatchForm({...batchForm, manufactureDate: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="date"
                          value={batchForm.expiryDate}
                          onChange={(e) => setBatchForm({...batchForm, expiryDate: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Storage Location *
                        </label>
                        <input
                          type="text"
                          value={batchForm.storageLocation}
                          onChange={(e) => setBatchForm({...batchForm, storageLocation: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                          disabled={modalType === 'view'}
                          placeholder="e.g., Refrigerator A-1, Freezer B-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {modalType !== 'view' && (
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {modalType === 'add' ? 'Create' : 'Save'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineManagement;