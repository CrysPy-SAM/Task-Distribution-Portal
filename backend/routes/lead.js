const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadLeads,
  getAllLeads,
  getLeadsByAgent,
  getDistributionSummary,
  deleteAllLeads
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'leads-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only accept CSV, XLSX, XLS
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Upload leads
router.post('/upload', upload.single('file'), uploadLeads);

// Get all leads
router.get('/', getAllLeads);

// Get distribution summary
router.get('/distribution', getDistributionSummary);

// Get leads by agent
router.get('/agent/:agentId', getLeadsByAgent);

// Delete all leads
router.delete('/', deleteAllLeads);

module.exports = router;