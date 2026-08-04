import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import pako from 'pako';
import localforage from 'localforage';

// Initialize localforage instance for offline data
const offlineStorage = localforage.createInstance({
  name: 'medfiNetOfflineData',
  storeName: 'vaccinations',
  description: 'Offline vaccination records and health data'
});

// QR Code API service
const qrCodeApi = {
  // Generate QR code for vaccination record
  generateVaccinationQR: async (vaccinationData: any) => {
    try {
      // Compress the data to make QR code smaller and more reliable
      const jsonString = JSON.stringify(vaccinationData);
      const compressed = pako.deflate(jsonString);
      
      // Convert to base64 for QR code
      const base64Data = Buffer.from(compressed).toString('base64');
      
      // Add a prefix to identify the type of data
      const qrData = `MEDFI:VAX:${base64Data}`;
      
      return qrData;
    } catch (error) {
      console.error('Error generating vaccination QR code:', error);
      throw error;
    }
  },
  
  // Generate QR code for child profile
  generateChildProfileQR: async (childData: any) => {
    try {
      // Remove sensitive information
      const safeData = {
        id: childData.id,
        name: childData.name,
        birthDate: childData.birthDate,
        gender: childData.gender,
        blockchainId: childData.blockchainId,
        vaccinationIds: childData.vaccinationIds || []
      };
      
      // Compress the data
      const jsonString = JSON.stringify(safeData);
      const compressed = pako.deflate(jsonString);
      
      // Convert to base64 for QR code
      const base64Data = Buffer.from(compressed).toString('base64');
      
      // Add a prefix to identify the type of data
      const qrData = `MEDFI:CHILD:${base64Data}`;
      
      return qrData;
    } catch (error) {
      console.error('Error generating child profile QR code:', error);
      throw error;
    }
  },
  
  // Generate QR code for health worker credentials
  generateHealthWorkerQR: async (healthWorkerData: any) => {
    try {
      // Remove sensitive information
      const safeData = {
        id: healthWorkerData.id,
        name: healthWorkerData.name,
        role: healthWorkerData.role,
        clinic: healthWorkerData.clinic,
        licenseNumber: healthWorkerData.licenseNumber,
        verified: healthWorkerData.verified,
        blockchainId: healthWorkerData.blockchainId
      };
      
      // Compress the data
      const jsonString = JSON.stringify(safeData);
      const compressed = pako.deflate(jsonString);
      
      // Convert to base64 for QR code
      const base64Data = Buffer.from(compressed).toString('base64');
      
      // Add a prefix to identify the type of data
      const qrData = `MEDFI:HW:${base64Data}`;
      
      return qrData;
    } catch (error) {
      console.error('Error generating health worker QR code:', error);
      throw error;
    }
  },
  
  // Parse QR code data
  parseQRCode: async (qrData: string) => {
    try {
      if (!qrData.startsWith('MEDFI:')) {
        throw new Error('Invalid QR code format');
      }
      
      // Extract the type and data
      const [prefix, type, base64Data] = qrData.split(':');
      
      if (!base64Data) {
        throw new Error('Invalid QR code data');
      }
      
      // Convert from base64
      const compressed = Buffer.from(base64Data, 'base64');
      
      // Decompress the data
      const decompressed = pako.inflate(compressed);
      
      // Convert to string and parse JSON
      const jsonString = new TextDecoder().decode(decompressed);
      const data = JSON.parse(jsonString);
      
      return {
        type,
        data
      };
    } catch (error) {
      console.error('Error parsing QR code:', error);
      throw error;
    }
  },
  
  // Scan QR code from image
  scanQRCodeFromImage: async (imageData: ImageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        return code.data;
      } else {
        throw new Error('No QR code found in image');
      }
    } catch (error) {
      console.error('Error scanning QR code from image:', error);
      throw error;
    }
  },
  
  // Store vaccination data offline
  storeOfflineVaccination: async (vaccinationData: any) => {
    try {
      // Generate a key based on the ID
      const key = `vax_${vaccinationData.id}`;
      
      // Store the data
      await offlineStorage.setItem(key, vaccinationData);
      
      // Update the index of stored vaccinations
      const index = await offlineStorage.getItem('index') as string[] || [];
      if (!index.includes(key)) {
        index.push(key);
        await offlineStorage.setItem('index', index);
      }
      
      return true;
    } catch (error) {
      console.error('Error storing offline vaccination data:', error);
      throw error;
    }
  },
  
  // Get offline vaccination data
  getOfflineVaccination: async (id: string) => {
    try {
      const key = `vax_${id}`;
      return await offlineStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving offline vaccination data:', error);
      throw error;
    }
  },
  
  // Get all offline vaccinations
  getAllOfflineVaccinations: async () => {
    try {
      const index = await offlineStorage.getItem('index') as string[] || [];
      const vaccinations = [];
      
      for (const key of index) {
        if (key.startsWith('vax_')) {
          const data = await offlineStorage.getItem(key);
          if (data) {
            vaccinations.push(data);
          }
        }
      }
      
      return vaccinations;
    } catch (error) {
      console.error('Error retrieving all offline vaccinations:', error);
      throw error;
    }
  },
  
  // Sync offline data with server when online
  syncOfflineData: async (apiEndpoint: string) => {
    try {
      // Check if online
      if (!navigator.onLine) {
        throw new Error('Device is offline');
      }
      
      const vaccinations = await qrCodeApi.getAllOfflineVaccinations();
      
      if (vaccinations.length === 0) {
        return { synced: 0 };
      }
      
      // Send data to server
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vaccinations })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync data with server');
      }
      
      const result = await response.json();
      
      // Clear synced data if successful
      if (result.success) {
        const index = await offlineStorage.getItem('index') as string[] || [];
        
        for (const key of index) {
          if (key.startsWith('vax_')) {
            await offlineStorage.removeItem(key);
          }
        }
        
        await offlineStorage.setItem('index', []);
      }
      
      return {
        synced: vaccinations.length,
        result
      };
    } catch (error) {
      console.error('Error syncing offline data:', error);
      throw error;
    }
  },
  
  // Check if device is online
  isOnline: () => {
    return navigator.onLine;
  },
  
  // Get offline storage stats
  getOfflineStorageStats: async () => {
    try {
      const index = await offlineStorage.getItem('index') as string[] || [];
      const vaccinationCount = index.filter(key => key.startsWith('vax_')).length;
      
      return {
        vaccinationCount,
        lastSyncDate: await offlineStorage.getItem('lastSyncDate') as string || null
      };
    } catch (error) {
      console.error('Error getting offline storage stats:', error);
      throw error;
    }
  },
  
  // Clear all offline data
  clearOfflineData: async () => {
    try {
      await offlineStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      throw error;
    }
  }
};

export default qrCodeApi;