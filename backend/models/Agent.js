const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile: {
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
      match: [/^\+\d{1,4}$/, 'Please enter a valid country code (e.g., +91, +1)']
    },
    number: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
agentSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual field for full mobile number
agentSchema.virtual('fullMobile').get(function() {
  return `${this.mobile.countryCode}${this.mobile.number}`;
});

module.exports = mongoose.model('Agent', agentSchema);