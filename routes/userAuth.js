const express = require("express");
const router = express.Router();
const User = require('../models/User');
const loginValidator = require('../middleware/expreXValidator');

const { handleUserSignup, handleUserOtpVerification, handleResendOtp,
    handleUserLogin, handleUerLogout } = require("../controllers/userAuth")



router.post("/login",loginValidator, handleUserLogin);


router.get("/logout", handleUerLogout);


router.post("/signup", handleUserSignup);


router.post("/verifyOTP", handleUserOtpVerification);


router.post("/resendOTPVerificationCode", handleResendOtp);

module.exports = router;