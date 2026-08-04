import { Calendar, User, Shield, ExternalLink, Eye } from 'lucide-react';

interface RecordSummary {
  id: string;
  childIdHash: string;
  vaccineName: string;
  batchNumber: string;
  dateAdministered: string;
  doseNumber: number;
  notes?: string;
  blockchainTxId: string;
  verified: boolean;
  parentWallet?: string;
  childName?: string;
}

interface VaccinationRecordCardProps {
  record: RecordSummary;
  onView?: (record: RecordSummary) => void;
}

const VaccinationRecordCard = ({ record, onView }: VaccinationRecordCardProps) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">{record.vaccineName}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Dose {record.doseNumber}{record.batchNumber ? ` • Batch: ${record.batchNumber}` : ''}</p>
        </div>
        {record.verified && (
          <div className="flex items-center text-success-600">
            <Shield className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Completed</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-neutral-600">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(record.dateAdministered).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-neutral-600">
          <User className="h-4 w-4 mr-2" />
          {record.childName || `ID: ${record.childIdHash.substring(0, 8)}...`}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex space-x-2">
          {onView && (
            <button onClick={() => onView(record)}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-1" />View
            </button>
          )}
          {record.blockchainTxId && (
            <button onClick={() => window.open(`https://testnet.explorer.perawallet.app/tx/${record.blockchainTxId}`, '_blank')}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
              <ExternalLink className="h-4 w-4 mr-1" />Explorer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationRecordCard;