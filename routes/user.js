const express = require("express");
const router = express.Router();
const User = require('../models/User');
// const userVerification = require('../models/UserVerification');

// const PasswordReset = require('../models/PasswordReset');

const {handleUserSignup,handleUserOtpVerification,handleResendOtp,
    handleUserLogin,handleUerLogout} = require("../controllers/user")



router.post("/login",handleUserLogin);

router.get("/logout",handleUerLogout);


router.post("/signup",handleUserSignup);


router.post("/verifyOTP", handleUserOtpVerification);


router.post("/resendOTPVerificationCode",handleResendOtp);

module.exports=router;