import axios from 'axios';

const API_URL = 'http://localhost:8080/auth/'; // Your backend endpoint

export const register = (userData) => {
  return axios.post(API_URL + 'register', userData);
};

export const login = (username, password) => {
  return axios
    .post(API_URL + 'login', { username, password })
    .then((response) => {
      if (response.data.token) {
        // Store user data in localStorage
        const user = {
          idUser: response.data.idUser,
          role: response.data.role,
          token: response.data.token
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data; // Return the data object, which contains idUser, role, and token
    });
};

export const logout = () => {
  localStorage.removeItem('user');
  console.log('User logged out');
};
