import { medfinetRequest as request } from './medfinetApiClient';

export type AnalyticsPolicy = {
  id: string; isPublicEnabled: boolean; minimumCellSize: number;
  maximumGeography: 'NATIONAL' | 'STATE' | 'LGA'; publicOrganizationName: string | null;
  approvedAt?: string | null; updatedAt: string;
};
export type AnalyticsMetric = {
  key: string; label?: string; description?: string; numerator: number; denominator?: number | null;
  valueBasisPoints?: number | null; cohortSize: number; disclosureStatus: string;
  suppressionReason?: string | null;
};
export type LatestAnalytics = {
  run: null | { id: string; status: string; periodStart: string; periodEnd: string; completedAt: string; metricCount: number };
  metrics: AnalyticsMetric[];
};

export const medfinetAnalyticsApi = {
  getPolicy(orgId: string) {
    return request<AnalyticsPolicy | null>('/analytics/publication-policy', { organizationId: orgId, purpose: 'analytics-view' });
  },
  updatePolicy(orgId: string, body: { minimumCellSize: number; maximumGeography: AnalyticsPolicy['maximumGeography']; isPublicEnabled: boolean; publicOrganizationName?: string }) {
    return request<AnalyticsPolicy>('/analytics/publication-policy', { method: 'PUT', body, organizationId: orgId, purpose: 'analytics-management' });
  },
  requestGeneration(orgId: string, body: { periodStart: string; periodEnd: string; idempotencyKey: string }) {
    return request<{ run: { id: string; status: string }; idempotentReplay: boolean }>('/analytics/generation-runs', { method: 'POST', body, organizationId: orgId, purpose: 'analytics-management' });
  },
  getLatest(orgId: string) {
    return request<LatestAnalytics>('/analytics/latest', { organizationId: orgId, purpose: 'analytics-view' });
  },
  getNarrative(orgId: string) {
    return request<{ narrative: string; generatedAt: string; metricsUsed: string[] }>(
      '/analytics/narrative', { organizationId: orgId, purpose: 'analytics-view' },
    );
  },
};
