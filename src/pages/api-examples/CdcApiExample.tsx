import { useState, useEffect } from 'react';
import { 
  Shield, 
  Map, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Info,
  Globe,
  BarChart3
} from 'lucide-react';
import cdcApi from '../../services/cdcApi';
import useApi from '../../hooks/useApi';
import ApiDataLoader from '../../components/common/ApiDataLoader';

interface VaccinationCoverage {
  state: string;
  mmr: number;
  dtap: number;
  polio: number;
  hepB: number;
  varicella: number;
  overall: number;
  year: number;
}

interface OutbreakData {
  id: string;
  disease: string;
  location: string;
  startDate: string;
  status: 'active' | 'contained' | 'resolved';
  caseCount: number;
  severity: 'low' | 'medium' | 'high';
  affectedAgeGroups: string[];
  preventionMeasures: string[];
}

const CdcApiExample = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState('all');
  
  // Use our custom hook for the vaccination coverage API
  const {
    data: coverageData,
    isLoading: isLoadingCoverage,
    error: coverageError,
    execute: loadCoverageData,
  } = useApi<VaccinationCoverage[]>(cdcApi.vaccinations.getVaccinationCoverageByState);
  
  // Use our custom hook for the outbreaks API
  const {
    data: outbreakData,
    isLoading: isLoadingOutbreaks,
    error: outbreaksError,
    execute: loadOutbreakData,
  } = useApi<OutbreakData[]>(cdcApi.outbreaks.getCurrentOutbreaks);

  // Load data on component mount
  useEffect(() => {
    loadCoverageData(selectedYear);
    loadOutbreakData();
  }, []);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    loadCoverageData(year);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-success-600 bg-success-50 border-success-200';
      case 'medium': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'high': return 'text-error-600 bg-error-50 border-error-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-error-600 bg-error-50 border-error-200';
      case 'contained': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'resolved': return 'text-success-600 bg-success-50 border-success-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          CDC Data Integration
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Access public health data and vaccination statistics from the CDC
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="all">All States</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="IL">Illinois</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Disease
            </label>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="all">All Diseases</option>
              <option value="measles">Measles</option>
              <option value="pertussis">Pertussis</option>
              <option value="influenza">Influenza</option>
              <option value="covid-19">COVID-19</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vaccination Coverage */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Vaccination Coverage by State ({selectedYear})
          </h2>
          <button
            onClick={() => loadCoverageData(selectedYear)}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Data
          </button>
        </div>
        
        <ApiDataLoader
          isLoading={isLoadingCoverage}
          error={coverageError}
          data={coverageData}
          onRetry={() => loadCoverageData(selectedYear)}
        >
          {(data) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Overall
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      MMR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      DTaP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Polio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Hepatitis B
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Varicella
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {data.filter(item => selectedState === 'all' || item.state === selectedState).map((item) => (
                    <tr key={item.state} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                        {item.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mr-3">
                            <div
                              className={`h-2 rounded-full ${
                                item.overall >= 90 ? 'bg-success-500' : 
                                item.overall >= 80 ? 'bg-warning-500' : 'bg-error-500'
                              }`}
                              style={{ width: `${Math.min(item.overall, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {item.overall}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {item.mmr}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {item.dtap}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {item.polio}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {item.hepB}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {item.varicella}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ApiDataLoader>
      </div>

      {/* Disease Outbreaks */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Current Disease Outbreaks
          </h2>
          <button
            onClick={() => loadOutbreakData()}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Data
          </button>
        </div>
        
        <ApiDataLoader
          isLoading={isLoadingOutbreaks}
          error={outbreaksError}
          data={outbreakData}
          onRetry={() => loadOutbreakData()}
        >
          {(data) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.filter(item => 
                (selectedDisease === 'all' || item.disease.toLowerCase() === selectedDisease) &&
                (selectedState === 'all' || item.location.includes(selectedState))
              ).map((outbreak) => (
                <div key={outbreak.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">{outbreak.disease}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">{outbreak.location}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(outbreak.status)}`}>
                      {outbreak.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Start Date:</span>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {new Date(outbreak.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Cases:</span>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {outbreak.caseCount}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Severity:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(outbreak.severity)}`}>
                        {outbreak.severity}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Affected Ages:</span>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {outbreak.affectedAgeGroups.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded-md">
                    <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Prevention Measures:</h4>
                    <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                      {outbreak.preventionMeasures.map((measure, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ApiDataLoader>
      </div>
    </div>
  );
};

export default CdcApiExample;