/**
 * Hardened Unified API Client Gateway
 * Task 28 — Step 4: Full Backend ↔ Frontend Gateway & Standard Response Normalizer
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

import { ENV_CONFIG, redactSecrets } from '../../utils/envConfig.js';
import { ApiError, API_ERROR_CODES } from './apiErrors.js';

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_SAFE_RETRIES = 2;
const AUTH_STORAGE_KEY = 'antigravity_auth_token';

class ApiClient {
  constructor(baseUrl = ENV_CONFIG.API_BASE_URL) {
    this.baseUrl = (baseUrl || 'https://antigravity-agency-platform.onrender.com/api/v1').replace(/\/$/, '');
    this.token = this.loadStoredToken();
  }

  setBaseUrl(baseUrl) {
    if (baseUrl) {
      this.baseUrl = baseUrl.replace(/\/$/, '');
    }
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  loadStoredToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(AUTH_STORAGE_KEY) || null;
      }
    } catch (e) {
      // restricted environment fallback
    }
    return null;
  }

  setAuthToken(token) {
    this.token = token;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (token) {
          window.localStorage.setItem(AUTH_STORAGE_KEY, token);
        } else {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  getAuthToken() {
    return this.token;
  }

  clearAuthToken() {
    this.setAuthToken(null);
  }

  /**
   * Core Request Dispatcher with Timeout, Secret Redaction, Envelope Normalization, and Safe Fallback
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body = null,
      params = null,
      timeout = DEFAULT_TIMEOUT_MS,
      retryCount = 0,
      isSafeRetryable = method === 'GET',
    } = options;

    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Construct Query String
    let queryString = '';
    if (params && typeof params === 'object') {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') {
          q.append(k, String(v));
        }
      }
      const qs = q.toString();
      if (qs) queryString = `?${qs}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let resolvedBase = this.baseUrl;
    let pathPart = cleanEndpoint;

    if (cleanEndpoint.startsWith('http')) {
      resolvedBase = '';
      pathPart = cleanEndpoint;
    } else if (cleanEndpoint.startsWith('/api/v1') && resolvedBase.endsWith('/api/v1')) {
      resolvedBase = resolvedBase.replace(/\/api\/v1\/?$/, '');
    }

    const url = `${resolvedBase}${pathPart}${queryString}`;

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeout) : null;

    const requestHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...headers,
    };

    if (this.token && !requestHeaders.Authorization && !requestHeaders.authorization) {
      requestHeaders.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null,
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);

      // Handle Rate Limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError(
          `Rate limit exceeded on ${cleanEndpoint}. Retry-After: ${retryAfter || 'N/A'}s`,
          API_ERROR_CODES.RATE_LIMIT,
          { status: 429, retryAfter, requestId }
        );
      }

      let payload = {};
      try {
        payload = await response.json();
      } catch (e) {
        payload = { raw: await response.text().catch(() => '') };
      }

      // Handle HTTP Error Codes
      if (!response.ok || payload.success === false) {
        const errObj = payload.error || payload;
        let code = errObj.code || API_ERROR_CODES.PROVIDER_ERROR;

        if (response.status === 401) code = API_ERROR_CODES.AUTHENTICATION_ERROR;
        else if (response.status === 403) code = errObj.code === 'EXECUTION_BLOCKED' ? 'EXECUTION_BLOCKED' : API_ERROR_CODES.AUTHORIZATION_ERROR;
        else if (response.status === 400 || response.status === 422) code = API_ERROR_CODES.VALIDATION_ERROR;
        else if (response.status === 404) code = 'NOT_FOUND';
        else if (response.status === 409) code = 'CONFLICT';

        throw new ApiError(
          errObj.message || `HTTP ${response.status} from ${cleanEndpoint}`,
          code,
          { status: response.status, details: redactSecrets(errObj.details || errObj), requestId }
        );
      }

      return {
        success: true,
        data: payload.data !== undefined ? payload.data : payload,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          ...(payload.meta || {}),
        },
        status: response.status,
      };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new ApiError(
          `Request timeout after ${timeout}ms on ${cleanEndpoint}`,
          API_ERROR_CODES.TIMEOUT,
          { timeout, requestId }
        );
      }

      // Safe exponential backoff retry for GET requests only
      if (
        isSafeRetryable &&
        retryCount < MAX_SAFE_RETRIES &&
        err.code !== API_ERROR_CODES.AUTHENTICATION_ERROR &&
        err.code !== API_ERROR_CODES.AUTHORIZATION_ERROR
      ) {
        const delay = Math.pow(2, retryCount) * 500;
        await new Promise((r) => setTimeout(r, delay));
        return this.request(endpoint, {
          ...options,
          retryCount: retryCount + 1,
        });
      }

      if (err instanceof ApiError) throw err;

      throw new ApiError(
        err.message || `Network error connecting to ${cleanEndpoint}`,
        API_ERROR_CODES.NETWORK_ERROR,
        { originalError: err.message, requestId }
      );
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data, isSafeRetryable: false });
  }

  patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data, isSafeRetryable: false });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE', isSafeRetryable: false });
  }

  // ===========================================================================
  // UNIFIED API NAMESPACES (Task 28 — Step 4)
  // ===========================================================================

  // 1. Authentication
  get auth() {
    return {
      login: (credentials) => this.post('/api/v1/auth/login', credentials),
      logout: () => this.post('/api/v1/auth/logout'),
      me: () => this.get('/api/v1/auth/me'),
      updateProfile: (data) => this.patch('/api/v1/auth/profile', data),
      changePassword: (data) => this.post('/api/v1/auth/change-password', data),
    };
  }

  // 2. Agency Settings
  get agency() {
    return {
      get: () => this.get('/api/v1/agency'),
      update: (data) => this.patch('/api/v1/agency', data),
    };
  }

  // 3. Client Management
  get clients() {
    return {
      list: (params) => this.get('/api/v1/clients', { params }),
      get: (id) => this.get(`/api/v1/clients/${id}`),
      create: (data) => this.post('/api/v1/clients', data),
      update: (id, data) => this.patch(`/api/v1/clients/${id}`, data),
      delete: (id) => this.delete(`/api/v1/clients/${id}`),
    };
  }

  // 4. Team Members & Roles
  get team() {
    return {
      list: (params) => this.get('/api/v1/team', { params }),
      create: (data) => this.post('/api/v1/team', data),
      update: (id, data) => this.patch(`/api/v1/team/${id}`, data),
      delete: (id) => this.delete(`/api/v1/team/${id}`),
    };
  }

  // 5. CRM Leads
  get leads() {
    return {
      list: (params) => this.get('/api/v1/leads', { params }),
      get: (id) => this.get(`/api/v1/leads/${id}`),
      create: (data) => this.post('/api/v1/leads', data),
      update: (id, data) => this.patch(`/api/v1/leads/${id}`, data),
      delete: (id) => this.delete(`/api/v1/leads/${id}`),
    };
  }

  // 6. Client Contacts
  get contacts() {
    return {
      list: (params) => this.get('/api/v1/contacts', { params }),
      get: (id) => this.get(`/api/v1/contacts/${id}`),
      create: (data) => this.post('/api/v1/contacts', data),
      update: (id, data) => this.patch(`/api/v1/contacts/${id}`, data),
      delete: (id) => this.delete(`/api/v1/contacts/${id}`),
    };
  }

  // 7. Paid Media Campaigns
  get campaigns() {
    return {
      list: (params) => this.get('/api/v1/campaigns', { params }),
      get: (id) => this.get(`/api/v1/campaigns/${id}`),
      create: (data) => this.post('/api/v1/campaigns', data),
      update: (id, data) => this.patch(`/api/v1/campaigns/${id}`, data),
    };
  }

  // 8. WhatsApp Marketing, Inbox & Automations
  get whatsapp() {
    return {
      conversations: {
        list: (params) => this.get('/api/v1/whatsapp/conversations', { params }),
        get: (id) => this.get(`/api/v1/whatsapp/conversations/${id}`),
        create: (data) => this.post('/api/v1/whatsapp/conversations', data),
        update: (id, data) => this.patch(`/api/v1/whatsapp/conversations/${id}`, data),
        delete: (id) => this.delete(`/api/v1/whatsapp/conversations/${id}`),
        addMessage: (id, data) => this.post(`/api/v1/whatsapp/conversations/${id}/messages`, data),
      },
      templates: {
        list: (params) => this.get('/api/v1/whatsapp/templates', { params }),
        get: (id) => this.get(`/api/v1/whatsapp/templates/${id}`),
        create: (data) => this.post('/api/v1/whatsapp/templates', data),
        update: (id, data) => this.patch(`/api/v1/whatsapp/templates/${id}`, data),
        delete: (id) => this.delete(`/api/v1/whatsapp/templates/${id}`),
      },
      automations: {
        list: (params) => this.get('/api/v1/whatsapp/automations', { params }),
        get: (id) => this.get(`/api/v1/whatsapp/automations/${id}`),
        create: (data) => this.post('/api/v1/whatsapp/automations', data),
        update: (id, data) => this.patch(`/api/v1/whatsapp/automations/${id}`, data),
        delete: (id) => this.delete(`/api/v1/whatsapp/automations/${id}`),
      },
      followUps: {
        list: (params) => this.get('/api/v1/whatsapp/follow-ups', { params }),
        get: (id) => this.get(`/api/v1/whatsapp/follow-ups/${id}`),
        create: (data) => this.post('/api/v1/whatsapp/follow-ups', data),
        update: (id, data) => this.patch(`/api/v1/whatsapp/follow-ups/${id}`, data),
        delete: (id) => this.delete(`/api/v1/whatsapp/follow-ups/${id}`),
      },
    };
  }

  // 9. SEO Tracking & Tasks
  get seo() {
    return {
      keywords: {
        list: (params) => this.get('/api/v1/seo/keywords', { params }),
        get: (id) => this.get(`/api/v1/seo/keywords/${id}`),
        create: (data) => this.post('/api/v1/seo/keywords', data),
        update: (id, data) => this.patch(`/api/v1/seo/keywords/${id}`, data),
        delete: (id) => this.delete(`/api/v1/seo/keywords/${id}`),
      },
      tasks: {
        list: (params) => this.get('/api/v1/seo/tasks', { params }),
        get: (id) => this.get(`/api/v1/seo/tasks/${id}`),
        create: (data) => this.post('/api/v1/seo/tasks', data),
        update: (id, data) => this.patch(`/api/v1/seo/tasks/${id}`, data),
        delete: (id) => this.delete(`/api/v1/seo/tasks/${id}`),
      },
    };
  }

  // 10. Contracts & Invoices
  get contracts() {
    return {
      list: (params) => this.get('/api/v1/contracts', { params }),
      get: (id) => this.get(`/api/v1/contracts/${id}`),
      create: (data) => this.post('/api/v1/contracts', data),
      update: (id, data) => this.patch(`/api/v1/contracts/${id}`, data),
      delete: (id) => this.delete(`/api/v1/contracts/${id}`),
      invoices: {
        list: (params) => this.get('/api/v1/contracts/invoices', { params }),
        get: (id) => this.get(`/api/v1/contracts/invoices/${id}`),
        create: (data) => this.post('/api/v1/contracts/invoices', data),
        update: (id, data) => this.patch(`/api/v1/contracts/invoices/${id}`, data),
        delete: (id) => this.delete(`/api/v1/contracts/invoices/${id}`),
      },
    };
  }

  // 11. AI Intelligence Signals
  get ai() {
    return {
      insights: (params) => this.get('/api/v1/ai/insights', { params }),
      recommendations: (params) => this.get('/api/v1/ai/recommendations', { params }),
      anomalies: (params) => this.get('/api/v1/ai/anomalies', { params }),
    };
  }

  // 12. AI Actions Execution Boundary
  get actions() {
    return {
      execute: (actionId, data = {}) => this.post(`/api/v1/actions/${actionId}/execute`, data),
      rollback: (actionId, data = {}) => this.post(`/api/v1/actions/${actionId}/rollback`, data),
    };
  }

  // 13. System Health Check
  get health() {
    return {
      system: () => this.get('/api/v1/health'),
      database: () => this.get('/api/v1/health/database'),
      providers: () => this.get('/api/v1/health/providers'),
    };
  }
}

export const apiClient = new ApiClient();
export default apiClient;
