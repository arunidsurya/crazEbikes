const express = require("express");
const User = require('../models/User');
const nodemailer = require("nodemailer");
const{v4:uuidv4}= require('uuid');
const bycrypt = require("bcrypt");
const userOTPVerification = require("../models/userOTPVerification");
const transpoter = require("../utils/nodeMailer");
const { setUser } = require('../service/auth');
const {check,validationResult} = require('express-validator');

const imgUri = process.env.IMGURI;
const images ={
    cover:'resources/images/coverPhoto.jpg',
    logo:'resources/images/logo.jpg',
    amazon:'resources/images/amazon.jpg',
    dhl:'resources/images/dhl.jpg',
    fedex:'resources/images/fedex.jpg',
    gPay:'resources/images/gPay.jpg',
    master:'resources/images/master.jpg',
    visa:'resources/images/visa.jpg',
};


async function handleUserLogin(req, res) {

    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.render('userlogin',{
            errors:errors.mapped(),
            images:images,
            imgUri:imgUri,
        });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email});
    if(user){
        const validPassword = await bycrypt.compare(password,user.password);
        if (!validPassword) {
            return res.render("userlogin", {
                images:images,
                imgUri:imgUri,
                error: "Invalid email or password",
            });
        
            }else if(user.isBlocked){
                return res.render("userlogin", {
                    images:images,
                    imgUri:imgUri,
                    error: "This Account is bLocked!!! please contact Admin",
                });
            }
        
            const userToken = setUser(user);
            res.cookie("useruid", userToken);
            req.session.userId=user._id;
            return res.redirect("/");
    }else{
        return res.render("userlogin", {
            images:images,
            imgUri:imgUri,
            error: "No user found",
        });
    }
    

};

async function handleUerLogout(req, res) {
    req.user = " ";
    req.session.destroy();
    return res.redirect("/");
};

async function handleUserSignup(req,res){

    let{name,email,password,contactNumber}=req.body;
    name = name.trim();
    email= email.trim();
    password= password.trim();
    contactNumber= contactNumber.trim();

    if(name ==""||email==""||password==""){
        res.json({
            status:"FAILED",
            message:"Empty input fields!",
        });
    } else if(!/^[a-zA-z]*$/.test(name)){
        res.json({
            status:"FAILED",
            message:"Invalid name entered!",
        })
    }else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status:"FAILED",
            message:"Invalid email entered!",
        })
    }else if(password.length < 8){
        res.json({
            status:"FAILED",
            message:"Password is too short!",
        })
    }else{
        const user = await User.find({email});
        if(user!=""){
            res.json({
                status:"FAILED",
                message:"User with provided email already exists!",
            })      
        }else{
            const saltRounds = 10;
            bycrypt
            .hash(password, saltRounds)
            .then((hashedPassword)=>{
                const newUser = new User({
                    name,
                    email,
                    password:hashedPassword,
                    contactNumber,
                    isVerified:false,
                });
                
                newUser
                .save()
                .then((result)=>{
                    sendVerificationEmail(result,res);
                })
                .catch((err)=>{
                    console.log(err);
                    res.json({
                        status:"FAILED",
                        message:"An error occured while saving user account!",
                    });
                });
            })
            .catch((err)=>{
                res.json({
                    status:"FAILED",
                    message:"An error occured while hashing password!!",
                });
            });
        }
    }
}

const sendVerificationEmail = async({_id,email},res)=>{

    try {
        const otp= `${Math.floor(1000 + Math.random() * 9000)}`;

        //mail options
        const mailOptions ={
            from: process.env.AUTH_EMAIL,
            to:email,
            subject: "Verify Your Email",
            html:`<p> Enter <b>${otp}</b> in the app to verify your email address.</p>
            <p>This code will <b> Expires in one hour</b></P> `
        };
    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bycrypt.hash(otp,saltRounds);
      const newOTPVerification = await new userOTPVerification({
            userId:_id,
            otp: hashedOTP,
            createdAt:Date.now(),
            expiresAt:Date.now() + 3600000,
        });
        // save otp record
        await newOTPVerification.save();
        transpoter.sendMail(mailOptions);
        res.render('userOtpVerify',{ message:"Verification otp email sent", userid:_id,imgUri:imgUri,images:images})
  
    } catch (error) {
        res.json({
            status:"FAILED",
            message:error.message,
        });
    }
}


async function handleUserOtpVerification(req,res){

    try {
        let otp= req.body.otp;
        let userId = req.query.userid;
        if(!userId || !otp){
            res.render('userOtpVerify',{
                userid:userId,
                status:"FAILED",
                imgUri:imgUri,
                images:images,
                message_no_otp:`Empty otp details are not allowed.`,
               })
            // throw Error("Empty otp details are not allowed");
        }else{
          const userOTPVerificationRecords = await userOTPVerification.find({
            userId,
          });
          if(userOTPVerification.length <=0){
            //no records found
            res.render('userOtpVerify',{
                userid:userId,
                status:"FAILED",
                imgUri:imgUri,
                images:images,
                message_no_record:`Account record dosen't exist or has been verified already.Please signup or login.`,
               })
            // throw new Error(
            //     "Account record dosen't exist or has been verified already.Please signup or login."
            // );
          }else{
            const {expiresAt} = userOTPVerificationRecords[0];
            const hashedOTP = userOTPVerificationRecords[0].otp;

            if(expiresAt < Date.now()){
               await userOTPVerification.deleteMany({userId});
               res.render('userOtpVerify',{
                userid:userId,
                status:"FAILED",
                imgUri:imgUri,
                images:images,
                message_otp_expired:`Code has expired. Please request again.`,
               })
            //    throw new Error("Code has expired. Please request again.");
            }else{
               const validOTP = await bycrypt.compare(otp,hashedOTP);

               if(!validOTP){
                // throw new Error("Invalid code passed. Check  your inbox");
                res.render('userOtpVerify',{
                    userid:userId,
                    status:"VERIFIED",
                    imgUri:imgUri,
                    images:images,
                    message_inavlid_otp:`Invalid code passed. Check  your inbox.`,
                   });
               }else {
               await User.updateOne({_id:userId},{isVerified:true});
               await userOTPVerification.deleteMany({userId});
               res.render('userOtpVerify',{
                userid:userId,
                status:"VERIFIED",
                imgUri:imgUri,
                images:images,
                message:`User email verified successfully.`,
               })
               }
            }
          }
        }
    } catch (error) {
        res.json({
            status:"FAILED",
            message:error.message,
        });
    }
}


async function handleResendOtp(req,res){
    try {
        let{userId,email}= req.body;

        if(!userId|| !email){
            throw Error("Empty user details are not allowed");
        }else{
            await UserOTPVerification.deleteMany({userId});
            sendVerificationEmail({_id:userId,email},res);
        }
    } catch (error) {
        res.json({
            status:"FAILED",
            message: error.message,
        })
    }
}



module.exports={
    handleUserSignup,
    handleUserOtpVerification,
    handleResendOtp,
    handleUserLogin,
    handleUerLogout,
}