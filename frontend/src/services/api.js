import axios from 'axios';
import { store } from '@/store';
import { logout, setToken } from '@/store/slices/authSlice';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const { token } = data;
        store.dispatch(setToken(token));
        processQueue(null, token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const authService = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  logout:         ()     => api.post('/auth/logout'),
  getMe:          ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (token, data) => api.put(`/auth/reset-password/${token}`, data),
  updateProfile:   (data) => api.put('/auth/profile', data),
};

export const appointmentService = {
  getAll:          (params) => api.get('/appointments', { params }),
  getById:         (id)     => api.get(`/appointments/${id}`),
  create:          (data)   => api.post('/appointments', data),
  update:          (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus:    (id, data) => api.patch(`/appointments/${id}/status`, data),
  delete:          (id)     => api.delete(`/appointments/${id}`),
  getCalendar:     (params) => api.get('/appointments/calendar', { params }),
  getSlots:        (doctorId, date) => api.get(`/doctors/${doctorId}/slots`, { params: { date } }),
};

export const patientService = {
  getAll:    (params) => api.get('/patients', { params }),
  getById:   (id)     => api.get(`/patients/${id}`),
  create:    (data)   => api.post('/patients', data),
  update:    (id, data) => api.put(`/patients/${id}`, data),
  getHistory: (id)   => api.get(`/patients/${id}/history`),
  getChart:  (id)    => api.get(`/patients/${id}/chart`),
};

export const doctorService = {
  getAll:      (params) => api.get('/doctors', { params }),
  getById:     (id)     => api.get(`/doctors/${id}`),
  getSchedule: (id)     => api.get(`/doctors/${id}/schedule`),
  create:      (data)   => api.post('/doctors', data),
  update:      (id, data) => api.put(`/doctors/${id}`, data),
};

export const serviceService = {
  getAll:   (params) => api.get('/services', { params }),
  create:   (data)   => api.post('/services', data),
  update:   (id, data) => api.put(`/services/${id}`, data),
  delete:   (id)     => api.delete(`/services/${id}`),
};

export const paymentService = {
  create:        (data) => api.post('/payments', data),
  getAll:        (params) => api.get('/payments', { params }),
  getByPatient:  (id)   => api.get(`/payments/patient/${id}`),
  getInvoice:    (id)   => api.post(`/payments/${id}/invoice`, {}, { responseType: 'blob' }),
};

export const dentalChartService = {
  get:        (patientId)           => api.get(`/dental-charts/${patientId}`),
  update:     (patientId, data)     => api.put(`/dental-charts/${patientId}`, data),
  updateTooth: (patientId, toothNum, data) => api.patch(`/dental-charts/${patientId}/tooth/${toothNum}`, data),
};

export const notificationService = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch('/notifications/read-all'),
};

export const reportService = {
  getDashboard:   ()       => api.get('/reports/dashboard'),
  getRevenue:     (params) => api.get('/reports/revenue', { params }),
  getAppointments:(params) => api.get('/reports/appointments', { params }),
  getTopDoctors:  ()       => api.get('/reports/top-doctors'),
  getTopServices: ()       => api.get('/reports/top-services'),
};

export const userService = {
  getAll:        (params) => api.get('/users', { params }),
  create:        (data)   => api.post('/users', data),
  update:        (id, data) => api.put(`/users/${id}`, data),
  delete:        (id)     => api.delete(`/users/${id}`),
  toggleStatus:  (id)     => api.patch(`/users/${id}/status`),
};

export const uploadService = {
  avatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  xray: (file) => {
    const fd = new FormData();
    fd.append('xray', file);
    return api.post('/upload/xray', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
