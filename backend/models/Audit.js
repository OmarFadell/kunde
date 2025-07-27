const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    redisId:{
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Audit', auditSchema);