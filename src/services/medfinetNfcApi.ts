import { medfinetRequest as request } from './medfinetApiClient';

export type NfcManifest = {
  hardwareFamily: 'NTAG_215';
  ndefUrlTemplate: string;
  type2UserMemoryHex: string;
  firstUserPage: number;
  finalUserPage: number;
  mirror: {
    mode: 'UID_AND_COUNTER';
    page: number;
    byte: number;
    uidCharacters: 14;
    separator: 'x';
    counterCharacters: 6;
  };
  protection: {
    protectWritesFromPage: number;
    protectReads: false;
    enableCounter: true;
    authenticationAttemptLimit: number;
    lockConfiguration: true;
  };
  stationPlan: {
    specification: string;
    writeCommand: 'A2';
    readSignatureCommand: '3C00';
    pages: {
      configuration: number;
      access: number;
      password: number;
      pack: number;
    };
    configurationPageHex: string;
    accessPageBeforeLockHex: string;
    accessPageFinalHex: string;
    passwordAndPackByteOrder: string;
    requiresFieldRemovalBeforeLockVerification: boolean;
    irreversibleConfigurationLock: boolean;
  };
};

export type NfcDraft = {
  credential: { id: string; childId: string; kind: 'NFC'; status: string };
  binding: { id: string; publicId: string; status: string };
  personalizationToken: string;
  cardToken: string;
  manifest: NfcManifest;
};

export type NfcPreparation = {
  binding: { id: string; status: string; preparedAt: string };
  access: { passwordHex: string; packHex: string };
  protection: NfcManifest['protection'];
};

export type NfcTagWriterCard = {
  credential: { id: string; childId: string; kind: 'NFC'; status: string };
  binding: {
    id: string;
    publicId: string;
    hardwareFamily: 'NTAG_215_TAGWRITER_DEMO';
    status: 'ACTIVE';
  };
  tagWriterUrl: string;
  assurance: 'AUTHENTICATED_STATIC_NDEF_DEMO';
  limitations: string[];
};

export type NfcImmunizationRecord = {
  id: string;
  vaccineCode: string;
  doseNumber: number;
  administeredAt: string;
  status: string;
};

export type NfcAccessIntent = 'IMMUNIZATION_CERTIFICATES';

export type NfcScanResult = {
  organizationId: string;
  accessIntent: 'CLINICAL_SUMMARY' | NfcAccessIntent;
  assurance: string;
  child: {
    id: string;
    identityRedacted?: boolean;
    medfinetId?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    sex?: string;
  };
  limitations: string[];
  clinicalSummary: {
    clinicalAccess: 'ALLOWED' | 'CONSENT_REQUIRED';
    allergies: Array<{
      id: string;
      substanceDisplay: string;
      reaction?: string;
      severity: string;
      criticality: string;
    }>;
    vaccination: {
      dueCount: number;
      overdueCount: number;
      recordedDoses: number;
      recommendations: Array<{
        vaccineCode: string;
        doseNumber: number;
        status: string;
        dueAt: string;
      }>;
      records?: NfcImmunizationRecord[];
    };
    consent: { status: string; expiresAt: string | null };
  };
  actions: {
    clinicalRecord?: string;
    recordVaccination?: string;
    emergencyAccess: string;
  };
};

export type NfcChallengeDevice = {
  deviceIdentifier: string;
  displayName: string;
  platform: string;
  appVersion: string;
  publicKey: string;
};

const NFC_VACCINE_ACCESS_PURPOSE = 'vaccination-certificate-download';

