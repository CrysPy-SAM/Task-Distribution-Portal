const express = require('express');
const router = express.Router();
const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .post(createAgent)
  .get(getAllAgents);

router.route('/:id')
  .get(getAgentById)
  .put(updateAgent)
  .delete(deleteAgent);

module.exports = router;