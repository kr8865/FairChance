const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getToken() {
  return localStorage.getItem('accessToken');
}

export function setToken(token) {
  localStorage.setItem('accessToken', token);
}

export function clearToken() {
  localStorage.removeItem('accessToken');
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    setToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(err.error || 'Request failed', res.status, err.code);
  }

  if (res.status === 204) return undefined;
  return res.json();
}

export const api = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getDashboard: () => apiFetch('/me'),
  updateProfile: (body) => apiFetch('/me', { method: 'PATCH', body: JSON.stringify(body) }),
  getScores: () => apiFetch('/scores'),
  addScore: (body) => apiFetch('/scores', { method: 'POST', body: JSON.stringify(body) }),
  getCharities: () => apiFetch('/charities'),
  getFeaturedCharities: () => apiFetch('/charities/featured'),
  getCharity: (slug) => apiFetch(`/charities/${slug}`),
  getCurrentDraw: () => apiFetch('/draws/current'),
  getWinnings: () => apiFetch('/winnings'),
  uploadProof: (id, file) => {
    const fd = new FormData();
    fd.append('proof', file);
    return apiFetch(`/winnings/${id}/proof`, { method: 'POST', body: fd });
  },

  // Overrides backend plan labels to force Rupees format
  getPlans: async () => {
    try {
      const data = await apiFetch('/billing/plans');
      return {
        ...data,
        monthly: {
          ...data?.monthly,
          label: '₹999',
          currency: 'INR',
        },
        yearly: {
          ...data?.yearly,
          label: '₹9,999',
          discount: 'Save ₹1,989',
          currency: 'INR',
        },
      };
    } catch {
      // Fallback if network request fails
      return {
        monthly: { id: 'monthly', price: 99900, label: '₹999', currency: 'INR' },
        yearly: { id: 'yearly', price: 999900, label: '₹9,999', discount: 'Save ₹1,989', currency: 'INR' },
        stripeEnabled: false,
      };
    }
  },

  subscribe: (plan) => apiFetch('/billing/subscribe', { method: 'POST', body: JSON.stringify({ plan }) }),
  demoSubscribe: (plan) => apiFetch('/billing/demo-subscribe', { method: 'POST', body: JSON.stringify({ plan }) }),
  cancelSubscription: () => apiFetch('/billing/cancel', { method: 'POST' }),
  billingPortal: () => apiFetch('/billing/portal', { method: 'POST' }),
  oneTimeDonation: (body) => apiFetch('/donations/one-time', { method: 'POST', body: JSON.stringify(body) }),
  adminReports: () => apiFetch('/admin/reports'),
  adminUsers: () => apiFetch('/admin/users'),
  adminCharities: () => apiFetch('/admin/charities'),
  adminDraws: () => apiFetch('/admin/draws'),
  adminSimulateDraw: (periodKey, mode) =>
    apiFetch(`/admin/draws/${periodKey}/simulate`, { method: 'POST', body: JSON.stringify({ mode }) }),
  adminPublishDraw: (periodKey) =>
    apiFetch(`/admin/draws/${periodKey}/publish`, { method: 'POST' }),
  adminWinners: () => apiFetch('/admin/winners'),
  adminVerifyWinner: (id, body) =>
    apiFetch(`/admin/winners/${id}/verify`, { method: 'PATCH', body: JSON.stringify(body) }),
  adminPayoutWinner: (id) =>
    apiFetch(`/admin/winners/${id}/payout`, { method: 'PATCH' }),
  adminCreateCharity: (body) =>
    apiFetch('/admin/charities', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateCharity: (id, body) =>
    apiFetch(`/admin/charities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  adminDeleteCharity: (id) =>
    apiFetch(`/admin/charities/${id}`, { method: 'DELETE' }),
  adminUpdateUserStatus: (id, status) =>
    apiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminActivateSub: (userId, plan) =>
    apiFetch(`/admin/users/${userId}/activate-sub`, { method: 'POST', body: JSON.stringify({ plan }) }),
};

export function formatMoney(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}