export const medfinetNfcApi = {
  createDraft(
    organizationId: string,
    childId: string
  ): Promise<NfcDraft> {
    return request(`/children/${encodeURIComponent(childId)}/nfc-bindings`, {
      method: 'POST',
      body: {},
      organizationId,
      purpose: 'secure-card-provisioning',
    });
  },

  createTagWriterDemo(
    organizationId: string,
    childId: string
  ): Promise<NfcTagWriterCard> {
    return request(
      `/children/${encodeURIComponent(childId)}/nfc-bindings/tagwriter-demo`,
      {
        method: 'POST',
        body: {},
        organizationId,
        purpose: 'tagwriter-demo-card-provisioning',
      }
    );
  },

  prepare(
    organizationId: string,
    bindingId: string,
    body: {
      personalizationToken: string;
      versionResponse: string;
      uid: string;
      originalitySignature: string;
      originalityVerified: boolean;
      deviceId: string;
      deviceSignature: string;
    }
  ): Promise<NfcPreparation> {
    return request(`/nfc-bindings/${encodeURIComponent(bindingId)}/prepare`, {
      method: 'POST',
      body,
      organizationId,
      purpose: 'secure-card-provisioning',
    });
  },

  activate(
    organizationId: string,
    bindingId: string,
    body: {
      personalizationToken: string;
      cardToken: string;
      uc: string;
      ndefReadback: string;
      configurationPageHex: string;
      accessPageHex: string;
      packResponseHex: string;
      writeProtected: boolean;
      configurationLocked: boolean;
      deviceId: string;
      deviceSignature: string;
    }
  ) {
    return request(`/nfc-bindings/${encodeURIComponent(bindingId)}/activate`, {
      method: 'POST',
      body,
      organizationId,
      purpose: 'secure-card-activation',
    });
  },

  verifyPublicTap(publicId: string, uc: string, token: string) {
    return request<{
      recognized: boolean;
      status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'REPLACED' | 'EXPIRED';
      hardwareFamily: 'NTAG_215' | 'NTAG_215_TAGWRITER_DEMO';
      assurance: 'BASIC_NDEF' | 'BASIC_STATIC_NDEF_DEMO';
      scannerRequired: boolean;
      message: string;
    }>(
      `/public/nfc/taps/${encodeURIComponent(publicId)}/recognize`,
      {
        method: 'POST',
        body: { uc, t: token },
        authenticated: false,
      }
    );
  },

  createChallenge(
    publicId: string,
    device: string | NfcChallengeDevice,
    accessIntent?: NfcAccessIntent,
  ) {
    return request<{
      challengeToken: string;
      expiresAt: string;
      deviceId: string;
      organizationId: string;
      accessIntent: 'CLINICAL_SUMMARY' | NfcAccessIntent;
    }>(
      '/nfc/scans/challenges',
      {
        method: 'POST',
        body: {
          publicId,
          ...(typeof device === 'string'
            ? { deviceId: device }
            : { device }),
          ...(accessIntent ? { accessIntent } : {}),
        },
        purpose: accessIntent === 'IMMUNIZATION_CERTIFICATES'
          ? NFC_VACCINE_ACCESS_PURPOSE
          : 'nfc-card-resolution',
      }
    );
  },

  resolveScan(body: {
    challengeToken: string;
    publicId: string;
    cardToken: string;
    uc: string;
    originalitySignature?: string;
    scanMode?: 'PWA_NDEF' | 'TAGWRITER_NDEF' | 'NATIVE_RAW';
    accessIntent?: NfcAccessIntent;
    deviceSignature: string;
  }) {
    return request<NfcScanResult>('/nfc/scans/resolve', {
      method: 'POST',
      body,
      purpose: body.accessIntent === 'IMMUNIZATION_CERTIFICATES'
        ? NFC_VACCINE_ACCESS_PURPOSE
        : 'nfc-card-resolution',
    });
  },

  registerDevice(
    organizationId: string,
    body: {
      deviceIdentifier: string;
      displayName: string;
      platform: string;
      appVersion: string;
      publicKey: string;
    }
  ) {
    return request<{ device: { id: string; displayName: string }; existing: boolean }>(
      '/devices',
      {
        method: 'POST',
        body,
        organizationId,
        purpose: 'nfc-scanner-registration',
      }
    );
  },

  setProvisioningCapability(
    organizationId: string,
    deviceId: string,
    enabled: boolean
  ) {
    return request(`/devices/${encodeURIComponent(deviceId)}/nfc-provisioning-capability`, {
      method: 'POST',
      body: { enabled },
      organizationId,
      purpose: 'nfc-station-approval',
    });
  },

  revokeDevice(organizationId: string, deviceId: string, reason: string) {
    return request(`/devices/${encodeURIComponent(deviceId)}/revoke`, {
      method: 'POST', body: { status: 'REVOKED', reason }, organizationId,
      purpose: 'device-administration',
    });
  },

  revokeBinding(organizationId: string, bindingId: string, reason: string) {
    return request(`/nfc-bindings/${encodeURIComponent(bindingId)}/revoke`, {
      method: 'POST', body: { reason }, organizationId,
      purpose: 'secure-card-lifecycle',
    });
  },

  replaceBinding(organizationId: string, bindingId: string, reason: string, expiresAt?: string) {
    return request<NfcDraft>(`/nfc-bindings/${encodeURIComponent(bindingId)}/replace`, {
      method: 'POST', body: { reason, expiresAt }, organizationId,
      purpose: 'secure-card-lifecycle',
    });
  },

  cancelProvisioning(organizationId: string, bindingId: string, reason: string) {
    return request(`/nfc-bindings/${encodeURIComponent(bindingId)}/cancel`, {
      method: 'POST',
      body: { reason },
      organizationId,
      purpose: 'secure-card-provisioning',
    });
  },

  listChildBindings(organizationId: string, childId: string) {
    return request<Array<{
      id: string;
      publicId: string;
      hardwareFamily: 'NTAG_215' | 'NTAG_215_TAGWRITER_DEMO';
      status: 'PENDING' | 'ACTIVE' | 'FAILED' | 'REVOKED';
      provisioningExpiresAt: string;
      createdAt: string;
      credential: { id: string; status: string; expiresAt: string | null };
    }>>(`/children/${encodeURIComponent(childId)}/nfc-bindings`, {
      organizationId,
      purpose: 'secure-card-provisioning',
    });
  },

  operationsSummary(organizationId: string) {
    return request<{
      generatedAt: string;
      bindings: Partial<Record<'PENDING' | 'ACTIVE' | 'FAILED' | 'REVOKED', number>>;
      pendingChallenges: number;
      scansLast24Hours: Record<string, number>;
    }>('/nfc/operations/summary', {
      organizationId,
      purpose: 'nfc-operations-monitoring',
    });
  },
};
