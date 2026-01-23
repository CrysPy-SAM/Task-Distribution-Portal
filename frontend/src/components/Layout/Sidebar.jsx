import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiUpload, FiList } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/agents', icon: <FiUsers />, label: 'Agents' },
    { path: '/upload-leads', icon: <FiUpload />, label: 'Upload Leads' },
    { path: '/leads', icon: <FiList />, label: 'All Leads' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;