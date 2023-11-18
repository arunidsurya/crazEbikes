const mongoose = require('mongoose');
const { schema } = require('./category');
const Schema = mongoose.Schema;

const userOTPVerificationSchema = new Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
});

const UserOTPVerification = mongoose.model('userOTPVerification', userOTPVerificationSchema);

module.exports = UserOTPVerification;