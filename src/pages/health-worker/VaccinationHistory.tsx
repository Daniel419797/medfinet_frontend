import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import VaccinationRecordCard from '../../components/health-worker/VaccinationRecordCard';
import { useHealthWorker } from '../../contexts/HealthWorkerContext';
import UserContext from '../../contexts/UserContext';
import VaccinationRecordModal from '../../components/health-worker/VaccinationRecordModal';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';
import { medfinetClinicalApi } from '../../services/medfinetClinicalApi';

const VaccinationHistory = () => {
  const navigate = useNavigate();
  const { healthWorker, isAuthenticated } = useHealthWorker();
  const { organizationId } = useContext(UserContext);
  const [records, setRecords] = useState<Array<{
    id: string; childIdHash: string; vaccineName: string; batchNumber: string;
    dateAdministered: string; doseNumber: number; notes: string;
    blockchainTxId: string; verified: boolean;
  }>>([]);
  const [filteredRecords, setFilteredRecords] = useState<typeof records>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<typeof records[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!healthWorker || !isAuthenticated) {
      navigate('/health-worker/login', { replace: true });
      return;
    }

    const fetchRecords = async () => {
      if (!organizationId) return;
      try {
        setIsLoading(true);
        const result = await medfinetIdentityApi.listChildren(organizationId, { limit: 50 });
        const allImmunizations = await Promise.all(
          result.items.map(child =>
            medfinetClinicalApi.getClinicalTimeline(organizationId, child.id)
              .then(t => t.immunizations.map(i => ({ ...i, childName: `${child.firstName} ${child.lastName}` })))
              .catch(() => [])
          )
        );
        const flat = allImmunizations.flat().map(i => ({
          id: i.id,
          childIdHash: i.vaccineCode,
          vaccineName: i.vaccineCode,
          batchNumber: '',
          dateAdministered: i.administeredAt,
          doseNumber: i.doseNumber,
          notes: '',
          blockchainTxId: '',
          verified: i.status === 'COMPLETED',
        }));
        setRecords(flat);
        setFilteredRecords(flat);
      } catch (err) {
        console.error('Failed to fetch records:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [healthWorker, isAuthenticated, navigate, organizationId]);

  useEffect(() => {
    let filtered = records;
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.childIdHash.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateFilter) {
      filtered = filtered.filter(r => r.dateAdministered >= dateFilter);
    }
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(r =>
        verificationFilter === 'verified' ? r.verified : !r.verified
      );
    }
    setFilteredRecords(filtered);
  }, [records, searchTerm, dateFilter, verificationFilter]);

  if (!healthWorker || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <AlertCircle className="h-12 w-12 text-error-600 mx-auto mb-4" />
        <p className="text-neutral-600">Please log in as a health worker</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Vaccination History</h1>
        <p className="text-neutral-600 dark:text-neutral-300">View vaccination records</p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input type="text" placeholder="Search records..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white">
              <option value="all">All Records</option>
              <option value="verified">Completed</option>
              <option value="unverified">Pending</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">{filteredRecords.length} records</span>
            <button onClick={() => { setSearchTerm(''); setDateFilter(''); setVerificationFilter('all'); }}
              className="text-primary-600 text-sm font-medium">Clear Filters</button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto" />
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <VaccinationRecordCard key={record.id} record={record} onView={setSelectedRecord} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border p-12 text-center">
          <User className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No records found</h3>
          <p className="text-neutral-500">No vaccination records available.</p>
        </div>
      )}

      {selectedRecord && (
        <VaccinationRecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
};

export default VaccinationHistory;
