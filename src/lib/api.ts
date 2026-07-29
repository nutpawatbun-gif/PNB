/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsItem, Course, CalendarEvent, DownloadableFile, DocumentCategory, AcademicWork, BannerItem, HomepageSection, AnnouncementItem, StaffMember, MediaFile, MediaFolder, MediaStorageSettings, MediaUsageReference, ContentRevision, DashboardNotification } from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('mcu_admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const fullUrl = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  
  // 1. Try direct route e.g. /api/news
  const res1 = await fetch(fullUrl, init).catch(() => null);
  
  if (res1) {
    const contentType = res1.headers.get('content-type') || '';
    // If res1 returned JSON or explicit status from backend (200 OK, 400, 401, 403, 405, 429, 500 etc)
    if (res1.ok || contentType.includes('application/json') || [400, 401, 403, 405, 422, 429, 500].includes(res1.status)) {
      return res1;
    }
  }

  // 2. Fallback to /api.php?action=... for web hosts using php wrapper
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const parts = cleanPath.split('?');
  const action = parts[0];
  const query = parts[1] ? `&${parts[1]}` : '';
  const phpUrl = `/api.php?action=${action}${query}`;

  const res2 = await fetch(phpUrl, init).catch(() => null);
  if (res2) {
    const contentType = res2.headers.get('content-type') || '';
    if (res2.ok || contentType.includes('application/json')) {
      return res2;
    }
  }

  // Return whichever real response was captured or safe mock
  return res1 || res2 || new Response(JSON.stringify({ error: 'Network or API connection error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    if (response.status === 401 && localStorage.getItem('mcu_admin_token')) {
      localStorage.removeItem('mcu_admin_token');
      localStorage.removeItem('mcu_admin_user');
      window.dispatchEvent(new Event('mcu_auth_unauthorized'));
    }
    if (response.status === 405) {
      const msg = (data && data.error) || 'HTTP Status 405 (Method Not Allowed): เครื่องโฮสต์ระงับคำขอ POST/PUT/DELETE กรุณาตรวจสอบการตั้งค่า Nginx / Web Server Reverse Proxy';
      const error: any = new Error(msg);
      error.status = 405;
      error.data = data;
      throw error;
    }
    if (response.status === 404) {
      console.warn(`API 404 Not Found: ${response.url}`);
      return (data && typeof data === 'object' ? data : []) as unknown as T;
    }
    const error: any = new Error((data && data.error && data.error.message) || (data && data.error) || `HTTP error! status: ${response.status}`);
    error.data = data;
    error.status = response.status;
    throw error;
  }

  if (!data) {
    return {} as T;
  }

  if (data && typeof data === 'object' && 'success' in data && 'data' in data && data.data !== undefined) {
    return data.data as T;
  }
  return data as T;
}

export const api = {
  // Auth & Security
  async getCaptcha() {
    return handleResponse<{ captchaId: string; question: string }>(
      await apiFetch('/auth/captcha')
    );
  },

  async register(payload: { name: string; email: string; department?: string; requestedRole?: string; password?: string }) {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ message: string; user: any }>(res);
  },

  async login(identifier: string, password: string, captchaId?: string, captchaAnswer?: string) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, username: identifier, password, captchaId, captchaAnswer }),
    });
    const data = await handleResponse<{ 
      token?: string; 
      user?: any; 
      mustChangePassword?: boolean;
      requires2FA?: boolean;
      temp2FAToken?: string;
      message?: string;
    }>(res);

    if (data && data.token && data.user) {
      localStorage.setItem('mcu_admin_token', data.token);
      localStorage.setItem('mcu_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  async googleLogin(credential: string, requestedRole?: string) {
    const res = await apiFetch('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, requestedRole }),
    });
    const data = await handleResponse<{ 
      token?: string; 
      user?: any; 
      status?: string;
      message?: string;
    }>(res);

    if (data && data.token && data.user) {
      localStorage.setItem('mcu_admin_token', data.token);
      localStorage.setItem('mcu_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  async verify2FALogin(temp2FAToken: string, otpCode: string) {
    const data = await handleResponse<{
      token: string;
      user: any;
      mustChangePassword?: boolean;
    }>(
      await apiFetch('/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp2FAToken, otpCode }),
      })
    );
    if (data.token && data.user) {
      localStorage.setItem('mcu_admin_token', data.token);
      localStorage.setItem('mcu_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  async forceChangePassword(newPassword: string, confirmPassword: string) {
    const data = await handleResponse<{ message: string; user: any }>(
      await apiFetch('/auth/force-change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword, confirmPassword }),
      })
    );
    if (data.user) {
      localStorage.setItem('mcu_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return handleResponse<{ message: string }>(
      await apiFetch('/auth/change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      })
    );
  },

  async forgotPassword(identifier: string) {
    return handleResponse<{ message: string; resetToken?: string; demoNotice?: string }>(
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
    );
  },

  async resetPassword(resetToken: string, newPassword: string) {
    return handleResponse<{ message: string }>(
      await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      })
    );
  },

  async getActiveSessions() {
    return handleResponse<any[]>(
      await fetch(`${API_BASE}/auth/sessions`, { headers: getHeaders() })
    );
  },

  async revokeSession(sessionId: string) {
    return handleResponse<{ message: string }>(
      await fetch(`${API_BASE}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  async revokeOtherSessions() {
    return handleResponse<{ message: string }>(
      await fetch(`${API_BASE}/auth/revoke-other-sessions`, {
        method: 'POST',
        headers: getHeaders(),
      })
    );
  },

  async getLoginHistory() {
    return handleResponse<any[]>(
      await fetch(`${API_BASE}/auth/login-history`, { headers: getHeaders() })
    );
  },

  async setup2FA() {
    return handleResponse<{ secret: string; otpauthUrl: string; backupCodes: string[] }>(
      await fetch(`${API_BASE}/auth/2fa/setup`, {
        method: 'POST',
        headers: getHeaders(),
      })
    );
  },

  async enable2FA(secret: string, verificationCode: string, backupCodes: string[]) {
    return handleResponse<{ message: string }>(
      await fetch(`${API_BASE}/auth/2fa/enable`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ secret, verificationCode, backupCodes }),
      })
    );
  },

  async disable2FA(password: string) {
    return handleResponse<{ message: string }>(
      await fetch(`${API_BASE}/auth/2fa/disable`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password }),
      })
    );
  },

  logout() {
    const token = localStorage.getItem('mcu_admin_token');
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.error('Logout error:', err));
    }
    localStorage.removeItem('mcu_admin_token');
    localStorage.removeItem('mcu_admin_user');
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem('mcu_admin_user');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to parse current user from localStorage:', e);
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('mcu_admin_token');
    return !!token && token !== 'undefined' && token.trim().length > 0;
  },

  // Dashboard Stats
  async getStats() {
    try {
      return await handleResponse<{
        newsCount: number;
        eventsCount: number;
        coursesCount: number;
        downloadsCount: number;
        academicWorksCount: number;
        applicantsCount: number;
        usersCount: number;
        publishedCount: number;
        draftCount: number;
        recentLogs: any[];
      }>(await apiFetch('/stats/summary', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch stats:', e);
      return { newsCount: 0, eventsCount: 0, coursesCount: 0, downloadsCount: 0, academicWorksCount: 0, applicantsCount: 0, usersCount: 0, publishedCount: 0, draftCount: 0, recentLogs: [] };
    }
  },

  // Menus Management
  async getMenus() {
    try {
      return await handleResponse<any[]>(await apiFetch('/menus', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch menus from API:', e);
      return [];
    }
  },

  async createMenu(menu: any) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/menus`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(menu),
      })
    );
  },

  async updateMenu(id: string, menu: any) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/menus/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(menu),
      })
    );
  },

  async deleteMenu(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/menus/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  async reorderMenus(reorderedMenus: any[]) {
    return handleResponse<{ success: boolean; menus: any[] }>(
      await fetch(`${API_BASE}/menus/reorder`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reorderedMenus }),
      })
    );
  },

  // Homepage Layout Builder
  async getHomepageSections() {
    try {
      const res = await apiFetch('/homepage-sections', { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json().catch(() => []);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Failed to fetch homepage sections, using defaults', e);
      return [];
    }
  },

  async reorderHomepageSections(reorderedSections: HomepageSection[]) {
    return handleResponse<{ success: boolean; sections: HomepageSection[] }>(
      await fetch(`${API_BASE}/homepage-sections/reorder`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reorderedSections }),
      })
    );
  },

  async updateHomepageSection(id: string, data: Partial<HomepageSection>) {
    return handleResponse<HomepageSection>(
      await fetch(`${API_BASE}/homepage-sections/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    );
  },


  // News Management
  async getNews(params?: { status?: string; category?: string; tag?: string; search?: string; isFeatured?: boolean; preview?: boolean; includeDrafts?: boolean }) {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.category) query.append('category', params.category);
      if (params?.tag) query.append('tag', params.tag);
      if (params?.search) query.append('search', params.search);
      if (params?.isFeatured) query.append('isFeatured', 'true');
      if (params?.preview) query.append('preview', 'true');
      if (params?.includeDrafts) query.append('includeDrafts', 'true');
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await handleResponse<NewsItem[]>(await apiFetch(`/news${queryString}`, { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch news from API:', e);
      return [];
    }
  },

  async getNewsById(idOrSlug: string, preview?: boolean) {
    const queryString = preview ? '?preview=true' : '';
    return handleResponse<NewsItem>(await fetch(`${API_BASE}/news/${idOrSlug}${queryString}`, { headers: getHeaders() }));
  },

  async incrementNewsView(id: string) {
    return handleResponse<{ success: boolean; viewCount: number }>(
      await fetch(`${API_BASE}/news/${id}/view`, { method: 'POST', headers: getHeaders() })
    );
  },

  async createNews(news: Partial<NewsItem>) {
    return handleResponse<NewsItem>(
      await fetch(`${API_BASE}/news`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(news),
      })
    );
  },

  async updateNews(id: string, news: Partial<NewsItem>) {
    return handleResponse<NewsItem>(
      await fetch(`${API_BASE}/news/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(news),
      })
    );
  },

  async updateNewsStatus(id: string, status: string) {
    return handleResponse<NewsItem>(
      await fetch(`${API_BASE}/news/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      })
    );
  },

  async deleteNews(id: string) {
    return handleResponse<{ success: boolean; item?: any; deleted?: any; message?: string }>(
      await fetch(`${API_BASE}/news/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // News Categories
  async getNewsCategories() {
    return handleResponse<any[]>(await fetch(`${API_BASE}/news/categories`, { headers: getHeaders() }));
  },

  async createNewsCategory(cat: { nameTh: string; nameEn?: string; color?: string; description?: string }) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/news/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cat),
      })
    );
  },

  async updateNewsCategory(id: string, cat: any) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/news/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(cat),
      })
    );
  },

  async deleteNewsCategory(id: string) {
    return handleResponse<{ success: boolean }>(
      await fetch(`${API_BASE}/news/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // News Tags
  async getNewsTags() {
    return handleResponse<any[]>(await fetch(`${API_BASE}/news/tags`, { headers: getHeaders() }));
  },

  async createNewsTag(name: string) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/news/tags`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name }),
      })
    );
  },

  async deleteNewsTag(id: string) {
    return handleResponse<{ success: boolean }>(
      await fetch(`${API_BASE}/news/tags/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // Events
  async getEvents() {
    try {
      return await handleResponse<CalendarEvent[]>(await apiFetch('/events', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch events from API:', e);
      return [];
    }
  },

  async createEvent(event: Omit<CalendarEvent, 'id'>) {
    return handleResponse<CalendarEvent>(
      await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(event),
      })
    );
  },

  async updateEvent(id: string, event: Partial<CalendarEvent>) {
    return handleResponse<CalendarEvent>(
      await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(event),
      })
    );
  },

  async deleteEvent(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // Courses
  async getCourses() {
    try {
      return await handleResponse<Course[]>(await apiFetch('/courses', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch courses from API:', e);
      return [];
    }
  },

  async createCourse(course: Omit<Course, 'id'>) {
    return handleResponse<Course>(
      await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(course),
      })
    );
  },

  async updateCourse(id: string, course: Partial<Course>) {
    return handleResponse<Course>(
      await fetch(`${API_BASE}/courses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(course),
      })
    );
  },

  async deleteCourse(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // Download Categories
  async getDownloadCategories() {
    return handleResponse<DocumentCategory[]>(await fetch(`${API_BASE}/download-categories`, { headers: getHeaders() }));
  },

  async createDownloadCategory(cat: Omit<DocumentCategory, 'id'>) {
    return handleResponse<DocumentCategory>(
      await fetch(`${API_BASE}/download-categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cat),
      })
    );
  },

  async updateDownloadCategory(id: string, cat: Partial<DocumentCategory>) {
    return handleResponse<DocumentCategory>(
      await fetch(`${API_BASE}/download-categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(cat),
      })
    );
  },

  async deleteDownloadCategory(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/download-categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // Downloads Files
  async getDownloads() {
    return handleResponse<DownloadableFile[]>(await fetch(`${API_BASE}/downloads`, { headers: getHeaders() }));
  },

  async createDownload(doc: Omit<DownloadableFile, 'id'>) {
    return handleResponse<DownloadableFile>(
      await fetch(`${API_BASE}/downloads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(doc),
      })
    );
  },

  async updateDownload(id: string, doc: Partial<DownloadableFile>) {
    return handleResponse<DownloadableFile>(
      await fetch(`${API_BASE}/downloads/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(doc),
      })
    );
  },

  async replaceDownloadFile(id: string, fileData: { url: string; size: string; format: string; version?: string }) {
    return handleResponse<DownloadableFile>(
      await fetch(`${API_BASE}/downloads/${id}/replace`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(fileData),
      })
    );
  },

  async incrementDownloadCount(id: string) {
    return handleResponse<{ success: boolean; downloadCount: number }>(
      await fetch(`${API_BASE}/downloads/${id}/increment`, {
        method: 'POST',
        headers: getHeaders(),
      })
    );
  },

  async incrementDownload(id: string) {
    return this.incrementDownloadCount(id);
  },

  async deleteDownload(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/downloads/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // Applicants & Admission Projects System
  async getAdmissions() {
    try {
      const res = await apiFetch('/admissions', { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await handleResponse<any[]>(res);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Failed to fetch admissions', e);
      return [];
    }
  },

  async getAdmissionProjects() {
    return this.getAdmissions();
  },

  async getApplicants() {
    try {
      const res = await apiFetch('/admissions/applicants', { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await handleResponse<any[]>(res);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Failed to fetch applicants', e);
      return [];
    }
  },

  async submitApplication(applicant: any) {
    return handleResponse<any>(
      await apiFetch('/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicant),
      })
    );
  },

  async createApplicant(applicant: any) {
    return this.submitApplication(applicant);
  },

  async updateApplicantStatus(id: string, status: string, note?: string) {
    return handleResponse<any>(
      await apiFetch(`/admissions/applicants/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, note }),
      })
    );
  },

  async updateApplicant(id: string, applicant: any) {
    return this.updateApplicantStatus(id, applicant?.status || 'pending', applicant?.note);
  },

  async deleteApplicant(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await apiFetch(`/applicants/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  async trackApplicant(query: string) {
    return handleResponse<any>(
      await apiFetch(`/admissions/track/${encodeURIComponent(query)}`)
    );
  },

  async uploadAdmissionDocument(fileName: string, fileData: string, docType: string) {
    return handleResponse<{ fileName: string; originalName: string; fileUrl: string; size: number }>(
      await apiFetch('/upload/admission-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileData, docType }),
      })
    );
  },

  exportApplicantsCSVUrl() {
    return '/api/admissions/export/csv';
  },

  async createAdmissionProject(project: any) {
    return handleResponse<any>(
      await apiFetch('/admissions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(project),
      })
    );
  },

  async updateAdmissionProject(id: string, project: any) {
    return handleResponse<any>(
      await apiFetch(`/admissions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(project),
      })
    );
  },

  async deleteAdmissionProject(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await apiFetch(`/admissions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },


  // Banners
  async getBanners() {
    try {
      return await handleResponse<BannerItem[]>(await apiFetch('/banners', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch banners from API:', e);
      return [];
    }
  },

  async createBanner(banner: Omit<BannerItem, 'id'>) {
    return handleResponse<BannerItem>(
      await fetch(`${API_BASE}/banners`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(banner),
      })
    );
  },

  async updateBanner(id: string, banner: Partial<BannerItem>) {
    return handleResponse<BannerItem>(
      await fetch(`${API_BASE}/banners/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(banner),
      })
    );
  },

  async deleteBanner(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/banners/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // System Settings
  async getSettings() {
    try {
      return await handleResponse<any>(await apiFetch('/settings', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch settings:', e);
      return {};
    }
  },

  async updateSettings(settings: any) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings),
      })
    );
  },

  // Contact Messages API
  async sendContactMessage(data: { name: string; email: string; phone?: string; subject: string; message: string; department?: string }) {
    return handleResponse<{ success: boolean; data: any; message: string }>(
      await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  },

  async getMessages() {
    try {
      return await handleResponse<any[]>(await apiFetch('/messages', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch messages:', e);
      return [];
    }
  },

  async deleteMessage(id: string) {
    return handleResponse<{ success: boolean }>(
      await fetch(`${API_BASE}/messages/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  async markMessageRead(id: string) {
    return handleResponse<{ success: boolean }>(
      await fetch(`${API_BASE}/messages/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    );
  },

  // Notification System API
  async getNotifications() {
    try {
      return await handleResponse<{
        notifications: DashboardNotification[];
        unreadCount: number;
        totalCount: number;
        smtpConfigured: boolean;
      }>(await apiFetch('/notifications', { headers: getHeaders() }));
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
      return { notifications: [], unreadCount: 0, totalCount: 0, smtpConfigured: false };
    }
  },

  async markNotificationRead(id: string) {
    return handleResponse<{ success: boolean; item: DashboardNotification }>(
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    );
  },

  async markAllNotificationsRead() {
    return handleResponse<{ success: boolean; count: number }>(
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    );
  },

  async deleteNotification(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  async clearAllReadNotifications() {
    return handleResponse<{ success: boolean; clearedCount: number }>(
      await fetch(`${API_BASE}/notifications/clear-read`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  async triggerNotificationScan() {
    return handleResponse<{
      success: boolean;
      newNotificationsGenerated: number;
      totalNotifications: number;
      unreadCount: number;
    }>(
      await fetch(`${API_BASE}/notifications/trigger-scan`, {
        method: 'POST',
        headers: getHeaders(),
      })
    );
  },

  async testEmailDispatch(id: string) {
    return handleResponse<{
      success: boolean;
      message: string;
      notification: DashboardNotification;
    }>(
      await fetch(`${API_BASE}/notifications/${id}/test-email`, {
        method: 'POST',
        headers: getHeaders(),
      })
    );
  },

  async testSMTP(smtpConfig: any) {
    return handleResponse<{ success: boolean; message: string; timestamp: string }>(
      await fetch(`${API_BASE}/settings/test-smtp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(smtpConfig),
      })
    );
  },

  async triggerBackup() {
    return handleResponse<{ success: boolean; message: string; lastBackupAt: string; dbSize: string }>(
      await fetch(`${API_BASE}/settings/backup/now`, {
        method: 'POST',
        headers: getHeaders(),
      })
    );
  },

  getBackupDownloadUrl(filename?: string) {
    if (filename) {
      return `${API_BASE}/backup/download/${encodeURIComponent(filename)}`;
    }
    return `${API_BASE}/settings/backup/download`;
  },

  // Official Announcements
  async getAnnouncements(params?: { category?: string; year?: string; status?: string; search?: string; isPinned?: boolean; isUrgent?: boolean; preview?: boolean; includeDrafts?: boolean }) {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.year) query.append('year', params.year);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      if (params?.isPinned) query.append('isPinned', 'true');
      if (params?.isUrgent) query.append('isUrgent', 'true');
      if (params?.preview) query.append('preview', 'true');
      if (params?.includeDrafts) query.append('includeDrafts', 'true');

      return await handleResponse<AnnouncementItem[]>(
        await apiFetch(`/announcements?${query.toString()}`, { headers: getHeaders() })
      );
    } catch (e) {
      console.warn('Failed to fetch announcements from API:', e);
      return [];
    }
  },

  async getAnnouncementById(id: string) {
    return handleResponse<AnnouncementItem>(
      await fetch(`${API_BASE}/announcements/${id}`, { headers: getHeaders() })
    );
  },

  async trackDownload(announcementId: string, attachmentId: string) {
    return handleResponse<{ success: boolean; totalDownloads: number; attachments: any[] }>(
      await fetch(`${API_BASE}/announcements/${announcementId}/download/${attachmentId}`, {
        method: 'POST',
        headers: getHeaders()
      })
    );
  },

  async createAnnouncement(data: Partial<AnnouncementItem>) {
    return handleResponse<AnnouncementItem>(
      await apiFetch('/announcements', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async updateAnnouncement(id: string, data: Partial<AnnouncementItem>) {
    return handleResponse<AnnouncementItem>(
      await apiFetch(`/announcements/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async togglePinAnnouncement(id: string) {
    return handleResponse<AnnouncementItem>(
      await apiFetch(`/announcements/${id}/pin`, {
        method: 'PATCH',
        headers: getHeaders()
      })
    );
  },

  async deleteAnnouncement(id: string) {
    try {
      return await handleResponse<{ success: boolean; deleted: any }>(
        await apiFetch(`/announcements/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
      );
    } catch (e) {
      return { success: false, deleted: null };
    }
  },



  // Curriculum & Courses Management System
  async getCurricula() {
    try {
      return await handleResponse<Course[]>(
        await apiFetch('/courses', {
          headers: getHeaders()
        })
      );
    } catch (e) {
      console.warn('Failed to fetch courses:', e);
      return [];
    }
  },

  async getCurriculumById(id: string) {
    return handleResponse<Course>(
      await apiFetch(`/courses/${id}`, {
        headers: getHeaders()
      })
    );
  },

  async createCurriculum(data: Partial<Course>) {
    return handleResponse<Course>(
      await apiFetch('/courses', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async updateCurriculum(id: string, data: Partial<Course>) {
    return handleResponse<Course>(
      await apiFetch(`/courses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async toggleCurriculumStatus(id: string, status?: 'active' | 'inactive') {
    return handleResponse<Course>(
      await apiFetch(`/courses/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      })
    );
  },

  async deleteCurriculum(id: string) {
    try {
      return await handleResponse<{ success: boolean; deleted: any }>(
        await apiFetch(`/courses/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
      );
    } catch (e) {
      console.warn('Failed to delete course:', e);
      return { success: true };
    }
  },

  // Personnel Management System (ระบบจัดการบุคลากร)
  async getPersonnel() {
    try {
      return await handleResponse<StaffMember[]>(
        await apiFetch('/personnel', {
          headers: getHeaders()
        })
      );
    } catch (e) {
      console.warn('Failed to fetch personnel:', e);
      return [];
    }
  },

  async getPersonnelBySlug(slug: string) {
    return handleResponse<StaffMember>(
      await apiFetch(`/personnel/slug/${encodeURIComponent(slug)}`, {
        headers: getHeaders()
      })
    );
  },

  async getPersonnelById(id: string) {
    return handleResponse<StaffMember>(
      await apiFetch(`/personnel/${id}`, {
        headers: getHeaders()
      })
    );
  },

  async createPersonnel(data: Partial<StaffMember>) {
    return handleResponse<StaffMember>(
      await apiFetch('/personnel', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async updatePersonnel(id: string, data: Partial<StaffMember>) {
    return handleResponse<StaffMember>(
      await apiFetch(`/personnel/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async updatePersonnelStatus(id: string, status: string) {
    return handleResponse<StaffMember>(
      await apiFetch(`/personnel/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      })
    );
  },

  async deletePersonnel(id: string) {
    try {
      return await handleResponse<{ success: boolean; deleted: any }>(
        await apiFetch(`/personnel/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
      );
    } catch (e) {
      console.warn('Failed to delete personnel:', e);
      return { success: true };
    }
  },

  // Academic Works Management System (ระบบจัดการผลงานวิชาการ)
  async getAcademicWorks() {
    return handleResponse<AcademicWork[]>(
      await fetch(`${API_BASE}/academic_works`, {
        headers: getHeaders()
      })
    );
  },

  async createAcademicWork(data: Partial<AcademicWork>) {
    return handleResponse<AcademicWork>(
      await fetch(`${API_BASE}/academic_works`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async updateAcademicWork(id: string, data: Partial<AcademicWork>) {
    return handleResponse<AcademicWork>(
      await fetch(`${API_BASE}/academic_works/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async deleteAcademicWork(id: string) {
    return handleResponse<{ success: boolean; deleted: any }>(
      await fetch(`${API_BASE}/academic_works/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
    );
  },

  // Media Library & File Management System (คลังสื่อและระบบจัดการไฟล์กลาง)
  async getMedia(params?: { category?: string; folderId?: string; search?: string; type?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.folderId) query.append('folderId', params.folderId);
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return handleResponse<MediaFile[]>(
      await fetch(`${API_BASE}/media${queryString}`, {
        headers: getHeaders()
      })
    );
  },

  async uploadMedia(data: {
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    folderId?: string | null;
    altText?: string;
    description?: string;
    tags?: string[];
    base64Data?: string;
  }) {
    return handleResponse<MediaFile>(
      await apiFetch('/media/upload', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async updateMedia(id: string, data: Partial<MediaFile>) {
    return handleResponse<MediaFile>(
      await apiFetch(`/media/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async deleteMedia(id: string, force: boolean = false) {
    return handleResponse<{ success: boolean; deletedId: string; usages?: MediaUsageReference[] }>(
      await apiFetch(`/media/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
    );
  },

  async batchDeleteMedia(ids: string[], force: boolean = false) {
    return handleResponse<{ success: boolean; deletedIds: string[]; blockedFiles?: any[] }>(
      await apiFetch('/media/batch-delete', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids, force })
      })
    );
  },

  async batchMoveMedia(ids: string[], folderId: string | null) {
    return handleResponse<{ success: boolean; movedIds: string[] }>(
      await apiFetch('/media/batch-move', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids, folderId })
      })
    );
  },

  async getMediaFolders() {
    try {
      return await handleResponse<MediaFolder[]>(
        await apiFetch('/media/folders', {
          headers: getHeaders()
        })
      );
    } catch (e) {
      console.warn('Failed to fetch media folders:', e);
      return [];
    }
  },

  async createMediaFolder(name: string, parentId: string | null = null, color?: string) {
    try {
      return await handleResponse<MediaFolder>(
        await apiFetch('/media/folders', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name, parentId, color })
        })
      );
    } catch (e) {
      console.warn('Failed to create media folder:', e);
      return {
        id: 'f_' + Date.now(),
        name,
        parentId,
        color: color || '#ec4899',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  async updateMediaFolder(id: string, name: string, color?: string) {
    try {
      return await handleResponse<MediaFolder>(
        await apiFetch(`/media/folders/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ name, color })
        })
      );
    } catch (e) {
      console.warn('Failed to update media folder:', e);
      return { id, name, color } as any;
    }
  },

  async deleteMediaFolder(id: string) {
    try {
      return await handleResponse<{ success: boolean; deletedFolderId: string }>(
        await apiFetch(`/media/folders/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
      );
    } catch (e) {
      console.warn('Failed to delete media folder:', e);
      return { success: true, deletedFolderId: id };
    }
  },

  async getMediaSettings() {
    try {
      return await handleResponse<MediaStorageSettings>(
        await apiFetch('/media/settings', {
          headers: getHeaders()
        })
      );
    } catch (e) {
      return {
        provider: 'local',
        maxFileSizeMB: 20,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
        autoWebPConversion: true,
        autoCompressImages: true,
        compressionQuality: 85,
        generateThumbnails: true
      };
    }
  },

  async updateMediaSettings(settings: Partial<MediaStorageSettings>) {
    try {
      return await handleResponse<MediaStorageSettings>(
        await apiFetch('/media/settings', {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(settings)
        })
      );
    } catch (e) {
      return settings as any;
    }
  },

  // ============================================================================
  // USER MANAGEMENT & RBAC API
  // ============================================================================
  async getUsers() {
    return handleResponse<any[]>(
      await fetch(`${API_BASE}/users`, {
        headers: getHeaders()
      })
    );
  },

  async createUser(userData: any) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      })
    );
  },

  async updateUser(id: string, userData: any) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      })
    );
  },

  async updateUserPermissions(id: string, customPermissions: string[]) {
    return handleResponse<any>(
      await fetch(`${API_BASE}/users/${id}/permissions`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ customPermissions })
      })
    );
  },

  async deleteUser(id: string) {
    return handleResponse<{ success: boolean; deletedId: string }>(
      await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
    );
  },

  async approveUser(id: string, role?: string, customPermissions?: string[]) {
    return handleResponse<{ message: string; user: any }>(
      await fetch(`${API_BASE}/users/${id}/approve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ role, customPermissions })
      })
    );
  },

  async rejectUser(id: string, reason?: string) {
    return handleResponse<{ message: string; user: any }>(
      await fetch(`${API_BASE}/users/${id}/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason })
      })
    );
  },

  // Audit Logs & DB Backup Management
  async getAuditLogs(params?: { user?: string; module?: string; actionType?: string; search?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.user) query.append('user', params.user);
    if (params?.module) query.append('module', params.module);
    if (params?.actionType) query.append('actionType', params.actionType);
    if (params?.search) query.append('search', params.search);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    return handleResponse<any[]>(
      await fetch(`${API_BASE}/audit-logs${queryString}`, {
        headers: getHeaders()
      })
    );
  },

  async clearAuditLogs() {
    return handleResponse<{ success: boolean }>(
      await fetch(`${API_BASE}/audit-logs/clear`, {
        method: 'POST',
        headers: getHeaders()
      })
    );
  },

  async getDatabaseBackup() {
    return handleResponse<{ timestamp: string; stats: any; data: any }>(
      await fetch(`${API_BASE}/database/backup`, {
        headers: getHeaders()
      })
    );
  },

  async restoreDatabase(backupData: any) {
    return handleResponse<{ success: boolean; message: string; stats: any }>(
      await fetch(`${API_BASE}/database/restore`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ backupData })
      })
    );
  },

  // Advanced Backup & Restore System APIs
  async getBackupHistory() {
    return handleResponse<{ success: boolean; logs: any[]; systemStats: any }>(
      await fetch(`${API_BASE}/backup/history`, {
        headers: getHeaders()
      })
    );
  },

  async createBackup(type: 'database' | 'uploads' | 'full', description?: string) {
    return handleResponse<{ success: boolean; message: string; backup: any; downloadUrl: string }>(
      await fetch(`${API_BASE}/backup/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type, description })
      })
    );
  },

  async verifyBackupIntegrity(filename?: string, backupData?: any) {
    return handleResponse<{ success: boolean; integrity: any }>(
      await fetch(`${API_BASE}/backup/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ filename, backupData })
      })
    );
  },

  async executeRestore(params: { filename?: string; backupPayload?: any; restoreType?: 'database' | 'uploads' | 'full' }) {
    return handleResponse<{ success: boolean; message: string; safetySnapshot?: any; restoredAt: string }>(
      await fetch(`${API_BASE}/backup/restore`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params)
      })
    );
  },

  async getBackupSchedule() {
    return handleResponse<{ success: boolean; schedule: any }>(
      await fetch(`${API_BASE}/backup/schedule`, {
        headers: getHeaders()
      })
    );
  },

  async saveBackupSchedule(schedule: any) {
    return handleResponse<{ success: boolean; message: string; schedule: any }>(
      await fetch(`${API_BASE}/backup/schedule`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ schedule })
      })
    );
  },

  async deleteBackupLog(id: string) {
    return handleResponse<{ success: boolean; message: string }>(
      await fetch(`${API_BASE}/backup/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
    );
  },

  // Database Schema Inspector & Trash Management
  async getDatabaseSchema() {
    return handleResponse<{ tableCount: number; tables: any[] }>(
      await fetch(`${API_BASE}/database/schema`, {
        headers: getHeaders()
      })
    );
  },

  async softDeleteItem(tableName: string, itemId: string) {
    return handleResponse<{ success: boolean; trashEntry: any }>(
      await fetch(`${API_BASE}/database/soft-delete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ tableName, itemId })
      })
    );
  },

  async getTrashItems() {
    return handleResponse<any[]>(
      await fetch(`${API_BASE}/trash`, {
        headers: getHeaders()
      })
    );
  },

  async restoreTrashItem(id: string) {
    return handleResponse<{ success: boolean; restored: any }>(
      await fetch(`${API_BASE}/trash/restore/${id}`, {
        method: 'POST',
        headers: getHeaders()
      })
    );
  },

  async permanentDeleteTrashItem(id: string) {
    return handleResponse<{ success: boolean }>(
      await fetch(`${API_BASE}/trash/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
    );
  },

  // ============================================================================
  // CONTENT VERSION HISTORY API
  // ============================================================================
  async getRevisions(contentType?: string, contentId?: string, search?: string) {
    const params = new URLSearchParams();
    if (contentType) params.append('contentType', contentType);
    if (contentId) params.append('contentId', contentId);
    if (search) params.append('search', search);

    const queryString = params.toString();
    return handleResponse<ContentRevision[]>(
      await fetch(`${API_BASE}/revisions${queryString ? `?${queryString}` : ''}`, {
        headers: getHeaders()
      })
    );
  },

  async getRevisionById(id: string) {
    return handleResponse<ContentRevision>(
      await fetch(`${API_BASE}/revisions/${id}`, {
        headers: getHeaders()
      })
    );
  },

  async createRevision(data: { contentType: string; contentId: string; title?: string; changeSummary?: string; snapshot: any }) {
    return handleResponse<ContentRevision>(
      await fetch(`${API_BASE}/revisions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async restoreRevision(revisionId: string, changeSummary?: string) {
    return handleResponse<{ success: boolean; message: string; restoredItem: any; backupRevision: ContentRevision }>(
      await fetch(`${API_BASE}/revisions/${revisionId}/restore`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ changeSummary })
      })
    );
  }
};


