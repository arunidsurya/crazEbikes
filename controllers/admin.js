const Category = require('../models/category');
const User = require('../models/User');
const Product = require('../models/product');
const Admin = require('../models/admin');
const { setAdmin } = require('../service/auth');
const mongoose = require('mongoose');
const bycrypt = require("bcrypt");
const productValidator=require('../middleware/productValidator');
const {check,validationResult} = require('express-validator');


async function handleHomePageView(req,res){
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    res.render('adminHome');
}


async function handleCategoryView(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    try {
        const categories = await Category.find({ isDeleted: false })
        res.render('categories', { categories });
    } catch (error) {
        console.log(error);
    }
}

async function handleCategorySearch(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    const searchKey=req.body.searchKey;
    const query = { 
        category_name: { $regex: searchKey, $options: 'i' }, 
        isDeleted: false,
    };
    const projection = {}; // Optional fields to include/exclude
    const options = {}; // Additional options (e.g., limit, sort)

    try {
        const categories = await Category.find(query,projection,options)
        res.render('categories', { categories });
    } catch (error) {
        console.log(error);
    }
}
async function handleAddCategoryPageView(req,res){
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    res.render('addCategories');
}

async function handleCategoryAdd(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    try {
        const { category_name, description } = req.body;
        await Category.create({
            category_name,
            description
        });
        return res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        return res.render("addCategories", { message: "Failed!!Category already exists" });
    }
}
async function handleEditCategoryPageView(req,res){
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    // if(!req.admin) return res.redirect('/adminlogin');
    let id = req.params.id;
    const category = await Category.findOne({_id:id});
    // if(!user && user==null) res.render("/categories");
    res.render("editCategories",{category:category});
    
}

async function handleCategoryEdit(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await Category.findByIdAndUpdate(id, {
            category_name: req.body.category_name,
            description: req.body.description,
        });
        return res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        return res.redirect("/adminCategories");
    }
}

async function handleCategoryDelete(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        return res.rednder("categories");
    }

}


async function handleUserView(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
        if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    try {
        const users = await User.find({ isDeleted: false })
        res.render('customers', { users });
    } catch (error) {
        console.log(error);
    }
}

async function handleUserSearch(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    const searchKey = req.body.searchKey;
    const query ={
        name:{$regex:searchKey,$options:'i'},
        isDeleted:false,
    }
    const projection={};
    const options={};
    try {
        const users = await User.find(query,projection,options)
        res.render('customers', { users });
    } catch (error) {
        console.log(error);
    }
}

async function handleAddUserPageView(req,res){
    res.render('addCustomers');
}

async function handleUserAdd(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    try {
        const { name, email, password, contactNumber } = req.body;
        const saltRounds = 10;
        const hashedPassword= await bycrypt.hash(password, saltRounds);
        // console.log(name,email,password,contactNumber,hashedPassword);
        await User.create({
            name,
            email,
            password:hashedPassword,
            contactNumber
        });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.render("addCustomers", { message: "Failed!!User already exists!!" });
    }
};
async function handleEditCustomerPageView(req,res){
    // if(!req.admin) return res.redirect('/adminlogin');
    let id = req.params.id;
    const customer = await User.findOne({_id:id});
    // if(!user && user==null) res.render("/categories");
    res.render("editCustomers",{customer:customer});
    
}

async function handleCustomerEdit(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
        });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }
};

async function handleCustomerDelete(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }

};
async function handleCustomerBlock(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }

};
async function handleCustomerUnblock(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, { isBlocked: false });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }

};

async function handleProductsView(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    try {
        const products = await Product.find({ isDeleted: false }).sort({createdAt:-1}).populate({
            path: 'categoryId',
            select: 'category_name',
        });
        res.render('products', { products });
    } catch (error) {
        console.log(error);
    }
};

async function handleProductsSort(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    const sortid=req.query.sort ||-1;
    try {
        const products = await Product.find({ isDeleted: false }).sort({price:sortid}).populate({
            path: 'categoryId',
            select: 'category_name',
        });
        res.render('products', { products });
    } catch (error) {
        console.log(error);
    }
};

