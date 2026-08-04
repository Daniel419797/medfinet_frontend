export interface VaccinationRecord {
  id: string;
  childIdHash: string;
  parentWallet: string;
  vaccineName: string;
  batchNumber: string;
  dateAdministered: string;
  doseNumber: number;
  notes?: string;
  healthWorkerId: string;
  blockchainTxId: string;
  assetId: string;
  verified: boolean;
  createdAt: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  children: Child[];
}

export interface Child {
  id: string;
  name: string;
  idHash: string;
  birthDate: string;
  parentId: string;
  vaccinationHistory: VaccinationRecord[];
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  type: 'clinic' | 'hospital' | 'health_center';
  healthWorkers: string[];
  totalVaccinesIssued: number;
  childrenServed: number;
}

export interface VaccineType {
  id: string;
  name: string;
  manufacturer: string;
  description: string;
  ageGroup: string;
  dosesRequired: number;
}