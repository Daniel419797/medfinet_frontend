import { medfinetRequest } from './medfinetApiClient';

export type IntegrationPage<T> = { items: T[]; nextCursor: string | null };
export type IntegrationConnection = {
  id: string; name: string; partnerIdentifier: string; type: 'FHIR_R4' | 'DHIS2';
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED'; baseUrl: string;
  authType: 'BEARER_TOKEN' | 'BASIC' | 'OAUTH2_CLIENT_CREDENTIALS';
  fhirVersion?: string | null; dhis2ApiVersion?: string | null;
  allowedDataCategories: string[]; timeoutMs: number; lastHealthStatus?: string | null;
  lastHealthCheckedAt?: string | null; lastHealthErrorCode?: string | null;
};
export type IntegrationMapping = {
  id: string; connectionId: string; resourceType: string; direction: 'IMPORT' | 'EXPORT';
  version: number; status: 'DRAFT' | 'ACTIVE' | 'RETIRED'; mappingDefinition: Record<string, unknown>;
  createdAt: string;
};
export type IntegrationImport = {
  id: string; jobId: string; recordKey: string; externalResourceType: string;
  externalResourceId: string; payloadHash: string; status: string;
  reviewedBySubjectId?: string | null; reviewedAt?: string | null; reviewReason?: string | null;
  appliedResourceType?: string | null; appliedResourceId?: string | null; createdAt: string;
};
export type IntegrationJob = {
  id: string; connectionId: string; mappingId: string; direction: 'IMPORT' | 'EXPORT';
  resourceType: string; status: string; criteria?: Record<string, unknown>;
  recordsDiscovered: number; recordsSucceeded: number; recordsFailed: number;
  lastErrorCode?: string | null; createdAt: string; startedAt?: string | null;
  completedAt?: string | null; failedAt?: string | null; updatedAt: string;
};
export type IntegrationReconciliation = {
  id: string; connectionId: string; jobId?: string | null; status: string;
  localCount: number; externalCount: number; matchedCount: number;
  missingLocalCount: number; missingExternalCount: number; mismatchCount: number;
  startedAt: string; completedAt?: string | null; failedAt?: string | null; errorCode?: string | null;
  connection: { id: string; name: string; type: string };
  job?: { id: string; resourceType: string; status: string } | null;
};

const org = (organizationId: string) => ({ organizationId, purpose: 'integration-administration' });

export const medfinetIntegrationsApi = {
  listConnections: (organizationId: string) => medfinetRequest<IntegrationPage<IntegrationConnection>>('/integration-connections?limit=100', org(organizationId)),
  createConnection: (organizationId: string, body: {
    name: string; partnerIdentifier: string; type: IntegrationConnection['type']; baseUrl: string;
    authType: IntegrationConnection['authType']; credentialSecretName: string; fhirVersion?: string;
    dhis2ApiVersion?: string; allowedDataCategories: string[]; timeoutMs: number;
  }) => medfinetRequest<IntegrationConnection>('/integration-connections', { ...org(organizationId), method: 'POST', body }),
  checkHealth: (organizationId: string, connectionId: string) => medfinetRequest<IntegrationConnection>(`/integration-connections/${connectionId}/health`, { ...org(organizationId), method: 'POST' }),
  activateConnection: (organizationId: string, connectionId: string) => medfinetRequest<IntegrationConnection>(`/integration-connections/${connectionId}/activate`, { ...org(organizationId), method: 'POST' }),
  suspendConnection: (organizationId: string, connectionId: string, reason: string) => medfinetRequest<IntegrationConnection>(`/integration-connections/${connectionId}/suspend`, { ...org(organizationId), method: 'POST', body: { reason } }),
  listMappings: (organizationId: string, connectionId: string) => medfinetRequest<IntegrationPage<IntegrationMapping>>(`/integration-connections/${connectionId}/mappings?limit=100`, org(organizationId)),
  createMapping: (organizationId: string, connectionId: string, body: Omit<IntegrationMapping, 'id' | 'connectionId' | 'status' | 'createdAt'>) => medfinetRequest<IntegrationMapping>(`/integration-connections/${connectionId}/mappings`, { ...org(organizationId), method: 'POST', body }),
  activateMapping: (organizationId: string, mappingId: string) => medfinetRequest<IntegrationMapping>(`/integration-mappings/${mappingId}/activate`, { ...org(organizationId), method: 'POST' }),
  startJob: (organizationId: string, connectionId: string, body: { mappingId: string; direction: 'IMPORT' | 'EXPORT'; criteria: Record<string, unknown>; idempotencyKey: string }) => medfinetRequest<{ job: IntegrationJob; idempotentReplay: boolean }>(`/integration-connections/${connectionId}/jobs`, { ...org(organizationId), method: 'POST', body }),
  getJob: (organizationId: string, jobId: string) => medfinetRequest<IntegrationJob>(`/integration-jobs/${jobId}`, org(organizationId)),
  listJobs: (organizationId: string, connectionId?: string) => medfinetRequest<IntegrationPage<IntegrationJob>>(`/integration-jobs?limit=100${connectionId ? `&connectionId=${encodeURIComponent(connectionId)}` : ''}`, org(organizationId)),
  cancelJob: (organizationId: string, jobId: string, reason: string) => medfinetRequest<IntegrationJob>(`/integration-jobs/${jobId}/cancel`, { ...org(organizationId), method: 'POST', body: { reason } }),
  listImports: (organizationId: string, status?: string) => medfinetRequest<IntegrationPage<IntegrationImport>>(`/integration-imports?limit=100${status ? `&status=${encodeURIComponent(status)}` : ''}`, org(organizationId)),
  revealImport: (organizationId: string, stagingId: string) => medfinetRequest<{ id: string; resourceType: string; payload: unknown; payloadHash: string }>(`/integration-imports/${stagingId}`, org(organizationId)),
  rejectImport: (organizationId: string, stagingId: string, reason: string) => medfinetRequest<IntegrationImport>(`/integration-imports/${stagingId}/reject`, { ...org(organizationId), method: 'POST', body: { reason } }),
  applyImport: (organizationId: string, stagingId: string) => medfinetRequest<IntegrationImport>(`/integration-imports/${stagingId}/apply`, { ...org(organizationId), method: 'POST' }),
  startReconciliation: (organizationId: string, connectionId: string, jobId: string) => medfinetRequest<{ id: string; status: string }>(`/integration-connections/${connectionId}/reconciliations`, { ...org(organizationId), method: 'POST', body: { jobId } }),
  listReconciliations: (organizationId: string, connectionId?: string) => medfinetRequest<IntegrationPage<IntegrationReconciliation>>(`/integration-reconciliations?limit=100${connectionId ? `&connectionId=${encodeURIComponent(connectionId)}` : ''}`, org(organizationId)),
  getReconciliation: (organizationId: string, reconciliationId: string) => medfinetRequest<IntegrationReconciliation>(`/integration-reconciliations/${reconciliationId}`, org(organizationId)),
};
