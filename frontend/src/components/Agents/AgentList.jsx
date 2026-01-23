import React, { useState, useEffect } from 'react';
import { agentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiMail, FiPhone, FiTrash2 } from 'react-icons/fi';
import AddAgent from './AddAgent';
// import './AgentList.css';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentAPI.getAllAgents();
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Fetch agents error:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentAdded = (newAgent) => {
    setAgents([newAgent, ...agents]);
  };

  const handleDeleteAgent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await agentAPI.deleteAgent(id);
      setAgents(agents.filter((agent) => agent.id !== id));
      toast.success('Agent deleted successfully');
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <div className="agents-container">
        <div className="loading">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="agents-container">
      <div className="agents-header">
        <div>
          <h1>Agents</h1>
          <p>Manage your agents</p>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Add Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="empty-state">
          <p>No agents found. Add your first agent to get started.</p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Add Agent
          </button>
        </div>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <div className="agent-avatar">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="agent-status">
                  <span className={agent.isActive ? 'status-active' : 'status-inactive'}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="agent-body">
                <h3>{agent.name}</h3>
                
                <div className="agent-info">
                  <div className="info-item">
                    <FiMail className="info-icon" />
                    <span>{agent.email}</span>
                  </div>
                  <div className="info-item">
                    <FiPhone className="info-icon" />
                    <span>{agent.mobile.full}</span>
                  </div>
                </div>
              </div>

              <div className="agent-footer">
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteAgent(agent.id, agent.name)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddAgent
          onClose={() => setShowAddModal(false)}
          onAgentAdded={handleAgentAdded}
        />
      )}
    </div>
  );
};

export default AgentList;