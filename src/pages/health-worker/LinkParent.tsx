import { useCallback, useContext, useEffect, useState } from 'react';
import { Search, User, Users, Link as LinkIcon, Loader2 } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';
import NotificationToast from '../../components/health-worker/NotificationToast';

interface ChildRecord {
  id: string;
  medfinetId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  status: string;
  createdAt: string;
  caregivers?: Array<{
    caregiver: { id: string; firstName: string; lastName: string; phone?: string };
    relationship: string;
    isPrimary: boolean;
  }>;
}

const LinkParent = () => {
  const { organizationId } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildRecord | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  const loadData = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, { limit: 200 });
      const enriched = await Promise.all(
        result.items.map(async (child) => {
          try {
            const detail = await medfinetIdentityApi.getChild(organizationId, child.id);
            return { ...child, caregivers: detail.caregivers } as ChildRecord;
          } catch {
            return child as ChildRecord;
          }
        }),
      );
      setChildren(enriched);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load children');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredChildren = children.filter((child) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${child.firstName} ${child.lastName}`.toLowerCase();
    const id = child.medfinetId?.toLowerCase() || '';
    return fullName.includes(term) || id.includes(term);
  });

  const handleLinkRecord = async () => {
    if (!organizationId || !selectedChild || !selectedCaregiver) return;
    setIsLinking(true);
    try {
      await medfinetIdentityApi.linkCaregiver(organizationId, selectedChild.id, {
        caregiverId: selectedCaregiver,
        relationship: 'GUARDIAN',
        isPrimary: false,
        hasConsentAuthority: true,
      });

      setNotification({
        type: 'success',
        message: `Successfully linked caregiver to ${selectedChild.firstName} ${selectedChild.lastName}`,
        isVisible: true,
      });

      setSelectedChild(null);
      setSelectedCaregiver(null);
      void loadData();
    } catch (reason) {
      setNotification({
        type: 'error',
        message: reason instanceof Error ? reason.message : 'Failed to link caregiver. Please try again.',
        isVisible: true,
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Link to Parent
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Connect vaccination records to parent accounts and child profiles
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <span className="ml-3 text-neutral-600 dark:text-neutral-300">Loading children...</span>
        </div>
      )}

      {error && (
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4 mb-6">
          <p className="text-error-700 dark:text-error-400">{error}</p>
          <button
            onClick={() => void loadData()}
            className="mt-2 text-sm text-error-600 dark:text-error-400 underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Child Search & List */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Search Child
              </h2>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by name or medfinet ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredChildren.length === 0 && (
                  <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
                    No children found.
                  </p>
                )}
                {filteredChildren.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedChild?.id === child.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-neutral-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-neutral-900 dark:text-white">
                          {child.firstName} {child.lastName}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      ID: {child.medfinetId}
                    </p>
                    {child.caregivers && child.caregivers.length > 0 && (
                      <div className="mt-2 flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                        <Users className="h-4 w-4 mr-1" />
                        {child.caregivers.length} caregiver{child.caregivers.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Caregiver Profiles */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Linked Caregivers
              </h2>

              {selectedChild ? (
                <div className="space-y-3">
                  {selectedChild.caregivers && selectedChild.caregivers.length > 0 ? (
                    selectedChild.caregivers.map((link) => (
                      <div
                        key={link.caregiver.id}
                        onClick={() => setSelectedCaregiver(link.caregiver.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCaregiver === link.caregiver.id
                            ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                          {link.caregiver.firstName} {link.caregiver.lastName}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Relationship: {link.relationship}
                        </p>
                        {link.isPrimary && (
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                            Primary caregiver
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
                      No caregivers linked to this child yet.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Select a child to view their linked caregivers
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Link Action */}
          {selectedChild && selectedCaregiver && (
            <div className="mt-6 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-success-800 dark:text-success-300 mb-2">
                    Ready to Link
                  </h3>
                  <p className="text-success-700 dark:text-success-400">
                    Link caregiver to <strong>{selectedChild.firstName} {selectedChild.lastName}</strong>
                  </p>
                </div>
                <button
                  onClick={() => void handleLinkRecord()}
                  disabled={isLinking}
                  className="bg-success-600 hover:bg-success-700 disabled:bg-success-400 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Sign & Send
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <NotificationToast
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default LinkParent;
