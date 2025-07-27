const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  amount: Number,
  currency: String,
  exchangeRate: Number,
  senderPartnerId: String,
  receiverPartnerId: String,
  customerId: String,
  kycReference: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed','flagged'],
    default: 'pending',
  },
  region: String,
  purpose: String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
