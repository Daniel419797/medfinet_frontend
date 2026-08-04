import { X, Shield, Calendar, User, ExternalLink, FileText, Hash, Link } from 'lucide-react';
import { VaccinationRecord } from '../../types/healthWorker';

interface VaccinationRecordModalProps {
  record: VaccinationRecord;
  onClose: () => void;
}

const VaccinationRecordModal = ({ record, onClose }: VaccinationRecordModalProps) => {
  const handleViewAsset = () => {
    if (record.blockchainTxId) {
      window.open(`https://testnet.explorer.perawallet.app/tx/${record.blockchainTxId}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Vaccination Record Details
            </h2>
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Vaccine Information */}
            <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Vaccine Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<FileText />} label="Vaccine" value={record.vaccineName} />
                <DetailItem icon={<Hash />} label="Dose Number" value={`Dose ${record.doseNumber}`} />
                <DetailItem icon={<Hash />} label="Batch Number" value={record.batchNumber} />
                <DetailItem icon={<Calendar />} label="Date Administered" value={new Date(record.dateAdministered).toLocaleDateString()} />
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<Hash />} label="Child ID" value={record.childIdHash} />
                <DetailItem icon={<User />} label="Parent Wallet" value={record.parentWallet} />
              </div>
            </div>

            {/* Blockchain Verification */}
            {record.blockchainTxId && (
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <Link className="h-5 w-5 mr-2" />
                  Blockchain Verification
                </h3>
                <div className="space-y-2">
                  <DetailItem icon={<Hash />} label="Transaction ID" value={record.blockchainTxId} />
                  {record.verified && (
                    <div className="flex items-center text-success-600 dark:text-success-400">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Verified on Algorand blockchain</span>
                    </div>
                  )}
                  <button
                    onClick={handleViewAsset}
                    className="mt-2 inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Asset on AlgoExplorer
                  </button>
                </div>
              </div>
            )}

            {/* Notes */}
            {record.notes && (
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Additional Notes</h3>
                <p className="text-neutral-700 dark:text-neutral-300">{record.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start">
    <div className="text-neutral-500 dark:text-neutral-400 mr-2 mt-0.5">
      {icon}
    </div>
    <div>
      <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="font-medium text-neutral-900 dark:text-white">{value}</div>
    </div>
  </div>
);

export default VaccinationRecordModal;