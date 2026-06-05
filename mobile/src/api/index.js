import client from './client';

export const authApi = {
  register: (payload) => client.post('/auth/register', payload),
  login: (payload) => client.post('/auth/login', payload),
  verifyOtp: (payload) => client.post('/auth/verify-otp', payload),
};

export const vehicleApi = {
  list: () => client.get('/vehicle'),
  get: (id) => client.get(`/vehicle/${id}`),
  create: (payload) => client.post('/vehicle', payload),
  update: (id, payload) => client.put(`/vehicle/${id}`, payload),
  remove: (id) => client.delete(`/vehicle/${id}`),
};

export const fuelApi = {
  list: (params) => client.get('/fuel', { params }),
  create: (payload) => client.post('/fuel', payload),
  remove: (id) => client.delete(`/fuel/${id}`),
};

export const serviceApi = {
  list: (params) => client.get('/service', { params }),
  create: (payload) => client.post('/service', payload),
  remove: (id) => client.delete(`/service/${id}`),
};

export const reminderApi = {
  list: () => client.get('/reminders'),
};

export const userApi = {
  profile: () => client.get('/user/profile'),
  updateProfile: (payload) => client.put('/user/profile', payload),
  dashboard: () => client.get('/user/dashboard'),
  expenses: (months = 6) => client.get('/user/expenses', { params: { months } }),
};

export default { authApi, vehicleApi, fuelApi, serviceApi, reminderApi, userApi };
