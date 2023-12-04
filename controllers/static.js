const express = require("express");
const Category=require('../models/category')
const User= require('../models/User');
const Product = require("../models/product");
const Admin = require('../models/admin');
const bycrypt = require("bcrypt");
const router = express.Router();
const { setAdmin } = require('../service/auth');
const productsPerPage = 12;
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


async function handleHomePageView(req,res){
    // if(!req.user && req.user==null) return res.redirect('/login');

    function formatPrice(price) {
        return price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const sort = req.query.sort || -1 ;
    
    const products= await Product.find({isDeleted:false}).sort({price:sort});

    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = page * productsPerPage;
    const slicedProducts = products.slice(startIndex, endIndex);
    
    return res.render("userHome",{
        products:slicedProducts,
        page,
        pageCount: Math.ceil(products.length / productsPerPage),
        images:images,
        imgUri:imgUri,
        formatPrice,
        sort,
    });
}

async function handleEbikeHomePageView(req,res){
    // if(!req.user && req.user==null) return res.redirect('/login');
 
    function formatPrice(price) {
        return price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
    
      const sort = req.query.sort || -1 ;
      const category = req.query.category;
      const categories= await Category.find({category_name:category,isDeleted:false});
      const categoryIds = categories.map(category => category._id);
    const products= await Product.find({categoryId:categoryIds,isDeleted:false}).sort({price:sort});
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = page * productsPerPage;
    const slicedProducts = products.slice(startIndex, endIndex);
    const imgUri = process.env.IMGURI;
    return res.render("userHome",{
        products:slicedProducts,
        page,
        pageCount: Math.ceil(products.length / productsPerPage),
        images:images,
        imgUri:imgUri,
        formatPrice,
        sort,
    });
}



async function handleUserSignUpPageView(req,res){

    const imgUri = process.env.IMGURI;

    res.render('userSignup',{images:images,imgUri:imgUri});
}


async function handleUserSignInPageView(req,res){
    if(req.user && req.user!=null) return res.redirect('/');
    res.render('userlogin',{images:images,imgUri:imgUri});
}


async function handleUserOtpVerifyPageView(req,res){

    res.render('userOtpVerify',{images:images,imgUri});
}

async function handleAdminLoginPageView(req,res){
    if(req.admin&& req.admin!=null) return res.redirect('/adminHome');
    return res.render("adminlogin")
}

async function handleAdminRegisterPageView(req,res){
    return res.render("adminSignup")
}


async function handleProductDescriptionPageView(req,res){
    // if(!req.user && req.user==null) return res.redirect('/login');

    function formatPrice(price) {
        return price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
      const id=req.query.productid;
    const products= await Product.findOne({_id:id});

      const totalReviews=products.reviews.length;
      const totalScore= products.reviews.reduce((sum,review)=>sum + review.score,0 );
      const avergaeScore= (totalScore / totalReviews).toFixed(1);


    const imgUri = process.env.IMGURI;
    return res.render("productDescription",{
        products:products,
        images:images,
        imgUri:imgUri,
        totalReviews,
        totalScore,
        avergaeScore,
        formatPrice,
    });
}


async function handleUserProductSearch(req,res){
    // if(!req.user && req.user==null) return res.redirect('/login');

    function formatPrice(price) {
        return price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };


      try {
        
        const searchWord=req.body.search;

        // Use a regular expression to match partial names
        const query = { 
            product_name: { $regex: searchWord, $options: 'i' }, 
            isDeleted: false,
        };
        const projection = {}; // Optional fields to include/exclude
        const options = {}; // Additional options (e.g., limit, sort)
    
        const products= await Product.find(query,projection,options);
    
        const page = parseInt(req.query.page) || 1;
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = page * productsPerPage;
        const slicedProducts = products.slice(startIndex, endIndex);
        const imgUri = process.env.IMGURI;

        return res.render("userHome",{
            products:slicedProducts,
            page,
            pageCount: Math.ceil(products.length / productsPerPage),
            images:images,
            imgUri:imgUri,
            formatPrice,
        });

      } catch (error) {
        console.log(error);
      }


}




module.exports={
    handleHomePageView,
    handleEbikeHomePageView,
    handleUserSignUpPageView,
    handleUserSignInPageView,
    handleUserOtpVerifyPageView,
    handleAdminLoginPageView,
    handleAdminRegisterPageView,
    handleProductDescriptionPageView,
    handleUserProductSearch,
}