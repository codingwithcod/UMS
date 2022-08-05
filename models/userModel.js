const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    mobile:{
        type:Number,
        required: true
    },
    image:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    is_admin:{
        type:Number,
        required: true
    },
    is_verified:{
        type:Number,
        default: 0
    },
    token: {
        type:String,
        default:''
    }
});


const user = mongoose.model('User', userSchema);

module.exports = user;