import { useContext } from 'react';
import { BarChart3, TrendingUp, Users, Shield, Activity } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { useApi } from '../../hooks/useMedfinetApi';
import { medfinetAnalyticsApi } from '../../services/medfinetAnalyticsApi';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';

const HealthAnalytics = () => {
  const { organizationId } = useContext(UserContext);

  const { data: analytics } = useApi(
    () => organizationId ? medfinetAnalyticsApi.getLatest(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const { data: childrenData } = useApi(
    () => organizationId ? medfinetIdentityApi.listChildren(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const children = childrenData?.items || [];
  const snapshots = analytics?.snapshots || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Health Analytics</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Immunization coverage and health metrics</p>
      </div>

      {analytics && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg text-sm text-neutral-500">
          Period: {new Date(analytics.periodStart).toLocaleDateString()} - {new Date(analytics.periodEnd).toLocaleDateString()}
          {' | '}Generated: {new Date(analytics.generatedAt).toLocaleString()}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-5">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-primary-600 bg-primary-100 p-2 rounded-full" />
            <div className="ml-4">
              <p className="text-sm text-neutral-500">Children Registered</p>
              <p className="text-2xl font-bold">{children.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-5">
          <div className="flex items-center">
            <Shield className="h-10 w-10 text-secondary-600 bg-secondary-100 p-2 rounded-full" />
            <div className="ml-4">
              <p className="text-sm text-neutral-500">Vaccination Events</p>
              <p className="text-2xl font-bold">{snapshots.filter(s => s.metricKey.includes('vaccination')).reduce((a, s) => a + s.value, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-5">
          <div className="flex items-center">
            <Activity className="h-10 w-10 text-accent-600 bg-accent-100 p-2 rounded-full" />
            <div className="ml-4">
              <p className="text-sm text-neutral-500">Active Alerts</p>
              <p className="text-2xl font-bold">{snapshots.filter(s => s.metricKey.includes('alert')).reduce((a, s) => a + s.value, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-5">
          <div className="flex items-center">
            <BarChart3 className="h-10 w-10 text-green-600 bg-green-100 p-2 rounded-full" />
            <div className="ml-4">
              <p className="text-sm text-neutral-500">Metrics Published</p>
              <p className="text-2xl font-bold">{snapshots.filter(s => s.disclosureStatus === 'PUBLISHED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {snapshots.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold">Aggregate Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Metric</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Geography</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {snapshots.map((s, i) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{s.metricKey}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{s.value}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{s.geography}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.disclosureStatus === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                      }`}>{s.disclosureStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!analytics && children.length === 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
          <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No analytics data yet</h3>
          <p className="text-neutral-600">Data will appear once children are registered and vaccinations recorded.</p>
        </div>
      )}
    </div>
  );
};

export default HealthAnalytics;
