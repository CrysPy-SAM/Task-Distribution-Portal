import React, { useState, useEffect } from 'react';
import { leadAPI, agentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiPhone } from 'react-icons/fi';
import './LeadsList.css';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsRes, agentsRes] = await Promise.all([
        leadAPI.getAllLeads(),
        agentAPI.getAllAgents(),
      ]);
      
      setLeads(leadsRes.data.leads || []);
      setAgents(agentsRes.data.agents || []);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentFilter = async (agentId) => {
    setSelectedAgent(agentId);
    
    if (agentId === 'all') {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const response = await leadAPI.getLeadsByAgent(agentId);
      setLeads(response.data.leads || []);
    } catch (error) {
      toast.error('Failed to filter leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads;

  if (loading) {
    return (
      <div className="leads-container">
        <div className="loading">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="leads-container">
      <div className="leads-header">
        <div>
          <h1>All Leads</h1>
          <p>View and manage distributed leads</p>
        </div>

        <div className="filter-section">
          <label htmlFor="agent-filter">Filter by Agent:</label>
          <select
            id="agent-filter"
            value={selectedAgent}
            onChange={(e) => handleAgentFilter(e.target.value)}
          >
            <option value="all">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="empty-state">
          <p>No leads found. Upload a CSV file to add leads.</p>
        </div>
      ) : (
        <div className="leads-stats">
          <p>Showing <strong>{filteredLeads.length}</strong> leads</p>
        </div>
      )}

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Phone</th>
              <th>Notes</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead._id}>
                <td>
                  <div className="lead-name">
                    <FiUser className="icon" />
                    {lead.firstName}
                  </div>
                </td>
                <td>
                  <div className="lead-phone">
                    <FiPhone className="icon" />
                    {lead.phone}
                  </div>
                </td>
                <td>{lead.notes || '-'}</td>
                <td>
                  <div className="agent-info">
                    <strong>{lead.assignedTo?.name}</strong>
                    <span className="agent-email">{lead.assignedTo?.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${lead.status}`}>
                    {lead.status}
                  </span>
                </td>
                <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsList;