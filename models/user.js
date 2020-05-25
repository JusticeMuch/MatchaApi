const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
        unique : true,
        minlength : 6
    },
    email: {
        type:String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    hashAuthenticate : {
        type :String,
        unique : true 
    },
    authenticated : Boolean,
  }, {timestamps: true});
  
  module.exports = mongoose.model('User', UserSchema);