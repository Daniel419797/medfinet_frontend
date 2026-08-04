import { useState, useContext } from 'react';
import { Video, Phone, MessageCircle, Calendar, Clock, User, Star, Shield } from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { useApi, useApiLazy } from '../../hooks/useMedfinetApi';
import { medfinetTelemedicineApi } from '../../services/medfinetTelemedicineApi';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  avatar: string;
  available: boolean;
  price: number;
  nextAvailable: string;
}

const TelemedicineConsultation = () => {
  const { organizationId } = useContext(UserContext);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'chat'>('video');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { execute: bookConsultation, loading: booking } = useApiLazy();

  const { data: doctorsData, loading, error } = useApi(
    () => organizationId ? medfinetTelemedicineApi.listDoctors(organizationId) : Promise.resolve(null),
    [organizationId]
  );

  const doctors: Doctor[] = doctorsData ?? [];

  const handleBookConsultation = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const confirmBooking = async () => {
    if (!organizationId || !selectedDoctor) return;
    try {
      await bookConsultation(() =>
        medfinetTelemedicineApi.bookConsultation(organizationId, {
          doctorId: selectedDoctor.id,
          type: consultationType,
          scheduledAt: new Date().toISOString(),
        })
      );
      setIsBookingModalOpen(false);
      setSelectedDoctor(null);
    } catch { /* error handled by hook */ }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Telemedicine Consultations</h1>
        <p className="text-neutral-600">Connect with healthcare professionals from anywhere</p>
      </div>

      {loading && (
        <div className="text-center py-8 text-neutral-500">Loading doctors...</div>
      )}

      {error && (
        <div className="text-center py-8 text-error-600">{error}</div>
      )}

      {/* Consultation Types */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Choose Consultation Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setConsultationType('video')}
            className={`p-4 rounded-lg border-2 transition-all ${
              consultationType === 'video'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300'
            }`}
          >
            <Video className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium">Video Call</h3>
            <p className="text-sm text-neutral-600">Face-to-face consultation</p>
          </button>
          
          <button
            onClick={() => setConsultationType('phone')}
            className={`p-4 rounded-lg border-2 transition-all ${
              consultationType === 'phone'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300'
            }`}
          >
            <Phone className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium">Phone Call</h3>
            <p className="text-sm text-neutral-600">Voice-only consultation</p>
          </button>
          
          <button
            onClick={() => setConsultationType('chat')}
            className={`p-4 rounded-lg border-2 transition-all ${
              consultationType === 'chat'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300'
            }`}
          >
            <MessageCircle className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium">Chat</h3>
            <p className="text-sm text-neutral-600">Text-based consultation</p>
          </button>
        </div>
      </div>

      {/* Available Doctors */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold">Available Doctors</h2>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="p-6 hover:bg-neutral-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-neutral-900">{doctor.name}</h3>
                    <p className="text-neutral-600">{doctor.specialty}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-neutral-600 ml-1">
                        {doctor.rating} • {doctor.experience} years experience
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-neutral-500 mr-1" />
                      <span className={`text-sm ${doctor.available ? 'text-success-600' : 'text-warning-600'}`}>
                        {doctor.nextAvailable}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-neutral-900">${doctor.price}</div>
                  <div className="text-sm text-neutral-600">per consultation</div>
                  <button
                    onClick={() => handleBookConsultation(doctor)}
                    disabled={!doctor.available}
                    className={`mt-2 px-4 py-2 rounded-md text-sm font-medium ${
                      doctor.available
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {doctor.available ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && doctors.length === 0 && (
            <div className="p-6 text-center text-neutral-500">No doctors available</div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsBookingModalOpen(false)}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-auto z-10 animate-slide-up">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-xl font-semibold text-neutral-900">Book Consultation</h3>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={selectedDoctor.avatar}
                    alt={selectedDoctor.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-medium">{selectedDoctor.name}</h4>
                    <p className="text-sm text-neutral-600">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Consultation Type:</span>
                    <span className="text-sm capitalize">{consultationType}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">30 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-sm font-bold">${selectedDoctor.price}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-neutral-600 mb-4">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Secure, HIPAA-compliant consultation</span>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end space-x-3">
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={booking}
                  className="btn-primary"
                >
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemedicineConsultation;
