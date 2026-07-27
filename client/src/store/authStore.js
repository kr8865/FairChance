import { create } from 'zustand';
import { api, clearToken, setToken } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  subscription: null,
  isLoading: true,

  setAuth: (user, token, subscription = null) => {
    setToken(token);
    set({ user, subscription, isLoading: false });
  },

  login: async (email, password) => {
    const data = await api.login({ email, password });
    setToken(data.accessToken);
    set({ user: data.user, subscription: data.subscription ?? null, isLoading: false });
  },

  register: async (data) => {
    const result = await api.register(data);
    setToken(result.accessToken);
    set({ user: result.user, isLoading: false });
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      clearToken();
      set({ user: null, subscription: null });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const data = await api.getDashboard();
      set({
        user: data.user,
        subscription: data.subscription,
        isLoading: false,
      });
    } catch {
      clearToken();
      set({ user: null, subscription: null, isLoading: false });
    }
  },
}));
