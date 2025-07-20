// src/auth/useToken.js

const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

export const setToken = (token, role = null) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};
