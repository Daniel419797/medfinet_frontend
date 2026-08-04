import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  QrCode,
  Download,
  ArrowLeft,
  Info,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';
import { medfinetClinicalApi } from '../../services/medfinetClinicalApi';
import QRCodeGenerator from '../../components/common/QRCodeGenerator';
import qrCodeApi from '../../services/qrCodeApi';

interface ImmunizationRecord {
  id: string;
  vaccineCode: string;
  doseNumber: number;
  administeredAt: string;
  status: string;
}

const VaccinationQRCode = () => {
  const { id } = useParams();
  const { organizationId } = useContext(UserContext);
  const [immunization, setImmunization] = useState<ImmunizationRecord | null>(null);
  const [childName, setChildName] = useState<string>('');
  const [childIdHash, setChildIdHash] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!organizationId || !id) return;
    setIsLoading(true);
    setError(null);
    try {
      const childrenResult = await medfinetIdentityApi.listChildren(organizationId, { limit: 200 });

      let found = false;
      for (const child of childrenResult.items) {
        try {
          const timeline = await medfinetClinicalApi.getClinicalTimeline(organizationId, child.id);
          const match = timeline.immunizations.find((imm) => imm.id === id);
          if (match) {
            setImmunization(match);
            setChildName(`${child.firstName} ${child.lastName}`);
            setChildIdHash(child.medfinetId);
            found = true;

            const qrData = await qrCodeApi.generateVaccinationQR({
              id: match.id,
              childId: child.id,
              childIdHash: child.medfinetId,
              vaccineName: match.vaccineCode,
              dateAdministered: match.administeredAt,
              doseNumber: match.doseNumber,
              verified: match.status === 'COMPLETED',
            });
            setQrCodeData(qrData);
            break;
          }
        } catch {
          // continue to next child
        }
      }

      if (!found) {
        setError('Vaccination record not found');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load vaccination record');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !immunization) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <QrCode className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">{error || 'Vaccination record not found'}</h3>
        <p className="text-neutral-600 mb-6">The requested vaccination record could not be found or accessed.</p>
        <Link to="/vaccination-history/all" className="btn-primary">Back to Vaccination History</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center">
        <Link to="/vaccination-history/all" className="text-neutral-600 hover:text-neutral-900 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Vaccination QR Code</h1>
          <p className="text-neutral-600">Shareable QR code for {immunization.vaccineCode} vaccination record</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Code */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          {qrCodeData && (
            <QRCodeGenerator
              data={qrCodeData}
              title={`${immunization.vaccineCode} Vaccination Record`}
              description={`Dose ${immunization.doseNumber} administered on ${new Date(immunization.administeredAt).toLocaleDateString()}`}
              size={250}
              logoUrl="/vaccine.jpg"
            />
          )}
        </div>

        {/* Vaccination Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Vaccination Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <span className="text-neutral-600">Vaccine</span>
              <span className="font-medium text-neutral-900">{immunization.vaccineCode}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <span className="text-neutral-600">Child</span>
              <span className="font-medium text-neutral-900">{childName || 'Unknown'}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <span className="text-neutral-600">Dose</span>
              <span className="font-medium text-neutral-900">{immunization.doseNumber}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <span className="text-neutral-600">Date Administered</span>
              <span className="font-medium text-neutral-900">{new Date(immunization.administeredAt).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <span className="text-neutral-600">Status</span>
              <span className={`font-medium ${immunization.status === 'COMPLETED' ? 'text-success-600' : 'text-neutral-900'}`}>
                {immunization.status}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <span className="text-neutral-600">Medfinet ID</span>
              <span className="font-medium text-neutral-900 font-mono text-sm">{childIdHash}</span>
            </div>

            {immunization.status === 'COMPLETED' && (
              <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                <span className="text-neutral-600">Blockchain Verification</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-600 mr-1" />
                  <span className="font-medium text-success-600">Verified</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-neutral-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">About QR Codes</h3>
                <p className="text-sm text-neutral-600">
                  This QR code contains encrypted vaccination data that can be scanned by healthcare providers for verification.
                  It can also be used for offline access in areas with limited connectivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationQRCode;
