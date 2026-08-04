import { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Phone,
  Mail,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  Eye,
  UserPlus
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'health_center' | 'pharmacy';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  healthWorkers: number;
  patientsServed: number;
  vaccinationsThisMonth: number;
  manager: string;
  operatingHours: string;
  services: string[];
  lastInspection: string;
  certificationExpiry: string;
}

interface StaffAssignment {
  id: string;
  facilityId: string;
  facilityName: string;
  workerId: string;
  workerName: string;
  role: 'doctor' | 'nurse' | 'administrator' | 'technician';
  department: string;
  assignedDate: string;
  status: 'active' | 'inactive';
}

const FacilityManagement = () => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'assignments' | 'audit'>('facilities');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'assign'>('add');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const [facilities] = useState<Facility[]>([
    {
      id: 'fac_001',
      name: 'City Pediatrics Medical Center',
      type: 'clinic',
      address: '123 Healthcare Drive',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '(212) 555-1234',
      email: 'info@citypediatrics.com',
      status: 'active',
      healthWorkers: 12,
      patientsServed: 856,
      vaccinationsThisMonth: 147,
      manager: 'Dr. Sarah Johnson',
      operatingHours: '8:00 AM - 6:00 PM',
      services: ['Pediatric Care', 'Vaccinations', 'Emergency Care'],
      lastInspection: '2024-01-15',
      certificationExpiry: '2025-01-15'
    },
    {
      id: 'fac_002',
      name: 'Metro Medical Center',
      type: 'hospital',
      address: '456 Medical Plaza',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      phone: '(212) 555-5678',
      email: 'contact@metromedical.com',
      status: 'active',
      healthWorkers: 45,
      patientsServed: 2341,
      vaccinationsThisMonth: 289,
      manager: 'Dr. Michael Chen',
      operatingHours: '24/7',
      services: ['Emergency Care', 'Surgery', 'Pediatrics', 'Vaccinations'],
      lastInspection: '2024-01-10',
      certificationExpiry: '2025-06-30'
    },
    {
      id: 'fac_003',
      name: 'Community Health Center',
      type: 'health_center',
      address: '789 Community Way',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      phone: '(718) 555-9012',
      email: 'info@communityhc.org',
      status: 'maintenance',
      healthWorkers: 8,
      patientsServed: 423,
      vaccinationsThisMonth: 67,
      manager: 'Nurse Jennifer Wilson',
      operatingHours: '9:00 AM - 5:00 PM',
      services: ['Primary Care', 'Vaccinations', 'Health Screenings'],
      lastInspection: '2023-12-20',
      certificationExpiry: '2024-12-20'
    }
  ]);

  const [assignments] = useState<StaffAssignment[]>([
    {
      id: 'assign_001',
      facilityId: 'fac_001',
      facilityName: 'City Pediatrics Medical Center',
      workerId: 'hw_001',
      workerName: 'Dr. Sarah Johnson',
      role: 'doctor',
      department: 'Pediatrics',
      assignedDate: '2024-01-15',
      status: 'active'
    },
    {
      id: 'assign_002',
      facilityId: 'fac_001',
      facilityName: 'City Pediatrics Medical Center',
      workerId: 'hw_002',
      workerName: 'Nurse Maria Rodriguez',
      role: 'nurse',
      department: 'Vaccination Unit',
      assignedDate: '2024-01-20',
      status: 'active'
    },
    {
      id: 'assign_003',
      facilityId: 'fac_002',
      facilityName: 'Metro Medical Center',
      workerId: 'hw_003',
      workerName: 'Dr. Michael Chen',
      role: 'doctor',
      department: 'Emergency',
      assignedDate: '2023-12-10',
      status: 'active'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'inactive':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      case 'maintenance':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Building className="h-4 w-4 text-primary-600" />;
      case 'clinic':
        return <Activity className="h-4 w-4 text-secondary-600" />;
      case 'health_center':
        return <Users className="h-4 w-4 text-accent-600" />;
      case 'pharmacy':
        return <Plus className="h-4 w-4 text-success-600" />;
      default:
        return <Building className="h-4 w-4 text-neutral-600" />;
    }
  };

  const openModal = (type: 'add' | 'edit' | 'view' | 'assign', facility?: Facility) => {
    setModalType(type);
    setSelectedFacility(facility || null);
    setIsModalOpen(true);
  };

  const renderFacilities = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="health_center">Health Center</option>
            <option value="pharmacy">Pharmacy</option>
          </select>
        </div>

        <button
          onClick={() => openModal('add')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </button>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <div key={facility.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg mr-3">
                  {getTypeIcon(facility.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {facility.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                    {facility.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(facility.status)}`}>
                {facility.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                <MapPin className="h-4 w-4 mr-2" />
                {facility.address}, {facility.city}, {facility.state}
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                <Phone className="h-4 w-4 mr-2" />
                {facility.phone}
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                <Clock className="h-4 w-4 mr-2" />
                {facility.operatingHours}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{facility.healthWorkers}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Staff</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{facility.patientsServed}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Patients</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{facility.vaccinationsThisMonth}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Vaccines</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openModal('view', facility)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openModal('edit', facility)}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300"
                  title="Edit facility"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openModal('assign', facility)}
                  className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300"
                  title="Assign staff"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Manager: {facility.manager}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Health Worker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Facility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Assigned Date
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
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {assignment.workerName}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                        {assignment.role}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                  {assignment.facilityName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900 dark:text-white capitalize">
                    {assignment.role}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {assignment.department}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {new Date(assignment.assignedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300">
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

  const renderAuditTrail = () => (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Recent Facility Activities
      </h3>
      <div className="space-y-4">
        {[
          {
            id: '1',
            action: 'Facility Added',
            details: 'New clinic "Downtown Health Center" added to the system',
            user: 'Admin User',
            timestamp: '2 hours ago',
            blockchainHash: '0xabc123...def456'
          },
          {
            id: '2',
            action: 'Staff Assignment',
            details: 'Dr. Sarah Johnson assigned to City Pediatrics - Pediatrics Department',
            user: 'Admin User',
            timestamp: '4 hours ago',
            blockchainHash: '0xdef456...ghi789'
          },
          {
            id: '3',
            action: 'Facility Updated',
            details: 'Operating hours updated for Metro Medical Center',
            user: 'Facility Manager',
            timestamp: '1 day ago',
            blockchainHash: '0xghi789...jkl012'
          }
        ].map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {activity.action}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                {activity.details}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  By {activity.user} • {activity.timestamp}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  {activity.blockchainHash}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Facility Management
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Manage healthcare facilities, staff assignments, and operational oversight
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'facilities', label: 'Facilities', icon: Building },
            { id: 'assignments', label: 'Staff Assignments', icon: Users },
            { id: 'audit', label: 'Audit Trail', icon: Activity }
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

      {/* Content */}
      {activeTab === 'facilities' && renderFacilities()}
      {activeTab === 'assignments' && renderAssignments()}
      {activeTab === 'audit' && renderAuditTrail()}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full max-w-2xl mx-auto z-10">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {modalType === 'add' ? 'Add New Facility' : 
                   modalType === 'edit' ? 'Edit Facility' : 
                   modalType === 'assign' ? 'Assign Staff' : 'Facility Details'}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 dark:text-neutral-300">
                  Modal content for {modalType} facility would go here...
                </p>
                {selectedFacility && (
                  <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Selected Facility: {selectedFacility.name}
                    </p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  {modalType === 'add' ? 'Create' : modalType === 'edit' ? 'Save' : modalType === 'assign' ? 'Assign' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityManagement;