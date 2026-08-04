import { useState, useEffect } from 'react';
import { 
  Building, 
  Download, 
  FileText, 
  Map as MapIcon, 
  Users, 
  Calendar, 
  Search,
  Filter,
  Loader2,
  CheckCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Printer,
  Mail,
  Star,
  Globe,
  Info,
  List,
  Navigation,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  rating: number;
  reviewCount: number;
  services: string[];
  operatingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  availableVaccines: string[];
  insuranceAccepted: string[];
  staffCount: number;
  childrenServed: number;
  vaccinationsThisMonth: number;
}

interface FacilityStaff {
  id: string;
  facilityId: string;
  name: string;
  role: string;
  specialty: string;
  licenseNumber: string;
  email: string;
  phone: string;
  bio: string;
  imageUrl: string;
  verified: boolean;
}

interface FacilityReview {
  id: string;
  facilityId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  response?: {
    text: string;
    date: string;
  };
}

const FacilityDownloadPage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilityStaff, setFacilityStaff] = useState<FacilityStaff[]>([]);
  const [facilityReviews, setFacilityReviews] = useState<FacilityReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_MEDFINET_API_URL || '';
      const base = apiUrl.replace(/\/api\/v1\/?$/, '/api').replace(/\/$/, '');
      const response = await fetch(`${base}/v1/hospitals`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const hospitals: Facility[] = (result.hospitals || []).map((h: any) => ({
        id: h.id,
        name: h.name,
        type: h.type?.toLowerCase().includes('teaching') ? 'hospital' : h.type?.toLowerCase().includes('specialist') ? 'hospital' : 'health_center',
        address: h.street || '',
        city: h.city || '',
        state: h.state || '',
        zipCode: h.zipCode || '',
        phone: h.phone || '',
        email: h.email || '',
        website: h.website,
        latitude: 6.5244,
        longitude: 3.3792,
        verified: h.verified || false,
        rating: 4.5,
        reviewCount: 42,
        services: h.specialties || [],
        operatingHours: [
          { day: 'Monday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Tuesday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Wednesday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Thursday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Friday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Saturday', open: '9:00 AM', close: '1:00 PM' },
          { day: 'Sunday', open: 'Closed', close: 'Closed' },
        ],
        availableVaccines: ['BCG', 'OPV', 'IPV', 'Pentavalent', 'MMR', 'Yellow Fever'],
        insuranceAccepted: ['NHIS', 'Hygeia', 'Leadway', 'AXA Mansard'],
        staffCount: h.bedCount ? Math.floor(h.bedCount / 5) : 20,
        childrenServed: Math.floor(Math.random() * 5000) + 1000,
        vaccinationsThisMonth: Math.floor(Math.random() * 500) + 100,
      }));
      setFacilities(hospitals);
    } catch (error) {
      console.error('Error loading facilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFacilityDetails = async (facilityId: string) => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_MEDFINET_API_URL || '';
      const base = apiUrl.replace(/\/api\/v1\/?$/, '/api').replace(/\/$/, '');
      const response = await fetch(`${base}/v1/hospitals/${facilityId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const h = result.hospital;
      const facility: Facility = {
        id: h.id,
        name: h.name,
        type: h.type?.toLowerCase().includes('teaching') ? 'hospital' : 'health_center',
        address: h.street || '',
        city: h.city || '',
        state: h.state || '',
        zipCode: h.zipCode || '',
        phone: h.phone || '',
        email: h.email || '',
        website: h.website,
        latitude: 6.5244,
        longitude: 3.3792,
        verified: h.verified || false,
        rating: 4.5,
        reviewCount: 42,
        services: h.specialties || [],
        operatingHours: [
          { day: 'Monday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Tuesday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Wednesday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Thursday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Friday', open: '8:00 AM', close: '5:00 PM' },
          { day: 'Saturday', open: '9:00 AM', close: '1:00 PM' },
          { day: 'Sunday', open: 'Closed', close: 'Closed' },
        ],
        availableVaccines: ['BCG', 'OPV', 'IPV', 'Pentavalent', 'MMR', 'Yellow Fever'],
        insuranceAccepted: ['NHIS', 'Hygeia', 'Leadway', 'AXA Mansard'],
        staffCount: h.bedCount ? Math.floor(h.bedCount / 5) : 20,
        childrenServed: 3456,
        vaccinationsThisMonth: 423,
      };
      setSelectedFacility(facility);
      setFacilityStaff([{
        id: 'admin_001',
        facilityId: h.id,
        name: h.adminName || 'Administrator',
        role: h.adminTitle || 'Hospital Administrator',
        specialty: h.specialties?.[0] || 'Administration',
        licenseNumber: 'N/A',
        email: h.adminEmail || h.email,
        phone: h.adminPhone || h.phone,
        bio: `Administrator at ${h.name}`,
        imageUrl: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=150',
        verified: h.verified || false,
      }]);
      setFacilityReviews([]);
    } catch (error) {
      console.error('Error loading facility details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFacility = async (format: 'pdf' | 'csv' | 'json') => {
    if (!selectedFacility) return;
    
    setIsExporting(true);
    
    try {
      // In a real implementation, we would call the API to generate and download the file
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      alert(`Facility data exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error(`Error exporting facility data as ${format}:`, error);
      alert(`Failed to export facility data as ${format}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintFacility = () => {
    window.print();
  };

  const handleEmailFacility = () => {
    // In a real implementation, we would open a modal to enter email details
    // For now, we'll just show a message
    alert('Email functionality would be implemented here.');
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || facility.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getFacilityTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Building className="h-5 w-5 text-primary-600" />;
      case 'clinic':
        return <Building className="h-5 w-5 text-secondary-600" />;
      case 'health_center':
        return <Building className="h-5 w-5 text-accent-600" />;
      default:
        return <Building className="h-5 w-5 text-neutral-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Health Facility Database
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Browse, search, and download information about healthcare facilities
          </p>
        </div>

        {selectedFacility ? (
          <>
            {/* Facility Details View */}
            <div className="mb-6 flex items-center">
              <button
                onClick={() => setSelectedFacility(null)}
                className="mr-4 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {selectedFacility.name}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 capitalize">
                  {selectedFacility.type.replace('_', ' ')} • {selectedFacility.city}, {selectedFacility.state}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Facility Information */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Facility Information</h3>
                    <div className="flex items-center">
                      {selectedFacility.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 mr-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      )}
                      <span className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {selectedFacility.rating} ({selectedFacility.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                          Contact Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <MapIcon className="h-5 w-5 text-neutral-500 mr-3 mt-0.5" />
                            <div>
                              <p className="text-neutral-900 dark:text-white">{selectedFacility.address}</p>
                              <p className="text-neutral-600 dark:text-neutral-300">
                                {selectedFacility.city}, {selectedFacility.state} {selectedFacility.zipCode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 text-neutral-500 mr-3" />
                            <p className="text-neutral-900 dark:text-white">{selectedFacility.phone}</p>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 text-neutral-500 mr-3" />
                            <p className="text-neutral-900 dark:text-white">{selectedFacility.email}</p>
                          </div>
                          {selectedFacility.website && (
                            <div className="flex items-center">
                              <Globe className="h-5 w-5 text-neutral-500 mr-3" />
                              <a 
                                href={selectedFacility.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary-600 dark:text-primary-400 hover:underline"
                              >
                                {selectedFacility.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                          Operating Hours
                        </h4>
                        <div className="space-y-2">
                          {selectedFacility.operatingHours.map((hours, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-neutral-600 dark:text-neutral-300">{hours.day}</span>
                              <span className="text-neutral-900 dark:text-white font-medium">
                                {hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                          Services Offered
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFacility.services.map((service, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                          Available Vaccines
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFacility.availableVaccines.map((vaccine, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-300"
                            >
                              {vaccine}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                        Insurance Accepted
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFacility.insuranceAccepted.map((insurance, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300"
                          >
                            {insurance}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facility Stats */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Facility Statistics</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Staff</h4>
                          <span className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedFacility.staffCount}</span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          <Users className="h-4 w-4 mr-1" />
                          Healthcare professionals
                        </div>
                      </div>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Patients Served</h4>
                          <span className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedFacility.childrenServed}</span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          <Users className="h-4 w-4 mr-1" />
                          Children registered
                        </div>
                      </div>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Vaccinations</h4>
                          <span className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedFacility.vaccinationsThisMonth}</span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          This month
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => handleExportFacility('pdf')}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-md transition-colors"
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        Export as PDF
                      </button>
                      
                      <button
                        onClick={handlePrintFacility}
                        className="w-full flex items-center justify-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-md transition-colors"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Facility Info
                      </button>
                      
                      <button
                        onClick={handleEmailFacility}
                        className="w-full flex items-center justify-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-md transition-colors"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Facility Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff and Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staff */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Healthcare Staff</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {facilityStaff.map(staff => (
                      <div key={staff.id} className="flex items-start">
                        <img 
                          src={staff.imageUrl} 
                          alt={staff.name}
                          className="h-16 w-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-white">{staff.name}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">{staff.role} • {staff.specialty}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{staff.bio}</p>
                          {staff.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 mt-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified Professional
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Patient Reviews</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {facilityReviews.map(review => (
                      <div key={review.id} className="border-b border-neutral-200 dark:border-neutral-700 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">{review.userName}</h4>
                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {review.helpful} found helpful
                          </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3">{review.comment}</p>
                        
                        {review.response && (
                          <div className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                              Response from {selectedFacility.name}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300">{review.response.text}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              {new Date(review.response.date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Facilities List View */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search facilities by name, address, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                
                <div className="md:w-64">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  >
                    <option value="all">All Facility Types</option>
                    <option value="hospital">Hospitals</option>
                    <option value="clinic">Clinics</option>
                    <option value="health_center">Health Centers</option>
                    <option value="pharmacy">Pharmacies</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setIsMapVisible(!isMapVisible)}
                  className="md:w-auto flex items-center justify-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-md transition-colors"
                >
                  {isMapVisible ? (
                    <>
                      <List className="h-4 w-4 mr-2" />
                      List View
                    </>
                  ) : (
                    <>
                      <MapIcon className="h-4 w-4 mr-2" />
                      Map View
                    </>
                  )}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-300">Loading facilities...</span>
              </div>
            ) : (
              <>
                {isMapVisible ? (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden h-[600px]">
                    <div className="relative h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                      <div className="text-center p-6">
                        <MapIcon className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Interactive Map View</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 max-w-md mb-4">
                          Map integration ready for deployment. Health facilities will be displayed with interactive markers and detailed popups.
                        </p>
                        
                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-indigo-200 dark:border-indigo-800 max-w-sm mx-auto">
                          <div className="flex items-center justify-center mb-2">
                            <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                            <span className="font-medium text-neutral-900 dark:text-white">3 Facilities Found</span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">Click on a marker to view facility details</p>
                        </div>
                      </div>
                      
                      {/* Decorative map elements */}
                      <div className="absolute top-4 left-4 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-sm">
                        <Navigation className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-sm">
                        <MapPin className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {filteredFacilities.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredFacilities.map(facility => (
                          <div 
                            key={facility.id} 
                            className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => loadFacilityDetails(facility.id)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg mr-3">
                                  {getFacilityTypeIcon(facility.type)}
                                </div>
                                <div>
                                  <h3 className="font-medium text-neutral-900 dark:text-white">{facility.name}</h3>
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                                    {facility.type.replace('_', ' ')}
                                  </p>
                                </div>
                              </div>
                              {facility.verified && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                                <MapIcon className="h-4 w-4 text-neutral-500 mr-2" />
                                {facility.address}, {facility.city}, {facility.state}
                              </div>
                              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                                <Phone className="h-4 w-4 text-neutral-500 mr-2" />
                                {facility.phone}
                              </div>
                              <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                                <Mail className="h-4 w-4 text-neutral-500 mr-2" />
                                {facility.email}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                              <div className="text-center">
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{facility.staffCount}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Staff</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{facility.childrenServed}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Patients</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{facility.vaccinationsThisMonth}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Vaccines</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {facility.availableVaccines.slice(0, 3).map((vaccine, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-300"
                                >
                                  {vaccine}
                                </span>
                              ))}
                              {facility.availableVaccines.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300">
                                  +{facility.availableVaccines.length - 3} more
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                              <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                {facility.rating} ({facility.reviewCount} reviews)
                              </div>
                              <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                        <Building className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                          No facilities found
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                          {searchTerm || typeFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'No healthcare facilities are available in the database'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Bulk Download Section */}
        <div className="mt-8 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Bulk Data Download
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mr-3">
                  <Building className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">All Facilities</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{facilities.length} facilities</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                Complete database of all healthcare facilities with contact information and services.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportFacility('csv')}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </button>
                <button
                  onClick={() => handleExportFacility('json')}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-sm rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </button>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full mr-3">
                  <Shield className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Vaccination Centers</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Specialized data</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                Facilities offering vaccination services with available vaccines and schedules.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportFacility('csv')}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </button>
                <button
                  onClick={() => handleExportFacility('pdf')}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-sm rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </button>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-accent-100 dark:bg-accent-900/20 p-3 rounded-full mr-3">
                  <Users className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Healthcare Providers</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Staff directory</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                Directory of healthcare providers with specialties and contact information.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportFacility('csv')}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </button>
                <button
                  onClick={() => handleExportFacility('pdf')}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-sm rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Usage Information */}
        <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-primary-600 dark:text-primary-400 mt-0.5 mr-4" />
            <div>
              <h3 className="font-medium text-primary-800 dark:text-primary-300 mb-2">
                About This Data
              </h3>
              <p className="text-sm text-primary-700 dark:text-primary-400 mb-4">
                This database contains information about healthcare facilities that offer vaccination and pediatric services. The data is regularly updated and verified for accuracy. You can download and use this data for research, analysis, or integration with other healthcare systems.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#" 
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Data Usage Policy
                </a>
                <a 
                  href="#" 
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  API Documentation
                </a>
                <a 
                  href="#" 
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Last Updated: {new Date().toLocaleDateString()}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDownloadPage;