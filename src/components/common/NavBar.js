import React from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { logout } from '../../services/authService';

function NavBar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear user from localStorage
    navigate('/'); // Redirect to home
  };
  
  return (
    <nav>
      <div>
        <Link to="/">UDAC</Link>
      </div>
      <div>
        {!user ? (
          <>
            <Link to="/login" className="hover:underline"> Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        ) : (
          <>
            {user.role === 'ADMIN' && (
              <Link to="/admin-dashboard" >Admin Dashboard</Link>
            )}
            {user.role === 'STUDENT' && (
              <Link to="/student-dashboard" >Student Dashboard</Link>
            )}
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
