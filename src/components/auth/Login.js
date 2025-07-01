import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/AuthService';
import logo from '../assets/UDac-logo-background.png';
import { Eye, EyeOff } from 'lucide-react';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login(username, password)
    .then((response) => {
      if (!response || !response.token) {
        setErrorMessage('Token not found in response.');
        return;
      }

      const userRole = response.role;

      if (userRole === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (userRole === 'STUDENT') {
        navigate('/student-dashboard');
      } else {
        setErrorMessage('Unexpected role');
      }

    })
    .catch((error) => {
      setErrorMessage('Invalid credentials or server error.');
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <img src={logo} alt="UDaC Logo" style={styles.logo} />
        </div>
        <h2 style={styles.title}>Log Masuk</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name Penguna</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kata Laluan</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" style={styles.button}>Log Masuk</button>
          {errorMessage && <p style={styles.errorMessage}>Maklumat log masuk tidak sah</p>}
        </form>
        <div style={styles.forgotPassword}>
          <p>
            <a href="/forgot-password" style={styles.forgotLink}>Lupa Kata Laluan?</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    backgroundColor: '#ecf0f1',
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  logoSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    marginTop: '-5px',
    marginBottom: '-5px',
  },
  logo: {
    height: '50px',
    objectFit: 'contain',
    filter: 'grayscale(100%) contrast(1.3) brightness(1.2)',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    fontSize: '14px',
    color: '#34495e',
    marginBottom: '8px',
  },
  input: {
    width: '95%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    marginBottom: '10px',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  toggleButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    color: '#7f8c8d',
  },
  
  errorMessage: {
    color: '#e74c3c',
    fontSize: '14px',
  },
  forgotPassword: {
    marginTop: '20px',
  },
  forgotLink: {
    color: '#3498db',
    textDecoration: 'none',
  },
};

export default Login;
