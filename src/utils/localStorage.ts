// Local Storage utility functions for data persistence

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  walletAddress?: string;
  createdAt: string;
}

export interface StoredHealthWorker {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  clinic: string;
  licenseNumber: string;
  facility_name: string;
  verified: boolean;
  role: 'nurse' | 'doctor' | 'administrator';
  createdAt: string;
}

export interface StoredChildProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  parentId: string;
  avatar?: string;
  blockchainId?: string;
  createdAt: string;
}

export interface StoredVaccinationRecord {
  id: string;
  childId: string;
  vaccineId: string;
  vaccineName: string;
  date: string;
  location: string;
  provider: string;
  blockchainHash?: string;
  verified: boolean;
  dose: number;
  nextDoseDate?: string;
  createdAt: string;
}

export interface StoredMedicalInvoice {
  id: string;
  providerId: string;
  providerName: string;
  patientId?: string;
  patientName?: string;
  service: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'tokenized' | 'funded' | 'completed';
  tokenId?: string;
  blockchainHash?: string;
  createdAt: string;
}

export interface StoredNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'vaccination' | 'invoice' | 'system';
  date: string;
  read: boolean;
  actionUrl?: string;
}

// User Management
export const saveUser = (user: StoredUser): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Also save to users list
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCurrentUser = (): StoredUser | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const getUsers = (): StoredUser[] => {
  const usersStr = localStorage.getItem('users');
  return usersStr ? JSON.parse(usersStr) : [];
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
};

// Health Worker Management
export const saveHealthWorker = (healthWorker: StoredHealthWorker): void => {
  localStorage.setItem('currentHealthWorker', JSON.stringify(healthWorker));
  
  // Also save to health workers list
  const healthWorkers = getHealthWorkers();
  const existingIndex = healthWorkers.findIndex(hw => hw.id === healthWorker.id);
  if (existingIndex >= 0) {
    healthWorkers[existingIndex] = healthWorker;
  } else {
    healthWorkers.push(healthWorker);
  }
  localStorage.setItem('healthWorkers', JSON.stringify(healthWorkers));
};

export const getCurrentHealthWorker = (): StoredHealthWorker | null => {
  const hwStr = localStorage.getItem('currentHealthWorker');
  return hwStr ? JSON.parse(hwStr) : null;
};

export const getHealthWorkers = (): StoredHealthWorker[] => {
  const hwStr = localStorage.getItem('healthWorkers');
  return hwStr ? JSON.parse(hwStr) : [];
};

export const clearCurrentHealthWorker = (): void => {
  localStorage.removeItem('currentHealthWorker');
};

// Child Profiles Management
export const saveChildProfile = (profile: StoredChildProfile): void => {
  const profiles = getChildProfiles();
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  localStorage.setItem('childProfiles', JSON.stringify(profiles));
};

export const getChildProfiles = (parentId?: string): StoredChildProfile[] => {
  const profilesStr = localStorage.getItem('childProfiles');
  const profiles = profilesStr ? JSON.parse(profilesStr) : [];
  return parentId ? profiles.filter((p: StoredChildProfile) => p.parentId === parentId) : profiles;
};

export const getChildProfile = (id: string): StoredChildProfile | null => {
  const profiles = getChildProfiles();
  return profiles.find(p => p.id === id) || null;
};

export const deleteChildProfile = (id: string): void => {
  const profiles = getChildProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  localStorage.setItem('childProfiles', JSON.stringify(filtered));
};

// Vaccination Records Management
export const saveVaccinationRecord = (record: StoredVaccinationRecord): void => {
  const records = getVaccinationRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem('vaccinationRecords', JSON.stringify(records));
};

export const getVaccinationRecords = (childId?: string): StoredVaccinationRecord[] => {
  const recordsStr = localStorage.getItem('vaccinationRecords');
  const records = recordsStr ? JSON.parse(recordsStr) : [];
  return childId ? records.filter((r: StoredVaccinationRecord) => r.childId === childId) : records;
};

export const deleteVaccinationRecord = (id: string): void => {
  const records = getVaccinationRecords();
  const filtered = records.filter(r => r.id !== id);
  localStorage.setItem('vaccinationRecords', JSON.stringify(filtered));
};

// Medical Invoices Management
export const saveMedicalInvoice = (invoice: StoredMedicalInvoice): void => {
  const invoices = getMedicalInvoices();
  const existingIndex = invoices.findIndex(i => i.id === invoice.id);
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.push(invoice);
  }
  localStorage.setItem('medicalInvoices', JSON.stringify(invoices));
};

export const getMedicalInvoices = (): StoredMedicalInvoice[] => {
  const invoicesStr = localStorage.getItem('medicalInvoices');
  return invoicesStr ? JSON.parse(invoicesStr) : [];
};

export const getMedicalInvoice = (id: string): StoredMedicalInvoice | null => {
  const invoices = getMedicalInvoices();
  return invoices.find(i => i.id === id) || null;
};

export const deleteMedicalInvoice = (id: string): void => {
  const invoices = getMedicalInvoices();
  const filtered = invoices.filter(i => i.id !== id);
  localStorage.setItem('medicalInvoices', JSON.stringify(filtered));
};

// Notifications Management
export const saveNotification = (notification: StoredNotification): void => {
  const notifications = getNotifications();
  const existingIndex = notifications.findIndex(n => n.id === notification.id);
  if (existingIndex >= 0) {
    notifications[existingIndex] = notification;
  } else {
    notifications.push(notification);
  }
  localStorage.setItem('notifications', JSON.stringify(notifications));
};

export const getNotifications = (userId?: string): StoredNotification[] => {
  const notificationsStr = localStorage.getItem('notifications');
  const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
  return userId ? notifications.filter((n: StoredNotification) => n.userId === userId) : notifications;
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
};

export const deleteNotification = (id: string): void => {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  localStorage.setItem('notifications', JSON.stringify(filtered));
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const clearAllData = (): void => {
  const keysToKeep = ['cookieConsent', 'theme'];
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
};

// Initialize with some sample data if empty
export const initializeSampleData = (): void => {
  // Only initialize if no data exists
  if (!localStorage.getItem('users') && !localStorage.getItem('healthWorkers')) {
    // Sample users
    const sampleUsers: StoredUser[] = [
      {
        id: 'user_001',
        name: 'John Williams',
        email: 'john.williams@email.com',
        role: 'parent',
        walletAddress: 'ALGO7X8Y9Z...ABC123',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user_002',
        name: 'Maria Davis',
        email: 'maria.davis@email.com',
        role: 'parent',
        walletAddress: 'ALGO9A8B7C...DEF456',
        createdAt: new Date().toISOString(),
      },
    ];

    // Sample health workers
    const sampleHealthWorkers: StoredHealthWorker[] = [
      {
        id: 'hw_001',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@citypediatrics.com',
        walletAddress: 'ALGO7X8Y9Z...ABC123',
        facility_name: "LASUTH",
        clinic: 'City Pediatrics Medical Center',
        licenseNumber: 'MD-12345-NY',
        verified: true,
        role: 'doctor',
        createdAt: new Date().toISOString(),
      },
    ];

    // Sample child profiles
    const sampleProfiles: StoredChildProfile[] = [
      {
        id: 'child_001',
        name: 'Jacob Williams',
        birthDate: '2020-05-15',
        gender: 'male',
        parentId: 'user_001',
        avatar: 'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=100',
        blockchainId: '3wcmJLa...0osEinvP',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'child_002',
        name: 'Emma Davis',
        birthDate: '2022-03-10',
        gender: 'female',
        parentId: 'user_002',
        avatar: 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=100',
        createdAt: new Date().toISOString(),
      },
    ];

    // Sample vaccination records
    const sampleVaccinations: StoredVaccinationRecord[] = [
      {
        id: 'vacc_001',
        childId: 'child_001',
        vaccineId: 'v1',
        vaccineName: 'DTaP',
        date: '2023-06-15',
        location: 'City Pediatrics',
        provider: 'Dr. Sarah Johnson',
        blockchainHash: '0x7f9e8d...6b2c1a',
        verified: true,
        dose: 1,
        nextDoseDate: '2023-09-15',
        createdAt: new Date().toISOString(),
      },
    ];

    // Save sample data
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    localStorage.setItem('healthWorkers', JSON.stringify(sampleHealthWorkers));
    localStorage.setItem('childProfiles', JSON.stringify(sampleProfiles));
    localStorage.setItem('vaccinationRecords', JSON.stringify(sampleVaccinations));
  }
};