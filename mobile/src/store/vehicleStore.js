import { create } from 'zustand';
import { vehicleApi, fuelApi, serviceApi } from '../api';
import { cancelVehicleNotifications } from '../services/notifications';

export const useVehicleStore = create((set, get) => ({
  vehicles: [],
  loading: false,
  error: null,

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const res = await vehicleApi.list();
      set({ vehicles: res.data, loading: false });
      return res.data;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  addVehicle: async (payload) => {
    const res = await vehicleApi.create(payload);
    set({ vehicles: [res.data, ...get().vehicles] });
    return res.data;
  },

  updateVehicle: async (id, payload) => {
    const res = await vehicleApi.update(id, payload);
    set({ vehicles: get().vehicles.map((v) => (v._id === id ? res.data : v)) });
    return res.data;
  },

  deleteVehicle: async (id) => {
    await vehicleApi.remove(id);
    // Remove any pending reminders for this vehicle so they don't keep firing.
    await cancelVehicleNotifications(id);
    set({ vehicles: get().vehicles.filter((v) => v._id !== id) });
  },

  addFuel: async (payload) => {
    const res = await fuelApi.create(payload);
    return res.data;
  },

  addService: async (payload) => {
    const res = await serviceApi.create(payload);
    // Refresh vehicles so next-service date reminders update.
    get().fetchVehicles().catch(() => {});
    return res.data;
  },
}));

export default useVehicleStore;
