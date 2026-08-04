import { useState, useContext } from 'react';
import { Calendar, Clock, Plus, CheckCircle, XCircle } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { useApi, useApiLazy } from '../../hooks/useMedfinetApi';
import { medfinetClinicalApi } from '../../services/medfinetClinicalApi';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';

const AppointmentScheduling = () => {
  const { organizationId } = useContext(UserContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    kind: 'VACCINATION',
    scheduledFor: '',
    notes: '',
  });
  const { execute: submitAppointment, loading: submitting } = useApiLazy();

  const { data: childrenData } = useApi(
    () => organizationId ? medfinetIdentityApi.listChildren(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const children = childrenData?.items || [];

  const { data: firstChildTimeline, refetch: refreshTimeline } = useApi(
    () => (organizationId && children.length > 0)
      ? medfinetClinicalApi.getClinicalTimeline(organizationId, children[0].id)
      : Promise.resolve(null),
    [organizationId, children.length]
  );

  const appointments = firstChildTimeline?.appointments || [];

  const handleSubmit = async () => {
    if (!organizationId || !selectedChildId || !newAppointment.scheduledFor) return;
    try {
      await submitAppointment(() =>
        medfinetClinicalApi.scheduleAppointment(organizationId, selectedChildId, {
          kind: newAppointment.kind,
          scheduledFor: new Date(newAppointment.scheduledFor).toISOString(),
          notes: newAppointment.notes || undefined,
        })
      );
      setShowForm(false);
      setNewAppointment({ kind: 'VACCINATION', scheduledFor: '', notes: '' });
      refreshTimeline();
    } catch { /* error handled by hook */ }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Appointments</h1>
          <p className="text-neutral-600 dark:text-neutral-300">Schedule and manage appointments</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> New Appointment
        </button>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 flex items-start">
              <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white">{apt.kind}</h3>
                <div className="flex items-center text-sm text-neutral-500 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(apt.scheduledFor).toLocaleDateString()} at {new Date(apt.scheduledFor).toLocaleTimeString()}
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                apt.status === 'SCHEDULED' ? 'bg-primary-100 text-primary-800' :
                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-neutral-100 text-neutral-800'
              }`}>
                {apt.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
          <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No appointments</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Schedule your first appointment</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setShowForm(false)}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md mx-auto z-10 p-6">
              <h3 className="text-xl font-semibold mb-4">New Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Child</label>
                  <select className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}>
                    <option value="">Select child</option>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={newAppointment.kind}
                    onChange={(e) => setNewAppointment({ ...newAppointment, kind: e.target.value })}>
                    <option value="VACCINATION">Vaccination</option>
                    <option value="CHECKUP">Check-up</option>
                    <option value="GROWTH_MONITORING">Growth Monitoring</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input type="datetime-local" className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white"
                    value={newAppointment.scheduledFor}
                    onChange={(e) => setNewAppointment({ ...newAppointment, scheduledFor: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea className="w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white" rows={2}
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}
                  disabled={submitting || !selectedChildId || !newAppointment.scheduledFor}>
                  {submitting ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduling;
