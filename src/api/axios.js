// src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: false,
});

// Endpoints that don't require authentication
const NO_AUTH_ENDPOINTS = [
  '/auth/login/',
  '/auth/student-signup/',
  // Add other unauthenticated endpoints if any
];

API.interceptors.request.use((config) => {
  if (NO_AUTH_ENDPOINTS.some(endpoint => config.url.includes(endpoint))) {
    return config;
  }

  const token = localStorage.getItem('access_token');
  console.log('[Axios] Requesting:', config.url);
  console.log('[Axios] Token:', token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default API;