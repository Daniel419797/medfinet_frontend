import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetAiApi = {
  askAssistant(orgId: string, childId: string, body: { question: string; locale?: string }) {
    return request<unknown>(`/children/${encodeURIComponent(childId)}/ai/assistant`, {
      method: 'POST', body, organizationId: orgId, purpose: 'ai-assistant-query',
    });
  },

  parseUssdIntake(orgId: string, body: { text: string; locale?: string }) {
    return request<unknown>('/ai/ussd-intake', {
      method: 'POST', body, organizationId: orgId, purpose: 'ai-ussd-parsing',
    });
  },

  detectDuplicates(orgId: string, childId: string, limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return request<unknown>(`/children/${encodeURIComponent(childId)}/ai/duplicates${qs}`, {
      method: 'POST', organizationId: orgId, purpose: 'ai-duplicate-detection',
    });
  },

  detectRewardAnomalies(orgId: string, limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return request<unknown>(`/reward-redemptions/ai-anomalies${qs}`, {
      organizationId: orgId, purpose: 'ai-anomaly-detection',
    });
  },

  summarizeTimeline(orgId: string, childId: string, locale?: string) {
    return request<string>(`/children/${encodeURIComponent(childId)}/ai/timeline-summary`, {
      method: 'POST', body: { locale: locale || 'en' }, organizationId: orgId, purpose: 'ai-timeline-summary',
    });
  },

  suggestMapping(orgId: string, body: {
    connectionType: string; resourceType: string; sourceFields: string[]; targetFields: string[];
  }) {
    return request<unknown>('/integration-mapping-assist', {
      method: 'POST', body, organizationId: orgId, purpose: 'ai-mapping-assist',
    });
  },

  generateTranslation(orgId: string, body: {
    contentKey: string; value: string; sourceLocale: string; targetLocale: string;
  }) {
    return request<unknown>('/localization/ai/translate', {
      method: 'POST', body, organizationId: orgId, purpose: 'ai-translation',
    });
  },
};
