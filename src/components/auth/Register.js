import React, { useState } from 'react';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/UDac-logo-background.png';
import { Eye, EyeOff } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'STUDENT', // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    register(formData)
      .then((response) => {
        setMessage('Registration successful! Please log in.');
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || 'Error during registration.');
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
      <div style={styles.logoSection}>
          <img src={logo} alt="UDaC Logo" style={styles.logo} />
        </div>
        <h2 style={styles.title}>Daftar Akaun</h2>
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              name="fullname"
              placeholder="Nama Penuh"
              value={formData.fullname}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              name="username"
              placeholder="Name Pengguna (username)"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Kata Laluan"
                value={formData.password}
                onChange={handleChange}
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
          <div style={styles.inputGroup}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              name="phone"
              placeholder="No Telefon"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="STUDENT">Pelajar</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" style={styles.button}>Daftar</button>
          {message && <p style={styles.message}>{message}</p>}
        </form>
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
    gap: '15px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  input: {
    width: '94%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
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
  message: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#e74c3c',
  },
};

export default Register;
