import { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Phone, Clock, Users, Shield } from 'lucide-react';
import healthApi from '../../services/healthApi';
import useApi from '../../hooks/useApi';
import ApiDataLoader from '../../components/common/ApiDataLoader';

interface HealthCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  distance: number;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'health_center';
  services: string[];
  operatingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  availableVaccines: string[];
  rating: number;
  reviewCount: number;
}

const HealthMapApiExample = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // miles
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  
  // Use our custom hook for the nearby providers API
  const {
    data: nearbyCenters,
    isLoading: isLoadingCenters,
    error: centersError,
    execute: searchNearby,
  } = useApi<HealthCenter[]>(healthApi.providers.searchNearby);
  
  // Use our custom hook for the provider details API
  const {
    data: centerDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
    execute: loadCenterDetails,
  } = useApi<HealthCenter>(healthApi.providers.getProviderDetails);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          // Search nearby centers once we have location
          searchNearby(latitude, longitude, searchRadius);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use a default location (New York City)
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          setLocation(defaultLocation);
          searchNearby(defaultLocation.lat, defaultLocation.lng, searchRadius);
        }
      );
    }
  }, []);

  // Load center details when a center is selected
  useEffect(() => {
    if (selectedCenter) {
      loadCenterDetails(selectedCenter);
    }
  }, [selectedCenter, loadCenterDetails]);

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    if (location) {
      searchNearby(location.lat, location.lng, newRadius);
    }
  };

  // Get icon for center type
  const getCenterTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Users className="h-5 w-5 text-primary-600" />;
      case 'clinic':
        return <Shield className="h-5 w-5 text-secondary-600" />;
      case 'pharmacy':
        return <Shield className="h-5 w-5 text-accent-600" />;
      default:
        return <MapPin className="h-5 w-5 text-neutral-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Health Centers Map API
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Find nearby health centers and vaccination providers using location data
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Search Radius (miles)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="50"
                value={searchRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-neutral-900 dark:text-white font-medium">{searchRadius} miles</span>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Your Location
            </label>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-neutral-500 mr-2" />
              {location ? (
                <span className="text-neutral-900 dark:text-white">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              ) : (
                <span className="text-neutral-500">Detecting location...</span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => location && searchNearby(location.lat, location.lng, searchRadius)}
            disabled={!location || isLoadingCenters}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
          >
            {isLoadingCenters ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Area
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Centers List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
              <h3 className="font-medium text-neutral-900 dark:text-white">Nearby Health Centers</h3>
            </div>
            
            <ApiDataLoader
              isLoading={isLoadingCenters}
              error={centersError}
              data={nearbyCenters}
              onRetry={() => location && searchNearby(location.lat, location.lng, searchRadius)}
            >
              {(centers) => (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-[500px] overflow-y-auto">
                  {centers.length > 0 ? (
                    centers.map((center) => (
                      <button
                        key={center.id}
                        onClick={() => setSelectedCenter(center.id)}
                        className={`w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                          selectedCenter === center.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium text-neutral-900 dark:text-white">{center.name}</h4>
                          <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">{center.distance.toFixed(1)} mi</span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{center.address}, {center.city}</p>
                        <div className="flex items-center mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{center.phone}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <MapPin className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-neutral-900 dark:text-white mb-1">No health centers found</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">Try increasing your search radius</p>
                    </div>
                  )}
                </div>
              )}
            </ApiDataLoader>
          </div>
        </div>

        {/* Map and Details */}
        <div className="lg:col-span-2">
          {/* Map Placeholder */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-6">
            <div className="relative h-[300px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Interactive Map View</h3>
                <p className="text-neutral-600 dark:text-neutral-300 max-w-md mb-4">
                  Map integration ready for deployment. Health centers will be displayed with interactive markers.
                </p>
                {selectedCenter && centerDetails && (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-indigo-200 dark:border-indigo-800 max-w-sm mx-auto">
                    <div className="flex items-center justify-center mb-2">
                      <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                      <span className="font-medium text-neutral-900 dark:text-white">{centerDetails.name}</span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{centerDetails.address}</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">{centerDetails.distance.toFixed(1)} miles away</p>
                  </div>
                )}
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

          {/* Center Details */}
          {selectedCenter ? (
            <ApiDataLoader
              isLoading={isLoadingDetails}
              error={detailsError}
              data={centerDetails}
              onRetry={() => selectedCenter && loadCenterDetails(selectedCenter)}
            >
              {(center) => (
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mr-4">
                        {getCenterTypeIcon(center.type)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{center.name}</h2>
                        <p className="text-neutral-600 dark:text-neutral-300 capitalize">
                          {center.type.replace('_', ' ')}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(center.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-neutral-300 dark:text-neutral-600'
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-neutral-600 dark:text-neutral-300 ml-2">
                            {center.rating} ({center.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                      <a
                        href={`https://maps.google.com/?q=${center.latitude},${center.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </a>
                      <a
                        href={`tel:${center.phone}`}
                        className="border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Center
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-neutral-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-neutral-900 dark:text-white">{center.address}</p>
                            <p className="text-neutral-600 dark:text-neutral-300">{center.city}, {center.state} {center.zipCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-neutral-500 mr-3" />
                          <p className="text-neutral-900 dark:text-white">{center.phone}</p>
                        </div>
                        <div className="flex items-center">
                          <a
                            href={center.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Operating Hours</h3>
                      <div className="space-y-2">
                        {center.operatingHours.map((hours) => (
                          <div key={hours.day} className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-300">{hours.day}</span>
                            <span className="text-neutral-900 dark:text-white">
                              {hours.open} - {hours.close}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Available Vaccines</h3>
                    <div className="flex flex-wrap gap-2">
                      {center.availableVaccines.map((vaccine) => (
                        <span
                          key={vaccine}
                          className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {vaccine}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ApiDataLoader>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
              <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                Select a health center
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Choose a health center from the list to view detailed information
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthMapApiExample;