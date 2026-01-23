import React, { useState, useEffect } from 'react';
import { leadAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './LeadDistribution.css';

const LeadDistribution = () => {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribution();
  }, []);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getDistribution();
      setDistribution(response.data.distribution || []);
    } catch (error) {
      console.error('Fetch distribution error:', error);
      toast.error('Failed to load distribution');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading distribution...</div>;
  }

  return (
    <div className="distribution-container">
      <h2>Lead Distribution Summary</h2>
      
      {distribution.length === 0 ? (
        <div className="empty-state">
          <p>No leads distributed yet.</p>
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
  );
};

export default LeadDistribution;