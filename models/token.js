const mongoose = require('mongoose');
const User = require('./user');

const TokenSchema = new mongoose.Schema({
    _userId: { 
        type: String, 
        required: true
    },
    token: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date,
        required: true,
        default: Date.now, 
        expires: 43200 }
});

module.exports = mongoose.model('Token', TokenSchema);