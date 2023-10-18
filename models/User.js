const mongoose = require('mongoose');

const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    contactNumber:{
        type:String,
        required:true,
        unique:true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
})

const User= mongoose.model('user',UserSchema);


module.exports=User;