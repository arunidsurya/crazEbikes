const express = require("express");
const Category=require('../models/category')
const User= require('../models/User');
const Product = require("../models/product");

const router = express.Router();


router.get("/",async(req,res)=>{
    // if(!req.user && req.user==null) return res.redirect('/login');
    const images ={
        cover:'resources/images/coverPhoto.jpg',
        logo:'resources/images/logo.jpg'
    }
    const allProducts= await Product.find({});
    return res.render("userHome",{products:allProducts,images:images});
})

router.get("/admin",async(req,res)=>{
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    res.render('adminHome');
});

router.get("/adminLogin",(req,res)=>{
    return res.render("adminlogin")
})
router.get("/adminSignup",(req,res)=>{
    return res.render("adminSignup")
})

router.get("/adminHome",(req,res)=>{
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    res.render('adminHome');
});
router.get("/adminProducts",(req,res)=>{
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    res.render('products');
});
router.get("/addProducts",async (req,res)=>{
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
   const categories = await Category.find({},{category_name:1,_id:1});
    res.render('addProducts',{categories:categories});
});
router.get("/editProducts/:id",async(req,res)=>{
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    // if(!req.admin) return res.redirect('/adminlogin');
    let id = req.params.id;
    const product = await Product.findOne({_id:id});
    
    const categories = await Category.find({},{category_name:1,_id:1});
    // if(!user && user==null) res.render("/categories");
    res.render("editProducts",{product:product,categories:categories});
    
});


router.get("/addAdminCategories",(req,res)=>{
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    res.render('addCategories');
});
router.get("/editCategories/:id",async(req,res)=>{
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    // if(!req.admin) return res.redirect('/adminlogin');
    let id = req.params.id;
    const category = await Category.findOne({_id:id});
    // if(!user && user==null) res.render("/categories");
    res.render("editCategories",{category:category});
    
});


router.get("/addCustomers",(req,res)=>{
    res.render('addCustomers');
});
router.get("/editCustomers/:id",async(req,res)=>{
    // if(!req.admin) return res.redirect('/adminlogin');
    let id = req.params.id;
    const customer = await User.findOne({_id:id});
    // if(!user && user==null) res.render("/categories");
    res.render("editCustomers",{customer:customer});
    
});

router.get("/adminOrders",(req,res)=>{
    res.render('customers');
});

router.get("/adminPayments",(req,res)=>{
    res.render('payments');
});


module.exports = router;