const express = require("express");
const router = express.Router();
const User = require('../models/User');
// const userVerification = require('../models/UserVerification');
const userOTPVerification = require("../models/userOTPVerification");
// const PasswordReset = require('../models/PasswordReset');
const nodemailer = require("nodemailer");
const{v4:uuidv4}= require('uuid');
const bycrypt = require("bcrypt");
const UserOTPVerification = require("../models/userOTPVerification");

// Nodemailer conf
let transpoter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASS,
    },
})

//testing success 
transpoter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        console.log("Ready for messages");
        console.log(success);
    }
});

router.post("/signup",async(req,res)=>{
    let{name,email,password,contactNumber}=req.body;
    console.log(name);
    console.log(password);
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
        console.log(user)
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
});

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
        res.json({
            status:"PENDING",
            message:"Verification otp email sent",
            data:{
                userId:_id,
                email,
            },
        })
    } catch (error) {
        res.json({
            status:"FAILED",
            message:error.message,
        });
    }
}

router.post("/verifyOTP",async(req,res)=>{
    try {
        let{userId,otp}= req.body;
        if(!userId || !otp){
            throw Error("Empty otp details are not allowed");
        }else{
          const UserOTPVerificationRecords = await UserOTPVerification.find({
            userId,
          });
          if(userOTPVerification.length <=0){
            //no records found
            throw new Error(
                "Account record dosen't exist or has been verified already.Please signup or login."
            );
          }else{
            const {expiresAt} = UserOTPVerificationRecords[0];
            const hashedOTP = UserOTPVerificationRecords[0].otp;

            if(expiresAt < Date.now()){
               await UserOTPVerification.deleteMany({userId});
               throw new Error("Code has expired. Please request again.");
            }else{
               const validOTP = await bycrypt.compare(otp,hashedOTP);

               if(!validOTP){
                throw new Error("Invalid code passed. Check  your inbox");
               }else {
               await User.updateOne({_id:userId},{isVerified:true});
               await UserOTPVerification.deleteMany({userId});
               res.json({
                status:"VERIFIED",
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
});


router.post("/resendOTPVerificationCode",async(req,res)=>{
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
});

module.exports=router;