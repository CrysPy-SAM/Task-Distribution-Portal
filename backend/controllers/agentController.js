const Agent = require('../models/Agent');

/**
 * @desc    Create new agent
 * @route   POST /api/agents
 * @access  Private (Admin only)
 */
exports.createAgent = async (req, res) => {
  try {
    const { name, email, countryCode, mobile, password } = req.body;

    // Validate input
    if (!name || !email || !countryCode || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if agent already exists
    const agentExists = await Agent.findOne({ email });
    if (agentExists) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this email already exists'
      });
    }

    // Create agent
    const agent = await Agent.create({
      name,
      email,
      mobile: {
        countryCode,
        number: mobile
      },
      password,
      createdBy: req.user.id
    });

    // Remove password from response
    const agentResponse = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: {
        countryCode: agent.mobile.countryCode,
        number: agent.mobile.number,
        full: `${agent.mobile.countryCode}${agent.mobile.number}`
      },
      isActive: agent.isActive,
      createdAt: agent.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      agent: agentResponse
    });
  } catch (error) {
    console.error('Create agent error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating agent',
      error: error.message
    });
  }
};

/**
 * @desc    Get all agents
 * @route   GET /api/agents
 * @access  Private (Admin only)
 */
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-password').sort({ createdAt: -1 });

    const agentsResponse = agents.map(agent => ({
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: {
        countryCode: agent.mobile.countryCode,
        number: agent.mobile.number,
        full: `${agent.mobile.countryCode}${agent.mobile.number}`
      },
      isActive: agent.isActive,
      createdAt: agent.createdAt
    }));

    res.status(200).json({
      success: true,
      count: agents.length,
      agents: agentsResponse
    });
  } catch (error) {
    console.error('Get all agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching agents',
      error: error.message
    });
  }
};

/**
 * @desc    Get agent by ID
 * @route   GET /api/agents/:id
 * @access  Private (Admin only)
 */
exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const agentResponse = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: {
        countryCode: agent.mobile.countryCode,
        number: agent.mobile.number,
        full: `${agent.mobile.countryCode}${agent.mobile.number}`
      },
      isActive: agent.isActive,
      createdAt: agent.createdAt
    };

    res.status(200).json({
      success: true,
      agent: agentResponse
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching agent',
      error: error.message
    });
  }
};

/**
 * @desc    Update agent
 * @route   PUT /api/agents/:id
 * @access  Private (Admin only)
 */
exports.updateAgent = async (req, res) => {
  try {
    const { name, email, countryCode, mobile, isActive } = req.body;

    let agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update fields
    if (name) agent.name = name;
    if (email) agent.email = email;
    if (countryCode) agent.mobile.countryCode = countryCode;
    if (mobile) agent.mobile.number = mobile;
    if (typeof isActive !== 'undefined') agent.isActive = isActive;

    await agent.save();

    const agentResponse = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: {
        countryCode: agent.mobile.countryCode,
        number: agent.mobile.number,
        full: `${agent.mobile.countryCode}${agent.mobile.number}`
      },
      isActive: agent.isActive,
      createdAt: agent.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      agent: agentResponse
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating agent',
      error: error.message
    });
  }
};

/**
 * @desc    Delete agent
 * @route   DELETE /api/agents/:id
 * @access  Private (Admin only)
 */
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    await agent.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting agent',
      error: error.message
    });
  }
};