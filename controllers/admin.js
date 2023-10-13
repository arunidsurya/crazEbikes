const Category = require('../models/category');
const User = require('../models/User');
const Product= require('../models/product');
const Admin = require('../models/admin');
const {setAdmin} = require('../service/auth')


async function handleAdminSignup (req,res){
    const{name,email,password,contactNumber} = req.body;
    await Admin.create({
        name,
        email,
        password,
        contactNumber,
    });
    return res.redirect("/adminLogin");
};

async function handleAdminLogin (req,res){
    const{email,password} = req.body;
    // console.log(email,login);
    const admin = await Admin.findOne({email,password});

    if(!admin) return res.render("adminlogin",{
        error:"Invalid email or password",
    });

    const adminToken = setAdmin(admin);
    res.cookie("adminuid",adminToken);
    return res.redirect("/adminHome");
};

async function handleAdminLogout (req,res){

    res.cookie("adminuid"," ");
    req.admin = " ";
    return res.redirect("/adminLogin");
};

async function handleCategoryView(req,res){
    try {
            const categories= await Category.find({},{category_name:1,_id:1,description:1})
            res.render('categories',{categories});
    } catch (error) {
        console.log(error);
    }
    }

async function handleCategoryAdd(req,res){
    try {
        const{category_name,description}=req.body;
        await Category.create({
            category_name,
            description
        });
        return res.render("addCategories",{message:"Category added successfully"});
    } catch (error) {
        console.log(error);
        return res.render("addCategories",{message:"Failed!!Category already exists"});
    }
    }
    
    async function handleCategoryEdit (req,res){
        let id = req.params.id;
        try {
           await Category.findByIdAndUpdate(id,{
            category_name:req.body.category_name,
            description:req.body.description,
           });
            return res.redirect("/adminCategories");
        } catch (error) {
            console.log(error);
            return res.redirect("/adminCategories");
        }
    }

    async function handleCategoryDelete(req,res){
        let id = req.params.id;
        try {
           await Category.findByIdAndRemove(id);
            return res.redirect("/adminCategories");
        } catch (error) {
            console.log(error);
            return res.redirect("/adminCategories");
        }
    
    }


    async function handleUserView(req,res){
        try {
                const users= await User.find({},{name:1,_id:1,email:1,contactNumber:1})
                res.render('customers',{users});
        } catch (error) {
            console.log(error);
        }
        }
    
    async function handleUserAdd(req,res){
        try {
            const{name,email,password,contactNumber}=req.body;
            await User.create({
                name,
                email,
                password,
                contactNumber
            });
            return res.render("addCustomers",{message:"User added successfully"});
        } catch (error) {
            console.log(error);
            return res.render("addCustomers",{message:"Failed!!User already exists"});
        }
        };

        async function handleCustomerEdit (req,res){
            let id = req.params.id;
            try {
               await User.findByIdAndUpdate(id,{
                name:req.body.name,
                email:req.body.email,
                contactNumber:req.body.contactNumber,
               });
                return res.redirect("/admin/user");
            } catch (error) {
                console.log(error);
                return res.redirect("/admin/user");
            }
        };

        async function handleCustomerDelete(req,res){
            let id = req.params.id;
            try {
               await User.findByIdAndRemove(id);
                return res.redirect("/admin/user");
            } catch (error) {
                console.log(error);
                return res.redirect("/admin/user");
            }
        
        };

        async function handleProductsView(req,res){
            try {
                    const products= await Product.find({})
                    res.render('products',{products});
            } catch (error) {
                console.log(error);
            }
            }
        
        async function handleProductAdd(req,res){
            try {
                const{product_name,categoryId,brand,color,retailPrice,discount,finalPrice,description}=req.body;
                const image=req.file;
                await Product.create({
                    product_name,
                    categoryId,
                    brand,
                    color,
                    imageUrl:image.path,
                    retailPrice,
                    discount,
                    finalPrice,
                    description,
                });
                return res.render("addSuccess",{message:"Product added successfully"});
            } catch (error) {
                console.log(error);
                return res.render("addSuccess",{message:"Failed!!"});
            }
            };

            async function handleProductUpdate (req,res){
                let id = req.params.id;
                const image=req.file;
                try {
                   await Product.findByIdAndUpdate(id,{
                    product_name:req.body.product_name,
                    categoryId:req.body.categoryId,
                    brand:req.body.brand,
                    color:req.body.color,
                    imageUrl:image.path,
                    retailPrice:req.body.retailPrice,
                    discount:req.body.discount,
                    finalPrice:req.body.finalPrice,
                    description:req.body.description,
                   });
                    return res.redirect("/admin/products");
                } catch (error) {
                    console.log(error);
                    return res.redirect("/admin/products");
                }
            };
            async function handleProdcutDelete(req,res){
                let id = req.params.id;
                try {
                   await Product.findByIdAndRemove(id);
                    return res.redirect("/admin/products");
                } catch (error) {
                    console.log(error);
                    return res.redirect("/admin/products");
                }
            
            };;

 
module.exports={
    handleCategoryView,
    handleCategoryAdd,
    handleCategoryEdit,
    handleCategoryDelete,
    handleUserAdd,
    handleUserView,
    handleCustomerEdit,
    handleCustomerDelete,
    handleProductsView,
    handleProductAdd,
    handleProductUpdate,
    handleProdcutDelete,
    handleAdminLogin,
    handleAdminSignup,
    handleAdminLogout,
    
}; 
