import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { jwtDecode } from 'jwt-decode';
import { login } from '../../services/authService';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login(username, password)
    .then((response) => { // data is response.data from authService
      console.log("Returned data from login():", response);

      if (!response || !response.token) {
        setErrorMessage('Token not found in response.');
        return;
      }

      const token = response.token;
      console.log("Token:", token);

      const userRole = response.role; 
      console.log("Role:", userRole);
      // Navigate based on the role

      if (userRole === 'ADMIN') {
        navigate('/admin-dashboard'); // Redirect to admin dashboard
      } else if (userRole === 'STUDENT') {
        navigate('/student-dashboard'); // Redirect to student dashboard
      } else {
        setErrorMessage('Unexpected role');
      }

      })
      .catch((error) => {
        setErrorMessage('Invalid credentials or server error.');
      });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
}

export default Login;
