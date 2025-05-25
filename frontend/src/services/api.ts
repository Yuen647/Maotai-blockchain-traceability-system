import axios from 'axios';

const API_URL = 'http://localhost:15000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in the headers if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  register: async (data: any) => {
    const response = await api.post('/api/register', data);
    return response.data;
  },
  login: async (username: string, password: string) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  },
  getUserInfo: async () => {
    const response = await api.get('/api/userinfo');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAllProducts: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },
  searchProducts: async (params: any) => {
    const response = await api.get('/api/products/search', { params });
    return response.data;
  },
  createProduct: async (product: any) => {
    const response = await api.post('/api/products', product);
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  transferProduct: async (id: string, transferData: any) => {
    const response = await api.post(`/api/products/${id}/transfer`, transferData);
    return response.data;
  },
  getProductTrace: async (id: string) => {
    const response = await api.get(`/api/products/${id}/trace`);
    return response.data;
  },
  getProductTracePaginated: async (id: string, page = 1, perPage = 10) => {
    const response = await api.get(`/api/products/${id}/trace_paginated`, {
      params: { page, per_page: perPage },
    });
    return response.data;
  },
};

// Blockchain API
export const blockchainAPI = {
  getStatus: async () => {
    const response = await api.get('/api/blockchain/status');
    return response.data;
  },
  mine: async () => {
    const response = await api.post('/api/blockchain/mine');
    return response.data;
  },
  getAllBlocks: async () => {
    const response = await api.get('/api/blockchain/blocks');
    return response.data;
  },
  getLatestBlock: async () => {
    const response = await api.get('/api/blockchain/latest');
    return response.data;
  },
};

// File Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// User Management API
export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  updateUser: async (userId: number, data: {
    role?: string;
    organization?: string;
    password?: string;
    is_active?: boolean;
  }) => {
    const response = await api.put(`/api/users/${userId}`, data);
    return response.data;
  },
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  },
};

export default api; 