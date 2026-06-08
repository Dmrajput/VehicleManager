import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { authApi, userApi } from '../api';

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  loading: false,
  bootstrapped: false,

  // Restore session from AsyncStorage on app launch.
  bootstrap: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);
      set({
        token: token || null,
        user: userJson ? JSON.parse(userJson) : null,
        bootstrapped: true,
      });
    } catch (e) {
      set({ bootstrapped: true });
    }
  },

  // Persist a logged-in session (token + user) to storage and state.
  persistSession: async ({ token, user }) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.USER, JSON.stringify(user)],
    ]);
    set({ token, user });
    return user;
  },

  requestOtp: async ({ mobile, name, email, password, isSignup }) => {
    set({ loading: true });
    try {
      const res = isSignup
        ? await authApi.register({ mobile, name, email, password })
        : await authApi.login({ mobile });
      return res?.data; // may include devOtp in dev mode
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async ({ mobile, otp }) => {
    set({ loading: true });
    try {
      const res = await authApi.verifyOtp({ mobile, otp });
      return await get().persistSession(res.data);
    } finally {
      set({ loading: false });
    }
  },

  // Password login (no OTP).
  loginWithPassword: async ({ mobile, password }) => {
    set({ loading: true });
    try {
      const res = await authApi.loginPassword({ mobile, password });
      return await get().persistSession(res.data);
    } finally {
      set({ loading: false });
    }
  },

  // Forgot-password: request a reset OTP. Returns data (may include devOtp).
  forgotPassword: async ({ mobile }) => {
    set({ loading: true });
    try {
      const res = await authApi.forgotPassword({ mobile });
      return res?.data;
    } finally {
      set({ loading: false });
    }
  },

  // Verify the reset OTP and get a short-lived reset token.
  verifyResetOtp: async ({ mobile, otp }) => {
    set({ loading: true });
    try {
      const res = await authApi.verifyResetOtp({ mobile, otp });
      return res?.data; // { resetToken }
    } finally {
      set({ loading: false });
    }
  },

  // Set a new password using the reset token (or mobile+otp fallback).
  resetPassword: async ({ mobile, otp, resetToken, newPassword }) => {
    set({ loading: true });
    try {
      const res = await authApi.resetPassword({ mobile, otp, resetToken, newPassword });
      return res?.data;
    } finally {
      set({ loading: false });
    }
  },

  refreshProfile: async () => {
    const res = await userApi.profile();
    const user = res.data;
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user });
    return user;
  },

  updateProfile: async (payload) => {
    const res = await userApi.updateProfile(payload);
    const user = res.data;
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user });
    return user;
  },

  logout: async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    set({ token: null, user: null });
  },

  isAuthenticated: () => Boolean(get().token),
}));

export default useAuthStore;
