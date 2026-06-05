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

  requestOtp: async ({ mobile, name, email, isSignup }) => {
    set({ loading: true });
    try {
      const res = isSignup
        ? await authApi.register({ mobile, name, email })
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
      const { token, user } = res.data;
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, token],
        [STORAGE_KEYS.USER, JSON.stringify(user)],
      ]);
      set({ token, user });
      return user;
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
