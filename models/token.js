const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    _userId: { 
        type: String, 
        required: true,
        unique:true
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