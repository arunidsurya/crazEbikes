const express = require("express");
const Category=require('../models/category')
const User= require('../models/User');
const Product = require("../models/product");

const router = express.Router();

const productsPerPage = 12;
router.get("/",async(req,res)=>{
    // if(!req.user && req.user==null) return res.redirect('/login');
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
    function formatPrice(price) {
        return price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
    const products= await Product.find({});

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
});
router.get("/product-description",async(req,res)=>{
        // if(!req.user && req.user==null) return res.redirect('/login');
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
        function formatPrice(price) {
            return price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          };
          const id=req.query.productid;
        const products= await Product.findOne({_id:id});
    
    
        const imgUri = process.env.IMGURI;
        return res.render("productDescription",{
            products:products,
            images:images,
            imgUri:imgUri,
            formatPrice,
        });
});

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

