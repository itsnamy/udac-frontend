import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/UDac-logo-background.png';
import { logout } from '../services/authService';

function NavBar({ toggleSidebar }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    if (toggleSidebar) toggleSidebar(false);
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        {user && (
          <button onClick={toggleSidebar} style={styles.sidebarToggle}>
            ☰
          </button>
        )}
        {user?.role === 'ADMIN' && (
          <Link to="/admin-dashboard" style={styles.logo}>
            <img src={logo} alt="UDaC Logo" style={styles.logoImg} />
          </Link>
        )}
        {user?.role === 'STUDENT' && (
          <Link to="/student-dashboard" style={styles.logo}>
            <img src={logo} alt="UDaC Logo" style={styles.logoImg} />
          </Link>
        )}
        {!user && (
          <div style={styles.logo}>
            <Link to="/">
              <img src={logo} alt="UDaC Logo" style={styles.logoImg} />
            </Link>
          </div>
        )}
      </div>

      <div style={styles.rightSection}>
        {!user ? (
          <div style={styles.authButtons}>
            <Link to="/login" style={styles.loginLink}>Log Masuk</Link>
            <Link to="/register" style={styles.registerBtn}>Daftar</Link>
          </div>
        ) : (
          <div style={styles.userSection}>
            <Link to="/profile" style={styles.profileLink}>Profil</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Log Keluar</button>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: ' #1e40af',
    color: 'white',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: '0',
    zIndex: '1000',
    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.25)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    textDecoration: 'none',
    transition: 'transform 0.2s ease',
  },
  logoImg: {
    height: '48px',
    objectFit: 'contain',
    display: 'block',
    filter: 'grayscale(100%) contrast(1.2) brightness(1.1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  loginLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  registerBtn: {
    color: '#1e40af',
    backgroundColor: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  welcomeText: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  profileLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  sidebarToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px',
  },
};

// Add hover effects via CSS-in-JS (you might want to add these to a CSS file instead)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    nav a:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      transform: translateY(-1px);
    }
    nav button:hover {
      background-color: #4b5563 !important;
      transform: translateY(-1px);
    }
    nav .sidebar-toggle:hover {
      background-color: rgba(255, 255, 255, 0.2) !important;
      transform: translateY(-1px);
    }
    nav img:hover {
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(style);
}

export default NavBar;