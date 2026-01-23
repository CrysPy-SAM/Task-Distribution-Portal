const Lead = require('../models/Lead');
const Agent = require('../models/Agent');
const fs = require('fs');
const path = require('path');
const { parseCSV, parseExcel, validateLeadData, normalizeLeadData, distributeLeads } = require('../utils/csvParser');

/**
 * @desc    Upload CSV/Excel and distribute leads to agents
 * @route   POST /api/leads/upload
 * @access  Private (Admin only)
 */
exports.uploadLeads = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    let parsedData = [];

    // Parse file based on extension
    try {
      if (fileExt === '.csv') {
        parsedData = await parseCSV(filePath);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        parsedData = parseExcel(filePath);
      } else {
        // Delete uploaded file
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          message: 'Invalid file format. Only CSV, XLSX, and XLS are allowed'
        });
      }
    } catch (parseError) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Error parsing file',
        error: parseError.message
      });
    }

    // Validate data
    const validation = validateLeadData(parsedData);
    if (!validation.valid) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Data validation failed',
        errors: validation.errors
      });
    }

    // Normalize data
    const normalizedData = normalizeLeadData(parsedData);

    // Get all active agents
    const agents = await Agent.find({ isActive: true }).select('_id name email');

    if (agents.length === 0) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'No active agents found. Please create agents first.'
      });
    }

    // ⚠️ FIX: Check if exactly 5 agents exist
    if (agents.length < 5) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Only ${agents.length} active agent(s) found. Please create at least 5 agents before uploading leads.`,
        currentAgents: agents.length,
        required: 5
      });
    }

    // ⚠️ FIX: Use only first 5 agents for distribution
    const selectedAgents = agents.slice(0, 5);
    const agentIds = selectedAgents.map(agent => agent._id);

    // Distribute leads among 5 agents
    const distributedLeads = distributeLeads(normalizedData, agentIds);

    // Add uploadedBy field to each lead
    const leadsToInsert = distributedLeads.map(lead => ({
      ...lead,
      uploadedBy: req.user.id
    }));

    // Insert leads into database
    const insertedLeads = await Lead.insertMany(leadsToInsert);

    // Delete uploaded file after processing
    fs.unlinkSync(filePath);

    // Get distribution summary with agent names
    const distributionSummary = {};
    const agentMap = {};
    
    // Create agent map for names
    selectedAgents.forEach(agent => {
      agentMap[agent._id.toString()] = {
        name: agent.name,
        email: agent.email
      };
    });

    // Calculate distribution
    insertedLeads.forEach(lead => {
      const agentId = lead.assignedTo.toString();
      if (!distributionSummary[agentId]) {
        distributionSummary[agentId] = {
          agentId: agentId,
          agentName: agentMap[agentId]?.name || 'Unknown',
          agentEmail: agentMap[agentId]?.email || 'Unknown',
          count: 0
        };
      }
      distributionSummary[agentId].count++;
    });

    res.status(201).json({
      success: true,
      message: 'Leads uploaded and distributed successfully among 5 agents',
      data: {
        totalLeads: insertedLeads.length,
        totalAgents: 5,
        distributionSummary: Object.values(distributionSummary)
      }
    });
  } catch (error) {
    console.error('Upload leads error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error while uploading leads',
      error: error.message
    });
  }
};

/**
 * @desc    Get all leads with agent details
 * @route   GET /api/leads
 * @access  Private (Admin only)
 */
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('assignedTo', 'name email')
      .populate('uploadedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('Get all leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leads',
      error: error.message
    });
  }
};

/**
 * @desc    Get leads by agent ID
 * @route   GET /api/leads/agent/:agentId
 * @access  Private (Admin only)
 */
exports.getLeadsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Check if agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const leads = await Lead.find({ assignedTo: agentId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email
      },
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('Get leads by agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leads',
      error: error.message
    });
  }
};

/**
 * @desc    Get lead distribution summary
 * @route   GET /api/leads/distribution
 * @access  Private (Admin only)
 */
exports.getDistributionSummary = async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true }).select('name email');
    
    const distribution = await Promise.all(
      agents.map(async (agent) => {
        const leadCount = await Lead.countDocuments({ assignedTo: agent._id });
        return {
          agent: {
            id: agent._id,
            name: agent.name,
            email: agent.email
          },
          leadCount
        };
      })
    );

    const totalLeads = distribution.reduce((sum, item) => sum + item.leadCount, 0);

    res.status(200).json({
      success: true,
      totalLeads,
      totalAgents: agents.length,
      distribution
    });
  } catch (error) {
    console.error('Get distribution summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching distribution',
      error: error.message
    });
  }
};

/**
 * @desc    Delete all leads
 * @route   DELETE /api/leads
 * @access  Private (Admin only)
 */
exports.deleteAllLeads = async (req, res) => {
  try {
    const result = await Lead.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'All leads deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting leads',
      error: error.message
    });
  }
};