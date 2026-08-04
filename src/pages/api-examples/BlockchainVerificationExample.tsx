import { useState } from 'react';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';
import blockchainApi from '../../services/blockchainApi';
import useApi from '../../hooks/useApi';
import ApiDataLoader from '../../components/common/ApiDataLoader';

interface VerificationResult {
  isVerified: boolean;
  status: 'verified' | 'unverified' | 'pending';
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
  issuer: {
    id: string;
    name: string;
    role: string;
    organization: string;
    licenseVerified: boolean;
  };
  data: {
    recordType: string;
    recordId: string;
    childName?: string;
    vaccineName?: string;
    dateAdministered?: string;
    doseNumber?: number;
    batchNumber?: string;
    invoiceAmount?: number;
    invoiceDate?: string;
    provider?: string;
  };
  explorerUrl: string;
}

const BlockchainVerificationExample = () => {
  const [recordId, setRecordId] = useState('');
  const [recordType, setRecordType] = useState<'vaccination' | 'healthWorker' | 'invoice'>('vaccination');
  
  // Use our custom hook for the verification API
  const {
    data: verificationResult,
    isLoading: isVerifying,
    error: verificationError,
    execute: verifyRecord,
    reset: resetVerification,
  } = useApi<VerificationResult>(() => {
    switch (recordType) {
      case 'vaccination':
        return blockchainApi.verification.verifyVaccinationRecord(recordId);
      case 'healthWorker':
        return blockchainApi.verification.verifyHealthWorker(recordId);
      case 'invoice':
        return blockchainApi.verification.verifyMedicalInvoice(recordId);
    }
  });

  // Handle verification
  const handleVerify = () => {
    if (recordId.trim()) {
      resetVerification();
      verifyRecord();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Blockchain Verification API
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Verify the authenticity of healthcare records on the blockchain
        </p>
      </div>

      {/* Verification Form */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Record ID or Hash
            </label>
            <input
              type="text"
              placeholder="Enter record ID, transaction hash, or certificate ID..."
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Record Type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="vaccination">Vaccination Record</option>
              <option value="healthWorker">Health Worker Credential</option>
              <option value="invoice">Medical Invoice</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleVerify}
            disabled={isVerifying || !recordId.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify on Blockchain
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Result */}
      <ApiDataLoader
        isLoading={isVerifying}
        error={verificationError}
        data={verificationResult}
        onRetry={handleVerify}
      >
        {(result) => (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center">
              {result.isVerified ? (
                <div className="flex items-center text-success-600 dark:text-success-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Verification Successful</h3>
                </div>
              ) : result.status === 'pending' ? (
                <div className="flex items-center text-warning-600 dark:text-warning-400">
                  <Clock className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Verification Pending</h3>
                </div>
              ) : (
                <div className="flex items-center text-error-600 dark:text-error-400">
                  <XCircle className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Verification Failed</h3>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Blockchain Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Transaction Hash:</span>
                      <span className="text-sm font-mono text-neutral-900 dark:text-white">
                        {result.transactionHash.substring(0, 10)}...{result.transactionHash.substring(result.transactionHash.length - 8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Block Number:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{result.blockNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Timestamp:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Status:</span>
                      <span className={`text-sm font-medium ${
                        result.status === 'verified' 
                          ? 'text-success-600 dark:text-success-400' 
                          : result.status === 'pending'
                            ? 'text-warning-600 dark:text-warning-400'
                            : 'text-error-600 dark:text-error-400'
                      }`}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Issuer Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Name:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{result.issuer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Role:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{result.issuer.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Organization:</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{result.issuer.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">License Verified:</span>
                      <span className={`text-sm font-medium ${
                        result.issuer.licenseVerified 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-error-600 dark:text-error-400'
                      }`}>
                        {result.issuer.licenseVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Record Details</h4>
                <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Record Type:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                          {result.data.recordType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Record ID:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {result.data.recordId}
                        </span>
                      </div>
                      {result.data.childName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Child Name:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {result.data.childName}
                          </span>
                        </div>
                      )}
                      {result.data.provider && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Provider:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {result.data.provider}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {result.data.vaccineName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Vaccine:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {result.data.vaccineName}
                          </span>
                        </div>
                      )}
                      {result.data.dateAdministered && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Date:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {new Date(result.data.dateAdministered).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {result.data.doseNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Dose:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {result.data.doseNumber}
                          </span>
                        </div>
                      )}
                      {result.data.invoiceAmount && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">Amount:</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            ${result.data.invoiceAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <a
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Blockchain Explorer
                </a>
                
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Verification Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </ApiDataLoader>
    </div>
  );
};

export default BlockchainVerificationExample;