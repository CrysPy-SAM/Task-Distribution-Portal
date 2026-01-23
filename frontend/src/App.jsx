import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AgentList from './components/Agents/AgentList';
import UploadLeads from './components/Leads/UploadLeads';
import LeadsList from './components/Leads/LeadsList';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/agents"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <AgentList />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/upload-leads"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <UploadLeads />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/leads"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <LeadsList />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;