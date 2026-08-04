import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetPublicApi = {
  getSupportedLocales() {
    return request<{ locales: Array<{ code: string; name: string; nativeName: string }> }>(
      '/public/locales', { authenticated: false, purpose: 'localization' },
    );
  },
  getOrganizationMetrics(slug: string) {
    return request<{ organization: { name: string; slug: string }; metrics: Record<string, unknown> }>(
      `/public/organizations/${encodeURIComponent(slug)}/metrics`,
      { authenticated: false, purpose: 'public-analytics' },
    );
  },
};
