import { medfinetRequest as request } from './medfinetApiClient';

export type MedfinetFacility = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  administrativeArea?: string | null;
  state?: string | null;
  lga?: string | null;
  ward?: string | null;
  address?: string | null;
  phone?: string | null;
  openingHours?: Record<string, string>;
  programmeCategories?: string[];
  isTemporary: boolean;
  temporaryUntil?: string | null;
};

export type FacilityInput = {
  name: string;
  code?: string;
  state?: string;
  lga?: string;
  ward?: string;
  administrativeArea?: string;
  address?: string;
  phone?: string;
  openingHours?: Record<string, string>;
  programmeCategories?: string[];
  isTemporary?: boolean;
  temporaryUntil?: string;
  isActive?: boolean;
};

export const medfinetFacilityApi = {
  list(orgId: string) {
    return request<MedfinetFacility[]>('/facilities', {
      organizationId: orgId,
      purpose: 'facility-management',
    });
  },
  create(orgId: string, body: FacilityInput & { code: string }) {
    return request<MedfinetFacility>('/facilities', {
      method: 'POST',
      body,
      organizationId: orgId,
      purpose: 'facility-management',
    });
  },
  update(orgId: string, facilityId: string, body: FacilityInput) {
    return request<MedfinetFacility>(
      `/facilities/${encodeURIComponent(facilityId)}`,
      {
        method: 'PATCH',
        body,
        organizationId: orgId,
        purpose: 'facility-management',
      },
    );
  },
};
