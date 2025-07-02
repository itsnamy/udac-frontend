import axios from 'axios';
import API_BASE from '../config'; 

const API_URL = `${API_BASE}/auth/`;

export const register = (userData) => {
  return axios.post(API_URL + 'register', userData);
};

export const login = async (username, password) => {
  const response = await axios
    .post(API_URL + 'login', { username, password });
  if (response.data.token) {
    // Store user data in localStorage
    const user = {
      idUser: response.data.idUser,
      role: response.data.role,
      token: response.data.token
    };
    localStorage.setItem('user', JSON.stringify(user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
  console.log('User logged out');
};
