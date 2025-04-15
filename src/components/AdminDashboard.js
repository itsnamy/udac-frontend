import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const token = parsedUser?.token;

        console.log('Token:', token); // Debugging line

        if (!token) {
            setError('No token found. Please login.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:8080/admin/getAllUser', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            setUsers(response.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 403) {
            setError('Access denied. Admins only.');
            } else {
            setError('Failed to fetch users.');
            }
        }
    };
  
    fetchUsers();
    }, []);
   

    const filteredUsers =
    selectedRole === 'ALL'
      ? users
      : users.filter((user) => user.role === selectedRole);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="mr-2 font-semibold">Filter by Role:</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
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
    
export default AdminDashboard;