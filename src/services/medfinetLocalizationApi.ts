import { medfinetRequest } from './medfinetApiClient';

export type LocalizationContent = {
  id: string; contentKey: string; locale: 'en' | 'ha' | 'yo' | 'ig'; value: string;
  translatorNote?: string | null; version: number; status: 'DRAFT' | 'ACTIVE' | 'RETIRED';
  createdBySubjectId: string; approvedBySubjectId?: string | null; approvedAt?: string | null;
  createdAt: string; updatedAt: string;
};
export type LocalizationCatalog = {
  locale: string; fallbackLocale: 'en'; messages: Record<string, string>;
  versions: Record<string, { locale: string; version: number; approvedAt: string }>;
};

export const medfinetLocalizationApi = {
  listContent: (organizationId: string) => medfinetRequest<{ items: LocalizationContent[] }>('/localization/content?limit=200', { organizationId, purpose: 'localization-administration' }),
  getCatalog: (organizationId: string, locale: string) => medfinetRequest<LocalizationCatalog>(`/localization/catalogs/${locale}`, { organizationId, purpose: 'localization-view' }),
  createDraft: (organizationId: string, body: { contentKey: string; locale: string; value: string; translatorNote?: string }) => medfinetRequest<LocalizationContent>('/localization/content', { method: 'POST', body, organizationId, purpose: 'localization-administration' }),
  activate: (organizationId: string, contentId: string) => medfinetRequest<LocalizationContent>(`/localization/content/${contentId}/activate`, { method: 'POST', organizationId, purpose: 'localization-administration' }),
};
