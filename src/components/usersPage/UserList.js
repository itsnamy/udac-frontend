import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE from '../../config';

function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const token = parsedUser?.token;

      if (!token) {
        setError('No token found. Please login.');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/admin/getAllUser`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError('Access denied. Admins only.');
        } else {
          setError('Failed to fetch users.');
        }
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = selectedRole === 'ALL' ? users : users.filter((user) => user.role === selectedRole);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Senarai Pengguna</h1>

      {error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <>
          <div style={styles.filterContainer}>
            <label style={styles.label}>Peranan Pengguna:</label>
            <select
              style={styles.select}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="ALL">SEMUA</option>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Pelajar</option>
            </select>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Peranan</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.idUser}>
                  <td>{user.idUser}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '32px 48px',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    minHeight: '100vh',
  },
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  error: {
    color: 'red',
  },
  filterContainer: {
    marginBottom: '20px',
  },
  label: {
    fontWeight: 'bold',
    marginRight: '10px',
  },
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f4f4f4',
  },
  td: {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
};

export default UserList;