async function handleProductSearch(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    const searchKey=req.body.searchKey;

    const query = { 
        product_name: { $regex: searchKey, $options: 'i' }, 
        isDeleted: false,
    };
    const projection = {}; // Optional fields to include/exclude
    const options = {}; // Additional options (e.g., limit, sort)

    try {
        const products = await Product.find(query,projection,options).populate({
            path: 'categoryId',
            select: 'category_name',
        });
        res.render('products', { products });
    } catch (error) {
        console.log(error);
    }
};

async function handleAddProductPageView(req,res){
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
   const categories = await Category.find({},{category_name:1,_id:1});
    res.render('addProducts',{categories:categories});
}

async function handleProductAdd(req, res) {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        const categories = await Category.find({},{category_name:1,_id:1});
        return res.render('addProducts',{
            errors:errors.mapped(),
            categories:categories,
        });
    }
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    try {
        const { product_name, categoryId, brand, color, price, stock, description } = req.body;
        const files = req.files;
        let imagePaths = [];
        if (files) {
            files.map(file => {
                imagePaths.push(file.path)
            })
        }
        await Product.create({
            product_name,
            categoryId,
            brand,
            color,
            imageUrl: imagePaths,
            price,
            stock,
            description,
        });
        return res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        return res.render("addSuccess", { message: "Failed!!" });
    }
};

async function handleProductUpdatePageView(req,res){
    if(!req.admin&& req.admin==null) return res.redirect('/adminLogin');
    // if(!req.admin) return res.redirect('/adminlogin');
    let id = req.params.id;
    const product = await Product.findOne({_id:id});
    
    const categories = await Category.find({},{category_name:1,_id:1});
    // if(!user && user==null) res.render("/categories");
    res.render("editProducts",{product:product,categories:categories});
    
}

async function handleProductUpdate(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    const files = req.files;
    const product = await Product.findById(id);
    let newImagePaths = [];
    if (files) {
        files.map(file => {
            newImagePaths.push(file.path)
        })
    };

    const combImagePath = [...product.imageUrl, ...newImagePaths];

    try {
        await Product.findByIdAndUpdate(id, {
            product_name: req.body.product_name,
            categoryId: req.body.categoryId,
            brand: req.body.brand,
            color: req.body.color,
            imageUrl: combImagePath,
            price: req.body.price,
            stock: req.body.stock,
            description: req.body.description,
        });
        return res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/products");
    }
};
async function handleProdcutDelete(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/products");
    }

};
async function handleImageDelete(req, res) {
    if(!req.admin && req.admin==null) return res.redirect('/adminLogin');
    let index = req.query.index;
    let id = req.query.productid;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).send("Product not found.");
        }

        // Get the imageUrl at the specified index
        const imageUrlToDelete = product.imageUrl[index];

        // Update the product to remove the imageUrl
        await Product.updateOne(
            { _id: id },
            { $pull: { imageUrl: imageUrlToDelete } }
        );

        return res.redirect("/admin/products");

    } catch (error) {
        console.log(error);
        return res.redirect("/admin/products");
    }

};


module.exports = {
    handleHomePageView,
    handleCategoryView,
    handleCategorySearch,
    handleAddCategoryPageView,
    handleCategoryAdd,
    handleEditCategoryPageView,
    handleCategoryEdit,
    handleCategoryDelete,
    handleAddUserPageView,
    handleUserAdd,
    handleUserView,
    handleUserSearch,
    handleEditCustomerPageView,
    handleCustomerEdit,
    handleCustomerDelete,
    handleProductsView,
    handleProductSearch,
    handleProductsSort,
    handleAddProductPageView,
    handleProductAdd,
    handleProductUpdatePageView,
    handleProductUpdate,
    handleProdcutDelete,
    handleCustomerBlock,
    handleCustomerUnblock,
    handleImageDelete,

}; 

