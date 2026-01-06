import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const artifactService = {
  getAllArtifacts: (params) => api.get('/artifacts', { params }),
  getArtifactById: (id) => api.get(`/artifacts/${id}`),
  createArtifact: (data) => api.post('/artifacts', data),
  updateArtifact: (id, data) => api.put(`/artifacts/${id}`, data),
  deleteArtifact: (id) => api.delete(`/artifacts/${id}`),
  getCategories: () => api.get('/artifacts/categories'),
  getEras: () => api.get('/artifacts/eras'),
  getStats: () => api.get('/artifacts/stats')
};

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  createTestUsers: () => api.post('/auth/create-test-users')
};


export const uploadService = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getImages: () => api.get('/upload/images'),
  deleteImage: (filename) => api.delete(`/upload/image/${filename}`)
};

export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`)
};

export default api;
