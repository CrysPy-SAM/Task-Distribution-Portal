import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Agent Management System</h2>
      </div>
      
      <div className="navbar-user">
        <div className="user-info">
          <FiUser className="user-icon" />
          <span className="user-email">{user?.email}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;