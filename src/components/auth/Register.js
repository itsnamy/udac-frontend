import React, { useState } from 'react';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'STUDENT', // default role
  });
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
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} required />
        <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
