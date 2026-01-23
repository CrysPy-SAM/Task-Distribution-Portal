import React, { useState } from 'react';
import { leadAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUpload, FiFile, FiCheckCircle } from 'react-icons/fi';
import './UploadLeads.css';

const UploadLeads = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }

    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.');
      e.target.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await leadAPI.uploadLeads(formData);
      
      toast.success('Leads uploaded and distributed successfully!');
      setUploadResult(response.data.data);
      setFile(null);
      
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload leads';
      const errors = error.response?.data?.errors;
      
      if (errors && errors.length > 0) {
        toast.error(`Validation Error: ${errors[0]}`);
      } else {
        toast.error(message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload Leads</h1>
        <p>Upload CSV or Excel file to distribute leads among agents</p>
      </div>

      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-icon">
            <FiUpload />
          </div>
          
          <h3>Select File</h3>
          <p>Accepted formats: CSV, XLSX, XLS (Max 5MB)</p>

          <div className="file-input-wrapper">
            <input
              type="file"
              id="file-input"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="file-input" className="file-input-label">
              <FiFile /> Choose File
            </label>
          </div>

          {file && (
            <div className="selected-file">
              <FiCheckCircle className="check-icon" />
              <span>{file.name}</span>
              <span className="file-size">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          )}

          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload & Distribute'}
          </button>
        </div>

        <div className="info-card">
          <h3>CSV File Format</h3>
          <div className="format-info">
            <p>Your CSV file should contain the following columns:</p>
            <ul>
              <li><strong>FirstName</strong> (Required) - Text</li>
              <li><strong>Phone</strong> (Required) - Number</li>
              <li><strong>Notes</strong> (Optional) - Text</li>
            </ul>
          </div>

          <div className="example-section">
            <h4>Example CSV:</h4>
            <pre className="csv-example">
FirstName,Phone,Notes
John,9876543210,VIP Client
Jane,9876543211,Follow up needed
Mike,9876543212,Interested in product
            </pre>
          </div>
        </div>
      </div>

      {uploadResult && (
        <div className="result-section">
          <div className="result-card">
            <FiCheckCircle className="success-icon" />
            <h3>Upload Successful!</h3>
            
            <div className="result-stats">
              <div className="stat-item">
                <span className="stat-value">{uploadResult.totalLeads}</span>
                <span className="stat-label">Total Leads</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{uploadResult.totalAgents}</span>
                <span className="stat-label">Agents</span>
              </div>
            </div>

            <div className="distribution-info">
              <h4>Distribution Summary:</h4>
              <ul>
                {Object.entries(uploadResult.distributionSummary || {}).map(([agentId, count]) => (
                  <li key={agentId}>
                    Agent ID: {agentId} - <strong>{count} leads</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadLeads;