import { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  FileText, 
  Calendar, 
  Shield, 
  Download, 
  RefreshCw,
  Loader2,
  CheckCircle,
  Stethoscope
} from 'lucide-react';
import fhirApi from '../../services/fhirApi';
import useApi from '../../hooks/useApi';
import ApiDataLoader from '../../components/common/ApiDataLoader';

interface PatientData {
  id: string;
  name: {
    given: string[];
    family: string;
  }[];
  gender: string;
  birthDate: string;
  address?: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
  }[];
  telecom?: {
    system: string;
    value: string;
    use?: string;
  }[];
}

interface ImmunizationData {
  id: string;
  status: string;
  vaccineCode: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
    text: string;
  };
  patient: {
    reference: string;
    display?: string;
  };
  occurrenceDateTime: string;
  primarySource: boolean;
  lotNumber?: string;
  performer?: {
    actor: {
      reference: string;
      display?: string;
    };
  }[];
  note?: {
    text: string;
  }[];
}

const FhirApiExample = () => {
  const [patientId, setPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  
  // Use our custom hook for the patient search API
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    execute: searchPatients,
  } = useApi(fhirApi.patients.searchPatients);
  
  // Use our custom hook for the patient details API
  const {
    data: patientDetails,
    isLoading: isLoadingPatient,
    error: patientError,
    execute: loadPatientDetails,
  } = useApi<PatientData>(fhirApi.patients.getPatient);
  
  // Use our custom hook for the immunizations API
  const {
    data: immunizations,
    isLoading: isLoadingImmunizations,
    error: immunizationsError,
    execute: loadImmunizations,
  } = useApi<ImmunizationData[]>(fhirApi.immunizations.getPatientImmunizations);

  // Handle patient search
  const handleSearch = () => {
    if (patientId.trim()) {
      searchPatients({ _id: patientId });
    }
  };

  // Load patient details and immunizations when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      loadPatientDetails(selectedPatient);
      loadImmunizations(selectedPatient);
    }
  }, [selectedPatient, loadPatientDetails, loadImmunizations]);

  // Format patient name
  const formatPatientName = (patient: PatientData) => {
    if (!patient.name || patient.name.length === 0) return 'Unknown';
    
    const name = patient.name[0];
    const given = name.given ? name.given.join(' ') : '';
    const family = name.family || '';
    
    return `${given} ${family}`.trim();
  };

  // Format patient address
  const formatPatientAddress = (patient: PatientData) => {
    if (!patient.address || patient.address.length === 0) return 'No address provided';
    
    const address = patient.address[0];
    const line = address.line ? address.line.join(', ') : '';
    const city = address.city || '';
    const state = address.state || '';
    const postalCode = address.postalCode || '';
    
    return `${line}, ${city}, ${state} ${postalCode}`.trim().replace(/^, /, '');
  };

  // Get patient contact info
  const getPatientContact = (patient: PatientData, system: string) => {
    if (!patient.telecom) return null;
    
    const contact = patient.telecom.find(t => t.system === system);
    return contact ? contact.value : null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          FHIR API Integration
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Access and manage healthcare data using the FHIR standard API
        </p>
      </div>

      {/* Patient Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Enter patient ID or search by name..."
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !patientId.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Patient
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Results and Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
              <h3 className="font-medium text-neutral-900 dark:text-white">Patient Search Results</h3>
            </div>
            
            <ApiDataLoader
              isLoading={isSearching}
              error={searchError}
              data={searchResults}
              onRetry={handleSearch}
            >
              {(data) => (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-96 overflow-y-auto">
                  {data.entry && data.entry.length > 0 ? (
                    data.entry.map((entry: any) => {
                      const patient = entry.resource;
                      return (
                        <button
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient.id)}
                          className={`w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                            selectedPatient === patient.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                            <div>
                              <h4 className="font-medium text-neutral-900 dark:text-white">
                                {patient.name && patient.name[0] ? 
                                  `${patient.name[0].given ? patient.name[0].given.join(' ') : ''} ${patient.name[0].family || ''}`.trim() : 
                                  'Unknown Name'}
                              </h4>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                ID: {patient.id} • DOB: {patient.birthDate || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-neutral-500 dark:text-neutral-400">No patients found</p>
                    </div>
                  )}
                </div>
              )}
            </ApiDataLoader>
          </div>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              <ApiDataLoader
                isLoading={isLoadingPatient}
                error={patientError}
                data={patientDetails}
                onRetry={() => selectedPatient && loadPatientDetails(selectedPatient)}
              >
                {(patient) => (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mr-4">
                          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {formatPatientName(patient)}
                          </h2>
                          <p className="text-neutral-600 dark:text-neutral-300">
                            Patient ID: {patient.id}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => loadPatientDetails(selectedPatient)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                          Personal Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Gender:</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                              {patient.gender || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Birth Date:</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Address:</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {formatPatientAddress(patient)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Phone:</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {getPatientContact(patient, 'phone') || 'Not provided'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Email:</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {getPatientContact(patient, 'email') || 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                        <FileText className="h-4 w-4 mr-2" />
                        Export Patient Record
                      </button>
                    </div>
                  </div>
                )}
              </ApiDataLoader>

              {/* Immunization Records */}
              <ApiDataLoader
                isLoading={isLoadingImmunizations}
                error={immunizationsError}
                data={immunizations}
                onRetry={() => selectedPatient && loadImmunizations(selectedPatient)}
              >
                {(data) => (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                      <h3 className="font-medium text-neutral-900 dark:text-white">Immunization Records</h3>
                      <button
                        onClick={() => loadImmunizations(selectedPatient)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </button>
                    </div>
                    
                    {data.entry && data.entry.length > 0 ? (
                      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {data.entry.map((entry: any) => {
                          const immunization = entry.resource;
                          return (
                            <div key={immunization.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 bg-secondary-100 dark:bg-secondary-900/20 p-2 rounded-full mt-1">
                                  <Shield className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                                </div>
                                <div className="ml-4 flex-1">
                                  <div className="flex flex-wrap items-center justify-between">
                                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                      {immunization.vaccineCode.text || 'Unknown Vaccine'}
                                    </h4>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      immunization.status === 'completed' 
                                        ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300' 
                                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
                                    }`}>
                                      {immunization.status}
                                    </span>
                                  </div>
                                  
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                                      <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                                      Date: {new Date(immunization.occurrenceDateTime).toLocaleDateString()}
                                    </div>
                                    
                                    {immunization.lotNumber && (
                                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                                        <FileText className="h-4 w-4 mr-2 text-neutral-500" />
                                        Lot: {immunization.lotNumber}
                                      </div>
                                    )}
                                    
                                    {immunization.performer && immunization.performer[0] && (
                                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                                        <Stethoscope className="h-4 w-4 mr-2 text-neutral-500" />
                                        Provider: {immunization.performer[0].actor.display || 'Unknown'}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {immunization.note && immunization.note.length > 0 && (
                                    <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-700 rounded text-sm text-neutral-600 dark:text-neutral-300">
                                      {immunization.note[0].text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Shield className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                          No immunization records found
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                          This patient doesn't have any recorded immunizations
                        </p>
                        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Record New Immunization
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </ApiDataLoader>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
              <User className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                No patient selected
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Search for a patient and select from the results to view their details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FhirApiExample;