const csv = require('csv-parser');
const fs = require('fs');
const xlsx = require('xlsx');

/**
 * Parse CSV file and return array of objects
 */
exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Parse Excel file (XLSX, XLS) and return array of objects
 */
exports.parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error('Error parsing Excel file: ' + error.message);
  }
};

/**
 * Validate parsed data structure
 */
exports.validateLeadData = (data) => {
  const errors = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, errors: ['File is empty or invalid'] };
  }

  data.forEach((row, index) => {
    const rowNum = index + 1;
    
    // Check for required fields
    if (!row.FirstName && !row.firstName && !row.firstname) {
      errors.push(`Row ${rowNum}: FirstName is required`);
    }
    
    if (!row.Phone && !row.phone) {
      errors.push(`Row ${rowNum}: Phone is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Normalize field names (handle different case variations)
 */
exports.normalizeLeadData = (data) => {
  return data.map(row => ({
    firstName: row.FirstName || row.firstName || row.firstname || '',
    phone: row.Phone || row.phone || '',
    notes: row.Notes || row.notes || ''
  }));
};

/**
 * Distribute leads equally among agents
 */
exports.distributeLeads = (leads, agentIds) => {
  const distribution = [];
  const leadsPerAgent = Math.floor(leads.length / agentIds.length);
  const remainder = leads.length % agentIds.length;

  let currentIndex = 0;

  agentIds.forEach((agentId, index) => {
    const count = leadsPerAgent + (index < remainder ? 1 : 0);
    const agentLeads = leads.slice(currentIndex, currentIndex + count);
    
    agentLeads.forEach(lead => {
      distribution.push({
        ...lead,
        assignedTo: agentId
      });
    });

    currentIndex += count;
  });

  return distribution;
};