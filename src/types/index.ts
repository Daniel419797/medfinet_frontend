// User Types
// export type UserRole = 'parent' | 'doctor' | 'nurse' | 'funder' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  wallet_address?: string;
}

// Child Profile Types
export interface ChildProfile {
  id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  parentId: string;
  avatar?: string;
  blockchainId?: string;
}

// Vaccination Types
export interface Vaccine {
  id: string;
  name: string;
  description: string;
  recommendedAge: string;
  doses: number;
}

export interface VaccinationRecord {
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
  childName?: string;
}

// Health Center Types
export interface HealthCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  availableVaccines?: string[];
}

// Invoice Types
export interface MedicalInvoice {
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
}

export interface TokenizedInvoice extends MedicalInvoice {
  tokenId: string;
  tokenizationDate: string;
  fundingOptions: {
    minFundingAmount: number;
    interestRate?: number;
    fundingPeriod?: number;
  };
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'vaccination' | 'invoice' | 'system';
  date: string;
  read: boolean;
  actionUrl?: string;
}

// Blockchain Types
export interface BlockchainTransaction {
  hash: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'tokenization' | 'funding' | 'verification';
  assetId?: string;
}