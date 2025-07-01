import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fullnameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();

  useEffect(() => {
    if (storedUser) {
      axios.get(`http://localhost:8080/common/getUserbyId?idUser=${storedUser.idUser}`, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`
        }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch user:', error);
      });
    }
  }, [storedUser]);

  const handleSave = () => {
    const updatedUserData = {
      ...userData,
      fullname: fullnameRef.current.value,
      email: emailRef.current.value,
      phone: phoneRef.current.value,
    };

    axios.put(`http://localhost:8080/common/updateUser`, updatedUserData, {
      headers: {
        Authorization: `Bearer ${storedUser.token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      setUserData(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    })
    .catch(error => {
      console.error('Failed to update user:', error);
      alert('Failed to update profile.');
    });
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Profil Pengguna</h2>
      <div style={styles.card}>
        <div style={styles.field}>
          <label style={styles.label}>Nama Penuh:</label>
          {isEditing ? (
            <input 
              ref={fullnameRef} 
              defaultValue={userData.fullname} 
              style={styles.input}
            />
          ) : (
            <p style={styles.text}>{userData.fullname}</p>
          )}
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Nama Pengguna:</label>
          <p style={styles.text}>{userData.username}</p>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email:</label>
          {isEditing ? (
            <input 
              ref={emailRef} 
              defaultValue={userData.email} 
              style={styles.input}
            />
          ) : (
            <p style={styles.text}>{userData.email}</p>
          )}
        </div>
        <div style={styles.field}>
          <label style={styles.label}>No Telefon:</label>
          {isEditing ? (
            <input 
              ref={phoneRef} 
              defaultValue={userData.phone} 
              style={styles.input}
            />
          ) : (
            <p style={styles.text}>{userData.phone}</p>
          )}
        </div>

        {isEditing ? (
          <div style={styles.buttonGroup}>
            <button style={styles.saveButton} onClick={handleSave}>Kemas Kini</button>
            <button style={styles.cancelButton} onClick={() => setIsEditing(false)}>Batal</button>
          </div>
        ) : (
          <button style={styles.editButton} onClick={() => setIsEditing(true)}>Kemas Kini Profil</button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  field: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#34495e',
  },
  text: {
    backgroundColor: '#f2f2f2',
    padding: '10px',
    borderRadius: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  editButton: {
    marginTop: '20px',
    width: '100%',
    padding: '10px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default Profile;
