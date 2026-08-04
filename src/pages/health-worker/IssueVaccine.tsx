import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, QrCode, Calendar, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useHealthWorker } from '../../contexts/HealthWorkerContext';
import UserContext from '../../contexts/UserContext';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';
import { medfinetClinicalApi } from '../../services/medfinetClinicalApi';

const vaccineOptions = [
  { code: 'BCG', name: 'BCG', doses: 1 },
  { code: 'HEP_B', name: 'Hepatitis B', doses: 3 },
  { code: 'DTAP', name: 'DTaP', doses: 5 },
  { code: 'IPV', name: 'IPV (Polio)', doses: 4 },
  { code: 'PCV', name: 'PCV', doses: 3 },
  { code: 'ROTA', name: 'Rotavirus', doses: 2 },
  { code: 'MMR', name: 'MMR', doses: 2 },
  { code: 'YF', name: 'Yellow Fever', doses: 1 },
  { code: 'MEN_A', name: 'Meningitis A', doses: 1 },
  { code: 'TYPHOID', name: 'Typhoid', doses: 1 },
];

const IssueVaccine = () => {
  const { healthWorker, isAuthenticated } = useHealthWorker();
  const { organizationId } = useContext(UserContext);
  const navigate = useNavigate();

  const [childSearch, setChildSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; firstName: string; lastName: string; dateOfBirth: string }>>([]);
  const [selectedChild, setSelectedChild] = useState<{ id: string; firstName: string; lastName: string } | null>(null);

  const [formData, setFormData] = useState({
    vaccineCode: '',
    doseNumber: 1,
    administeredAt: new Date().toISOString().split('T')[0],
    lotNumber: '',
    route: 'IM',
    site: 'LEFT_THIGH',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; isVisible: boolean }>({
    type: 'success', message: '', isVisible: false,
  });

  useEffect(() => {
    if (!healthWorker || !isAuthenticated) {
      navigate('/health-worker/login', { replace: true });
    }
  }, [healthWorker, isAuthenticated, navigate]);

  const handleSearch = async () => {
    if (!organizationId || !childSearch.trim()) return;
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, { limit: 100 });
      const query = childSearch.trim().toLowerCase();
      setSearchResults(result.items.filter((child) =>
        child.medfinetId.toLowerCase().includes(query)
        || `${child.firstName} ${child.lastName}`.toLowerCase().includes(query)
      ));
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Search failed: ' + err.message, isVisible: true });
    }
  };

  const handleSelectChild = (child: { id: string; firstName: string; lastName: string }) => {
    setSelectedChild(child);
    setSearchResults([]);
    setChildSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !selectedChild) return;

    setIsSubmitting(true);
    try {
      await medfinetClinicalApi.recordImmunization(organizationId, selectedChild.id, {
        vaccineCode: formData.vaccineCode,
        doseNumber: formData.doseNumber,
        administeredAt: new Date(formData.administeredAt).toISOString(),
        lotNumber: formData.lotNumber || undefined,
        route: formData.route,
        site: formData.site,
        notes: formData.notes || undefined,
      });

      setNotification({
        type: 'success',
        message: `Vaccination recorded for ${selectedChild.firstName} ${selectedChild.lastName}`,
        isVisible: true,
      });

      setSelectedChild(null);
      setFormData({
        vaccineCode: '', doseNumber: 1, administeredAt: new Date().toISOString().split('T')[0],
        lotNumber: '', route: 'IM', site: 'LEFT_THIGH', notes: '',
      });

      setTimeout(() => navigate('/health-worker/dashboard'), 1500);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to record vaccination', isVisible: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!healthWorker || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <AlertCircle className="h-12 w-12 text-error-600 mx-auto mb-4" />
        <p className="text-neutral-600">Please log in as a health worker</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Issue Vaccination</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Record a vaccination in the digital health system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">1. Find Child</h2>

          {!selectedChild ? (
            <>
              <div className="flex gap-2">
                <input type="text" className="flex-1 px-3 py-2 border border-neutral-300 rounded-md dark:bg-neutral-700 dark:text-white"
                  placeholder="Search by child name or ID..."
                  value={childSearch} onChange={(e) => setChildSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())} />
                <button type="button" onClick={handleSearch}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
                  {searchResults.map((child) => (
                    <button key={child.id} type="button"
                      onClick={() => handleSelectChild(child)}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b last:border-b-0 border-neutral-200 dark:border-neutral-700">
                      <span className="font-medium text-neutral-900 dark:text-white">{child.firstName} {child.lastName}</span>
                      <span className="text-sm text-neutral-500 ml-2">DOB: {new Date(child.dateOfBirth).toLocaleDateString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{selectedChild.firstName} {selectedChild.lastName}</p>
                <p className="text-sm text-neutral-500">ID: {selectedChild.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedChild(null)}
                className="text-sm text-primary-600 hover:underline">Change</button>
            </div>
          )}
        </div>

        {selectedChild && (
          <>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">2. Vaccine Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Vaccine</label>
                  <select className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={formData.vaccineCode}
                    onChange={(e) => setFormData({ ...formData, vaccineCode: e.target.value })} required>
                    <option value="">Select vaccine</option>
                    {vaccineOptions.map((v) => (
                      <option key={v.code} value={v.code}>{v.name} ({v.doses} doses)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Dose Number</label>
                  <select className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={formData.doseNumber}
                    onChange={(e) => setFormData({ ...formData, doseNumber: Number(e.target.value) })} required>
                    {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>Dose {d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Date Administered</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={formData.administeredAt}
                    onChange={(e) => setFormData({ ...formData, administeredAt: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Lot/Batch Number</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Route</label>
                  <select className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="SC">Subcutaneous (SC)</option>
                    <option value="ORAL">Oral</option>
                    <option value="ID">Intradermal (ID)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Site</label>
                  <select className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}>
                    <option value="LEFT_THIGH">Left Thigh</option>
                    <option value="RIGHT_THIGH">Right Thigh</option>
                    <option value="LEFT_ARM">Left Arm</option>
                    <option value="RIGHT_ARM">Right Arm</option>
                    <option value="LEFT_BUTTOCK">Left Buttock</option>
                    <option value="RIGHT_BUTTOCK">Right Buttock</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Notes</label>
                <textarea className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white" rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting || !formData.vaccineCode}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-6 rounded-md flex items-center transition-colors">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording...</>
                ) : (
                  <><Shield className="h-4 w-4 mr-2" />Record Vaccination</>
                )}
              </button>
            </div>
          </>
        )}
      </form>

      {notification.isVisible && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center">
            {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
            <p>{notification.message}</p>
            <button className="ml-4 text-white/80 hover:text-white" onClick={() => setNotification({ ...notification, isVisible: false })}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueVaccine;
