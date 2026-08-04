import { useContext } from 'react';
import { MapPin, Phone, Shield, Users, Building2 } from 'lucide-react';
import { useHealthWorker } from '../../contexts/HealthWorkerContext';
import UserContext from '../../contexts/UserContext';
import { useApi } from '../../hooks/useMedfinetApi';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';

const FacilityProfile = () => {
  const { healthWorker } = useHealthWorker();
  const { organizationId } = useContext(UserContext);

  const { data: facilities } = useApi(
    () => organizationId ? medfinetIdentityApi.listFacilities(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const { data: childrenData } = useApi(
    () => organizationId ? medfinetIdentityApi.listChildren(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const facility = facilities?.[0];
  const children = childrenData?.items || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Facility Profile</h1>
      <p className="text-neutral-600 dark:text-neutral-300 mb-8">Manage your healthcare facility information</p>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{facility?.name || healthWorker?.facility_name || 'Your Facility'}</h2>
            <p className="text-sm text-neutral-500">{facility?.code || 'Active'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Address</p>
              <p className="text-sm text-neutral-500">{healthWorker?.facility_name || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Contact</p>
              <p className="text-sm text-neutral-500">{healthWorker?.email || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">License</p>
              <p className="text-sm text-neutral-500">{healthWorker?.licenseNumber || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Children Registered</p>
              <p className="text-sm text-neutral-500">{children.length} children</p>
            </div>
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Recent Children</h2>
          <div className="space-y-3">
            {children.slice(0, 5).map((child) => (
              <div key={child.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-md">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 text-sm font-bold">
                    {child.firstName.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-neutral-500">ID: {child.medfinetId}</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400">{new Date(child.dateOfBirth).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityProfile;
