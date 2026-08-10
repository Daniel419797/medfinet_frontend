import type { NfcImmunizationRecord } from './medfinetNfcApi';

export type NfcSecureVaccineAccess = {
  organizationId: string;
  childId: string;
  childName?: string;
  immunizations: NfcImmunizationRecord[];
};

type StoredAccess = NfcSecureVaccineAccess & { savedAt: number };

const ACCESS_TTL_MS = 5 * 60 * 1000;
const vaccineAccess = new Map<string, StoredAccess>();

export function storeNfcVaccineAccess(
  publicId: string,
  access: NfcSecureVaccineAccess,
) {
  vaccineAccess.set(publicId, { ...access, savedAt: Date.now() });
}

export function readNfcVaccineAccess(
  publicId: string,
): NfcSecureVaccineAccess | null {
  const stored = vaccineAccess.get(publicId);
  if (!stored) return null;
  if (Date.now() - stored.savedAt > ACCESS_TTL_MS) {
    vaccineAccess.delete(publicId);
    return null;
  }
  return {
    organizationId: stored.organizationId,
    childId: stored.childId,
    childName: stored.childName,
    immunizations: stored.immunizations,
  };
}

export function clearNfcVaccineAccess(publicId: string) {
  vaccineAccess.delete(publicId);
}
