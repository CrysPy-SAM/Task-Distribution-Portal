import React from 'react';
import { FiMail, FiPhone, FiTrash2 } from 'react-icons/fi';
import './AgentCard.css';

const AgentCard = ({ agent, onDelete }) => {
  return (
    <div className="agent-card">
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
          onClick={() => onDelete(agent.id, agent.name)}
        >
          <FiTrash2 /> Delete
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
