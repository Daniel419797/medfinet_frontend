import {
  MapPin,
  Navigation,
  Phone,
  Clock,
} from 'lucide-react';
import { HealthCenter } from '../../types';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import UserContext from '../../contexts/UserContext';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapViewUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng]);
  return null;
};

const HealthCenters = () => {
  const { organizationId } = useContext(UserContext);
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFacilities = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const facilities = await medfinetIdentityApi.listFacilities(organizationId);
      const mapped: HealthCenter[] = facilities.map((f) => {
        const parts = (f.administrativeArea || '').split(',').map((s: string) => s.trim());
        return {
          id: f.id,
          name: f.name,
          address: f.address || '',
          city: parts[0] || '',
          state: parts[1] || '',
          phone: f.phone || '',
          latitude: 0,
          longitude: 0,
          availableVaccines: f.programmeCategories || [],
        };
      });
      setHealthCenters(mapped);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to load health centers'
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadFacilities();
  }, [loadFacilities]);

  const filteredCenters = healthCenters.filter(
    (center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mapCenter: [number, number] = selectedCenter
    ? [selectedCenter.latitude, selectedCenter.longitude]
    : [6.5244, 3.3792];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Nearby Health Centers
        </h1>
        <p className="text-neutral-600">
          Find vaccination centers and healthcare providers near you
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500">
          Loading health centers…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-neutral-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search health centers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                {filteredCenters.length > 0 ? (
                  <ul className="divide-y divide-neutral-200">
                    {filteredCenters.map((center) => (
                      <li
                        key={center.id}
                        className={`p-4 cursor-pointer hover:bg-neutral-50 ${
                          selectedCenter?.id === center.id
                            ? 'bg-primary-50'
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedCenter(center);
                        }}
                      >
                        <div className="flex justify-between">
                          <h3 className="text-base font-medium text-neutral-900">
                            {center.name}
                          </h3>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          {center.address}, {center.city}
                        </p>
                        <div className="mt-2 flex items-center">
                          <Phone className="h-4 w-4 text-neutral-500 mr-1" />
                          <span className="text-sm text-neutral-600">
                            {center.phone}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center">
                    <MapPin className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-neutral-900 mb-1">
                      No health centers found
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Try adjusting your search
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[500px]">
              <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectedCenter && (
                  <MapViewUpdater
                    lat={selectedCenter.latitude}
                    lng={selectedCenter.longitude}
                  />
                )}

                {filteredCenters.map((center) => (
                  <Marker
                    key={center.id}
                    position={[center.latitude, center.longitude]}
                    eventHandlers={{
                      click: () => setSelectedCenter(center),
                    }}
                  >
                    <Popup>
                      <strong>{center.name}</strong>
                      <p>{center.address}</p>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Selected center info */}
      {selectedCenter && (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {selectedCenter.name}
                </h2>
                <p className="text-neutral-600 mt-1">
                  {selectedCenter.address}, {selectedCenter.city},{' '}
                  {selectedCenter.state}
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-neutral-500 mr-2" />
                    <span>{selectedCenter.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-neutral-500 mr-2" />
                    <span>Open 9:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                <a
                  href={`https://maps.google.com/?q=${selectedCenter.latitude},${selectedCenter.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
                <button className="btn-outline flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Center
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="text-lg font-semibold mb-3">Available Vaccines</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCenter.availableVaccines?.map((vaccine, index) => (
                  <span
                    key={index}
                    className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {vaccine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCenters;
