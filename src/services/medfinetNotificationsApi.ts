import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetNotificationsApi = {
  // Templates
  listTemplates(orgId: string) {
    return request<{ items: Array<{
      id: string; key: string; channel: string; locale: string; status: string; version: number;
      subject?: string; body: string; variableNames: string[]; createdAt: string;
    }>; nextCursor?: string }>('/notification-templates', { organizationId: orgId, purpose: 'notification-management' });
  },
  createTemplate(orgId: string, body: {
    key: string; version: number; channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'; locale: string;
    subject?: string; body: string; variableNames: string[];
  }) {
    return request<{ id: string }>('/notification-templates', {
      method: 'POST', body, organizationId: orgId, purpose: 'notification-management',
    });
  },
  activateTemplate(orgId: string, templateId: string) {
    return request(`/notification-templates/${encodeURIComponent(templateId)}/activate`, {
      method: 'POST', organizationId: orgId, purpose: 'notification-management',
    });
  },

  // Preferences
  upsertPreference(orgId: string, body: {
    subjectId?: string; category: string; channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
    enabled: boolean; locale: string; timezone: string; quietHoursStart?: number | null; quietHoursEnd?: number | null;
  }) {
    return request('/notification-preferences', {
      method: 'PUT', body, organizationId: orgId, purpose: 'notification-preference',
    });
  },
  listPreferences(orgId: string) {
    return request<Array<{
      id: string; subjectId: string; category: string; channel: string; enabled: boolean;
      locale: string; timezone: string; quietHoursStart?: number; quietHoursEnd?: number;
    }>>('/notification-preferences', { organizationId: orgId, purpose: 'notification-view' });
  },

  // Inbox
  listInbox(orgId: string) {
    return request<Array<{
      id: string; subjectId: string; title: string; body: string; channel: string;
      status: string; readAt?: string; createdAt: string;
    }>>('/notifications', { organizationId: orgId, purpose: 'notification-view' });
  },
  markRead(orgId: string, messageId: string) {
    return request(`/notifications/${encodeURIComponent(messageId)}/read`, {
      method: 'POST', organizationId: orgId, purpose: 'notification-read',
    });
  },
};
