/**
 * EVENT BUILDER CLIENT API ENGINE
 */

const API = {
  getToken() {
    return localStorage.getItem('eb_token');
  },

  setToken(token) {
    localStorage.setItem('eb_token', token);
  },

  clearToken() {
    localStorage.removeItem('eb_token');
  },

  getUser() {
    const userStr = localStorage.getItem('eb_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('eb_user', JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem('eb_user');
  },

  async request(endpoint, options = {}) {
    const headers = options.headers || {};
    const token = this.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err.message);
      throw err;
    }
  },

  // Auth
  async register(email, password, full_name) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name })
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  },

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  },

  async firebaseLogin(idToken) {
    if (idToken) {
      this.setToken(idToken);
    }
    const data = await this.request('/api/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  logout() {
    this.clearToken();
    this.clearUser();
    sessionStorage.removeItem('pendingTemplateType');
    this.request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  },

  // Events
  async getEvents() {
    return this.request('/api/events');
  },

  async createEvent(eventData) {
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async createFromTemplate(templateType) {
    return this.cloneTemplate(templateType);
  },

  async cloneTemplate(templateId) {
    try {
      return await this.request(`/api/templates/${encodeURIComponent(templateId)}/clone`, {
        method: 'POST'
      });
    } catch (e) {
      // Fallback to events clone route
      const payload = (typeof templateId === 'string' && templateId.includes('-'))
        ? { template_slug: templateId }
        : { template_type: templateId };
      return this.request('/api/events/clone-template', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  },

  // Member Management (RBAC)
  async getMembers(eventId) {
    return this.request(`/api/events/${eventId}/members`);
  },

  async addMember(eventId, emailOrUserId, role) {
    const body = typeof emailOrUserId === 'number'
      ? { user_id: emailOrUserId, role }
      : { email: emailOrUserId, role };
    return this.request(`/api/events/${eventId}/members`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async removeMember(eventId, userId) {
    return this.request(`/api/events/${eventId}/members/${userId}`, {
      method: 'DELETE'
    });
  },

  async getEvent(id) {
    return this.request(`/api/events/${id}`);
  },

  async updateEvent(id, eventData) {
    return this.request(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  async deleteEvent(id) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Sections & Functions
  async updateSections(eventId, sections) {
    return this.request(`/api/events/${eventId}/sections`, {
      method: 'PUT',
      body: JSON.stringify({ sections })
    });
  },

  async addFunction(eventId, funcData) {
    return this.request(`/api/events/${eventId}/functions`, {
      method: 'POST',
      body: JSON.stringify(funcData)
    });
  },

  async updateFunction(eventId, funcId, funcData) {
    return this.request(`/api/events/${eventId}/functions/${funcId}`, {
      method: 'PUT',
      body: JSON.stringify(funcData)
    });
  },

  async deleteFunction(eventId, funcId) {
    return this.request(`/api/events/${eventId}/functions/${funcId}`, {
      method: 'DELETE'
    });
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request('/api/events/upload', {
      method: 'POST',
      body: formData
    });
  },

  // RSVPs
  async getRSVPs(eventId) {
    return this.request(`/api/events/${eventId}/rsvps`);
  },

  getRSVPExportUrl(eventId) {
    return `/api/events/${eventId}/rsvps/export?token=${this.getToken()}`;
  },

  async submitRSVP(eventId, rsvpData) {
    return this.request(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(rsvpData)
    });
  },

  // Guestbook
  async getGuestbook(eventId) {
    return this.request(`/api/events/${eventId}/guestbook`);
  },

  async postGuestbook(eventId, wishData) {
    return this.request(`/api/events/${eventId}/guestbook`, {
      method: 'POST',
      body: JSON.stringify(wishData)
    });
  },

  // Sharing & Visibility
  async updateVisibility(eventId, visibility, passcode) {
    return this.request(`/api/events/${eventId}/visibility`, {
      method: 'PUT',
      body: JSON.stringify({ visibility, passcode })
    });
  },

  async createInvite(eventId, inviteData) {
    return this.request(`/api/events/${eventId}/invites`, {
      method: 'POST',
      body: JSON.stringify(inviteData)
    });
  },

  async getInvites(eventId) {
    return this.request(`/api/events/${eventId}/invites`);
  },

  async revokeInvite(eventId, inviteId) {
    return this.request(`/api/events/${eventId}/invites/${inviteId}`, {
      method: 'DELETE'
    });
  },

  async getAuditLogs(eventId) {
    return this.request(`/api/events/${eventId}/audit-logs`);
  },

  // API Keys (Encrypted at rest)
  async getApiKeys() {
    return this.request('/api/keys');
  },

  async addApiKey(service_name, api_key) {
    return this.request('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ service_name, api_key })
    });
  },

  async deleteApiKey(id) {
    return this.request(`/api/keys/${id}`, {
      method: 'DELETE'
    });
  },

  // Public Event
  async getPublicEvent(slug, invite = '', passcode = '') {
    let url = `/api/public/event/${slug}`;
    const params = [];
    if (invite) params.push(`invite=${encodeURIComponent(invite)}`);
    if (passcode) params.push(`passcode=${encodeURIComponent(passcode)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.request(url);
  },

  showToast(message, icon = 'fa-sparkles') {
    let toast = document.getElementById('platform-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'platform-toast';
      toast.className = 'platform-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--primary-gold);"></i> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3600);
  }
};
