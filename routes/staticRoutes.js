const express = require("express");
const Category=require('../models/category')
const User= require('../models/User');
const Product = require("../models/product");
const Admin = require('../models/admin');
const bycrypt = require("bcrypt");
const router = express.Router();
const { setAdmin } = require('../service/auth');

const{handleHomePageView,handleEbikeHomePageView,handleUserSignUpPageView,handleUserSignInPageView,
    handleUserOtpVerifyPageView,handleAdminLoginPageView,handleAdminRegisterPageView,
    handleProductDescriptionPageView,handleUserProductSearch}=require('../controllers/static');
const productsPerPage = 12;




router.get("/",handleHomePageView);

router.get("/ebikes_home",handleEbikeHomePageView);

router.get("/user-signup",handleUserSignUpPageView);

router.get("/user-login",handleUserSignInPageView);

router.get("/user-otp-verification",handleUserOtpVerifyPageView);

router.get("/adminLogin",handleAdminLoginPageView);

router.get("/adminSignup",handleAdminRegisterPageView);

router.get("/product-description",handleProductDescriptionPageView);

router.post("/user-search",handleUserProductSearch);






module.exports = router;

