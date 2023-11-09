const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    maxUsage: {
        type: Number,
    },
    usageCount: {
        type: Number,
        default:0,
    },
    createdAt: {
        type: Date,
        default:Date.now(),
    },
    expiresAt: {
        type: Date,
        required:true,
    },
    description: {
        type: String,
        required: true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    }
})

const Coupon = mongoose.model('coupon',couponSchema);

module.exports = Coupon;