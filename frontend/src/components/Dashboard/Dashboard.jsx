import React, { useState, useEffect } from 'react';
import { agentAPI, leadAPI } from '../../services/api';
import { FiUsers, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
// import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalLeads: 0,
    activeAgents: 0,
  });
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [agentsRes, distributionRes] = await Promise.all([
        agentAPI.getAllAgents(),
        leadAPI.getDistribution(),
      ]);

      const agents = agentsRes.data.agents || [];
      const activeAgents = agents.filter(agent => agent.isActive).length;

      setStats({
        totalAgents: agents.length,
        totalLeads: distributionRes.data.totalLeads || 0,
        activeAgents: activeAgents,
      });

      setDistribution(distributionRes.data.distribution || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Agent Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAgents}</h3>
            <p>Total Agents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.activeAgents}</h3>
            <p>Active Agents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FiFileText />
          </div>
          <div className="stat-content">
            <h3>{stats.totalLeads}</h3>
            <p>Total Leads</p>
          </div>
        </div>
      </div>

      <div className="distribution-section">
        <h2>Lead Distribution</h2>
        {distribution.length === 0 ? (
          <div className="empty-state">
            <p>No leads distributed yet. Upload a CSV file to get started.</p>
          </div>
        ) : (
          <div className="distribution-grid">
            {distribution.map((item, index) => (
              <div key={index} className="distribution-card">
                <h3>{item.agent.name}</h3>
                <p className="agent-email">{item.agent.email}</p>
                <div className="lead-count">
                  <span className="count">{item.leadCount}</span>
                  <span className="label">Leads</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;