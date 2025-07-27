const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    unique: true,
    required: true,
  },
  proofOfId: {
    type: String, // store file path, URL, or hash
    required: true,
  },
  proofOfAddress: {
    type: String,
    required: true,
  },
  livenessCheckPassed: {
    type: Boolean,
    default: false,
  },
  sourceOfFunds: {
    type: String,
    required: true,
    enum: ['salary', 'savings', 'business', 'investment', 'gift', 'other'], // example options
  },
  region: {
    type: String,
    required: true,
    enum: ['east', 'west', 'north', 'south', 'central'],
  },
  kycReference: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
