const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true,
    },
    delivery: [{
        name: {
            type: String,
        },
        contactNumber: {
            type: String
        },
        pincode: {
            type: String
        },
        address: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    wallet: {

        amount: {
            type: Number,
            default: 0
        },
        transactions:[{
            source: {
                type: String,
            },
            transaction_amount: {
                type: Number,
            },
            method: {
                type: String,
            },
            description:{
                type:String,
            },
            date: { type: Date, default: Date.now }, 
        }],
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', // Assuming 'Product' is the model name for your product schema
    }],

})

const User = mongoose.model('user', UserSchema);


module.exports = User;