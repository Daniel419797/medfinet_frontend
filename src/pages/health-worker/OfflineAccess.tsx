import { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  Download, 
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Camera,
  Zap,
  Shield
} from 'lucide-react';
import { useHealthWorker } from '../../contexts/HealthWorkerContext';
import qrCodeApi from '../../services/qrCodeApi';
import NotificationToast from '../../components/health-worker/NotificationToast';

const OfflineAccess = () => {
  const { healthWorker } = useHealthWorker();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStats, setOfflineStats] = useState<{
    vaccinationCount: number;
    lastSyncDate: string | null;
  }>({ vaccinationCount: 0, lastSyncDate: null });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Update online status
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Load offline stats
    loadOfflineStats();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      
      // Clean up scan interval
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      
      // Stop camera if active
      stopCamera();
    };
  }, []);

  const loadOfflineStats = async () => {
    try {
      const stats = await qrCodeApi.getOfflineStorageStats();
      setOfflineStats(stats);
    } catch (error) {
      console.error('Error loading offline stats:', error);
    }
  };

  const handleSyncData = async () => {
    if (!isOnline) {
      setNotification({
        type: 'error',
        message: 'Cannot sync while offline. Please connect to the internet and try again.',
        isVisible: true,
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      const result = await qrCodeApi.syncOfflineData('/api/sync-offline-data');
      
      setNotification({
        type: 'success',
        message: `Successfully synced ${result.synced} vaccination records.`,
        isVisible: true,
      });
      
      // Update stats after sync
      await loadOfflineStats();
    } catch (error) {
      console.error('Error syncing data:', error);
      setNotification({
        type: 'error',
        message: 'Failed to sync data. Please try again later.',
        isVisible: true,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearOfflineData = async () => {
    if (confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      try {
        await qrCodeApi.clearOfflineData();
        
        setNotification({
          type: 'success',
          message: 'All offline data has been cleared.',
          isVisible: true,
        });
        
        // Update stats after clearing
        await loadOfflineStats();
      } catch (error) {
        console.error('Error clearing offline data:', error);
        setNotification({
          type: 'error',
          message: 'Failed to clear offline data. Please try again.',
          isVisible: true,
        });
      }
    }
  };

  const startCamera = async () => {
    setIsScanning(true);
    setScanResult(null);
    
    try {
      if (videoRef.current && canvasRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Start scanning for QR codes
        scanIntervalRef.current = window.setInterval(() => {
          scanQRCode();
        }, 500) as unknown as number;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setNotification({
        type: 'error',
        message: 'Failed to access camera. Please check permissions and try again.',
        isVisible: true,
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Process the QR code
        processQRCode(imageData);
      }
    }
  };

  const processQRCode = async (imageData: ImageData) => {
    try {
      const qrData = await qrCodeApi.scanQRCodeFromImage(imageData);
      
      if (qrData && qrData.startsWith('MEDFI:')) {
        // Stop scanning once we find a valid QR code
        stopCamera();
        
        // Parse the QR code data
        const parsedData = await qrCodeApi.parseQRCode(qrData);
        setScanResult(parsedData);
        
        setNotification({
          type: 'success',
          message: `Successfully scanned ${parsedData.type} QR code.`,
          isVisible: true,
        });
      }
    } catch (error) {
      // Continue scanning - don't show error for every frame
      console.log('No QR code found in this frame');
    }
  };

  const handleSaveOffline = async () => {
    if (!scanResult || scanResult.type !== 'VAX') {
      setNotification({
        type: 'error',
        message: 'Only vaccination records can be saved offline.',
        isVisible: true,
      });
      return;
    }
    
    try {
      await qrCodeApi.storeOfflineVaccination(scanResult.data);
      
      setNotification({
        type: 'success',
        message: 'Vaccination record saved for offline access.',
        isVisible: true,
      });
      
      // Update stats after saving
      await loadOfflineStats();
    } catch (error) {
      console.error('Error saving offline data:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save vaccination record offline.',
        isVisible: true,
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Offline Access
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Scan and store vaccination records for access in areas with limited connectivity
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isOnline ? (
              <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-full mr-4">
                <Wifi className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
            ) : (
              <div className="bg-warning-100 dark:bg-warning-900/20 p-3 rounded-full mr-4">
                <WifiOff className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {isOnline ? 'Online Mode' : 'Offline Mode'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">
                {isOnline 
                  ? 'Connected to the internet. All features available.' 
                  : 'Working offline. Limited features available.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncData}
              disabled={!isOnline || isSyncing}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Sync Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Stored Records</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {offlineStats.vaccinationCount}
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full">
              <Database className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <Shield className="h-4 w-4 mr-1" />
            Securely encrypted
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Last Sync</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                {offlineStats.lastSyncDate 
                  ? new Date(offlineStats.lastSyncDate).toLocaleString() 
                  : 'Never synced'}
              </p>
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full">
              <Clock className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync when online
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Storage</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                {offlineStats.vaccinationCount > 0 
                  ? `~${offlineStats.vaccinationCount * 5} KB used` 
                  : 'No data stored'}
              </p>
            </div>
            <div className="bg-accent-100 dark:bg-accent-900/20 p-3 rounded-full">
              <Zap className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <button
              onClick={handleClearOfflineData}
              className="flex items-center text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all data
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Scanner */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            QR Code Scanner
          </h2>
          {!isScanning ? (
            <button
              onClick={startCamera}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            {isScanning ? (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  playsInline
                ></video>
                <div className="absolute inset-0 border-2 border-primary-500 opacity-50 pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2 text-sm">
                  Point camera at a MedFiNet QR code
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
            ) : (
              <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center aspect-video">
                <div className="text-center p-6">
                  <QrCode className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-300">
                    Click "Start Scanning" to scan a QR code
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:w-1/2">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-3">
              Scan Results
            </h3>
            
            {scanResult ? (
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-neutral-900 dark:text-white">
                    {scanResult.type === 'VAX' ? 'Vaccination Record' : 
                     scanResult.type === 'CHILD' ? 'Child Profile' : 
                     scanResult.type === 'HW' ? 'Health Worker Credentials' : 
                     'Unknown Data'}
                  </h4>
                  <span className="text-xs bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300 px-2 py-0.5 rounded-full">
                    Valid
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {scanResult.type === 'VAX' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Vaccine:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {scanResult.data.vaccineName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Child:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {scanResult.data.childName || scanResult.data.childIdHash}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Date:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {new Date(scanResult.data.dateAdministered).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Dose:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {scanResult.data.doseNumber}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {scanResult.type === 'CHILD' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Name:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {scanResult.data.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Birth Date:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {new Date(scanResult.data.birthDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Gender:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                          {scanResult.data.gender}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {scanResult.type === 'HW' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Name:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {scanResult.data.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Role:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                          {scanResult.data.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Clinic:</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {scanResult.data.clinic}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Verified:</span>
                        <span className={`text-sm font-medium ${
                          scanResult.data.verified 
                            ? 'text-success-600 dark:text-success-400' 
                            : 'text-error-600 dark:text-error-400'
                        }`}>
                          {scanResult.data.verified ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  {scanResult.type === 'VAX' && (
                    <button
                      onClick={handleSaveOffline}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Save Offline
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setScanResult(null);
                      startCamera();
                    }}
                    className="border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <h4 className="font-medium text-neutral-900 dark:text-white mb-2">No QR Code Scanned</h4>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                  Scan a MedFiNet QR code to view and store vaccination records for offline access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stored Records */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
          Stored Offline Records
        </h2>
        
        {offlineStats.vaccinationCount > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Vaccine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Dose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {/* This would be populated with actual data from offlineStorage */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                      DTaP
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      Emma Davis
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Sync
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSyncData}
                disabled={!isOnline || isSyncing}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Sync All Records
                  </>
                )}
              </button>
              <button
                onClick={handleClearOfflineData}
                className="border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No Offline Records
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-md mx-auto">
              Scan vaccination QR codes to store them for offline access. This is useful in areas with limited connectivity.
            </p>
            <button
              onClick={startCamera}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center transition-colors"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR Code
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
        <h3 className="font-medium text-neutral-900 dark:text-white mb-4">
          How Offline Access Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mb-3">
              <QrCode className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">1. Scan QR Codes</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Scan vaccination QR codes from patient records or documents
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full mb-3">
              <Database className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">2. Store Locally</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Records are securely stored on your device for offline access
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-full mb-3">
              <RefreshCw className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">3. Sync When Online</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Automatically sync stored records when internet connection is available
            </p>
          </div>
        </div>
      </div>

      <NotificationToast
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default OfflineAccess;