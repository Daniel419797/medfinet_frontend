import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Download, RefreshCw } from 'lucide-react';
import healthApi from '../../services/healthApi';
import useApi from '../../hooks/useApi';
import ApiDataLoader from '../../components/common/ApiDataLoader';

interface VaccineData {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  recommendedAges: string[];
  dosesRequired: number;
  sideEffects: string[];
  contraindications: string[];
}

const VaccinationApiExample = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);
  
  // Use our custom hook for the search API
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    execute: executeSearch,
  } = useApi(healthApi.vaccinations.searchVaccines);
  
  // Use our custom hook for the vaccine details API
  const {
    data: vaccineDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
    execute: loadVaccineDetails,
  } = useApi<VaccineData>(healthApi.vaccinations.getVaccineInfo);

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      executeSearch(searchTerm);
    }
  };

  // Load vaccine details when a vaccine is selected
  useEffect(() => {
    if (selectedVaccine) {
      loadVaccineDetails(selectedVaccine);
    }
  }, [selectedVaccine, loadVaccineDetails]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Vaccine Information API
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Search and retrieve detailed information about vaccines using the Health API
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for vaccines (e.g., MMR, DTaP, Influenza)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
              <h3 className="font-medium text-neutral-900 dark:text-white">Search Results</h3>
            </div>
            
            <ApiDataLoader
              isLoading={isSearching}
              error={searchError}
              data={searchResults}
              onRetry={handleSearch}
            >
              {(data) => (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-96 overflow-y-auto">
                  {data.length > 0 ? (
                    data.map((vaccine: any) => (
                      <button
                        key={vaccine.id}
                        onClick={() => setSelectedVaccine(vaccine.id)}
                        className={`w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                          selectedVaccine === vaccine.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">{vaccine.name}</h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{vaccine.manufacturer}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-neutral-500 dark:text-neutral-400">No vaccines found</p>
                    </div>
                  )}
                </div>
              )}
            </ApiDataLoader>
          </div>
        </div>

        {/* Vaccine Details */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 h-full">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-medium text-neutral-900 dark:text-white">Vaccine Details</h3>
              {selectedVaccine && (
                <button
                  onClick={() => loadVaccineDetails(selectedVaccine)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </button>
              )}
            </div>
            
            <ApiDataLoader
              isLoading={isLoadingDetails}
              error={detailsError}
              data={vaccineDetails}
              onRetry={() => selectedVaccine && loadVaccineDetails(selectedVaccine)}
            >
              {(vaccine) => (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{vaccine.name}</h2>
                    <p className="text-neutral-600 dark:text-neutral-300">{vaccine.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-2">General Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Manufacturer:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{vaccine.manufacturer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Doses Required:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{vaccine.dosesRequired}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Recommended Ages:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{vaccine.recommendedAges.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Side Effects</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {vaccine.sideEffects.map((effect: string, index: number) => (
                          <li key={index} className="text-sm text-neutral-600 dark:text-neutral-300">{effect}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Contraindications</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {vaccine.contraindications.map((item: string, index: number) => (
                        <li key={index} className="text-sm text-neutral-600 dark:text-neutral-300">{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Download Information Sheet
                    </button>
                  </div>
                </div>
              )}
            </ApiDataLoader>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationApiExample;