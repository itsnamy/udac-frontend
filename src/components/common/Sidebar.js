import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/UDac-logo-background.png';
import {Home, BookOpen, ClipboardList, PenLine, User, Dumbbell, Code,} from 'lucide-react';
function Sidebar({ isOpen, toggleSidebar }) {
  const user = JSON.parse(localStorage.getItem('user'));

  const adminMenuItems = [
    { to: '/admin-dashboard', label: 'Halaman Utama', icon: <Home size={18} /> },
    { to: '/user-list', label: 'Senarai Pengguna', icon: <User size={18} /> },
    { to: '/learning-materials', label: 'Bahan Pembelajaran', icon: <BookOpen size={18} /> },
    { to: '/exercise-sets', label: 'Kemas Kini Latihan', icon: <PenLine  size={18} /> },
    { to: '/exercises/available', label: 'Latihan Pembelajaran', icon: <Dumbbell size={18} /> },
    { to: '/sql-tutorial/list', label: 'SQL Tutorial', icon: <Code size={18} /> },
    { to: '/profile', label: 'Profil Saya', icon: <User size={18} /> },
  ];

  const studentMenuItems = [
    { to: '/student-dashboard', label: 'Halaman Utama', icon: <Home size={18} /> },
    { to: '/learning-materials', label: 'Bahan Pembelajaran', icon: <BookOpen size={18} /> },
    { to: '/exercises/available?type=THEMATIC', label: 'Latihan Tematik', icon: <ClipboardList size={18} /> },
    { to: '/exercises/available?type=CUMULATIVE', label: 'Latihan Kumulatif', icon: <Dumbbell size={18} /> },
    { to: '/sql-tutorial/list', label: 'SQL Tutorial', icon: <Code size={18} /> },
    { to: '/profile', label: 'Profil Saya', icon: <User size={18} /> },
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : 
                   user?.role === 'STUDENT' ? studentMenuItems : [];

  return (
    <>
      {isOpen && <div onClick={toggleSidebar} />}
      
      <div style={{ ...styles.sidebar, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoSection}>
            <img src={logo} alt="UDaC Logo" style={styles.sidebarLogo} />
          </div>
          <button onClick={toggleSidebar} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {user && (
          <>
            <div style={styles.roleHeader}>
              <h3 style={styles.roleTitle}>
                {user?.role === 'ADMIN' ? 'Portal Admin' : 
                 user?.role === 'STUDENT' ? 'Portal Pelajar' : 'Menu'}
              </h3>
            </div>
          </>
        )}

        <nav style={styles.navigation}>
          <ul style={styles.menuList}>
            {menuItems.map((item, index) => (
              <li key={index} style={styles.menuItem}>
                <Link to={item.to} style={styles.menuLink}>
                  <span style={styles.menuIcon}>{item.icon}</span>
                  <span style={styles.menuText}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'block',
  },
  sidebar: {
    backgroundColor: '#1e293b',
    background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
    color: 'white',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '250px',
    zIndex: 1000,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  logoSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    marginTop: '-5px',
    marginBottom: '-5px',
  },
  sidebarLogo: {
    height: '50px',
    objectFit: 'contain',
    filter: 'grayscale(100%) contrast(1.3) brightness(1.2)',
  },
  roleHeader: {
    padding: '16px 20px 8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  roleTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#f1f5f9',
    textAlign: 'center',
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  navigation: {
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto',
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  menuItem: {
    margin: '0 16px 8px',
  },
  menuLink: {
    color: '#e2e8f0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  menuIcon: {
    fontSize: '1.1rem',
    minWidth: '20px',
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
  },
  hamburger: {
    display: 'block',
    lineHeight: 1,
  },
};

export default Sidebar;