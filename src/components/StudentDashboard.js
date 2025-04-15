import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser?.token) {
      navigate('/login');
      return;
    }

    // First check access to student dashboard
    axios.get('http://localhost:8080/student/dashboard', {
      headers: {
        Authorization: `Bearer ${storedUser.token}`
      }
    })
    .then((res) => {
        setMessage(res.data);
    })
    .catch((err) => {
      setError('Access denied. You are not authorized to view this page.');
      console.error(err);
      navigate('/login');
    });
  }, [navigate]);


  return (
    <div className="student-dashboard p-6">
      <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
      {error && <p className="text-red-500">{error}</p>}
      {message ? (
        <p className="text-lg">{message}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default StudentDashboard;
