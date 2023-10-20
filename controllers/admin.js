const Category = require('../models/category');
const User = require('../models/User');
const Product = require('../models/product');
const Admin = require('../models/admin');
const { setAdmin } = require('../service/auth');
const mongoose = require('mongoose');
const bycrypt = require("bcrypt");


async function handleAdminSignup(req, res) {
    const { name, email, password, contactNumber } = req.body;
    const saltRounds = 10;
    const hashedPassword= await bycrypt.hash(password, saltRounds);
    await Admin.create({
        name,
        email,
        password:hashedPassword,
        contactNumber,
    });
    return res.redirect("/adminLogin");
};

async function handleAdminLogin(req, res) {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email});
    const validPassword = await bycrypt.compare(password,admin.password);
    if (!admin || !validPassword) return res.render("adminlogin", {
        error: "Invalid email or password",
    });

    const adminToken = setAdmin(admin);
    res.cookie("adminuid", adminToken);
    return res.redirect("/adminHome");
};

async function handleAdminLogout(req, res) {

    res.cookie("adminuid", " ");
    req.admin = " ";
    return res.redirect("/adminLogin");
};

async function handleCategoryView(req, res) {
    try {
        const categories = await Category.find({ isDeleted: false })
        res.render('categories', { categories });
    } catch (error) {
        console.log(error);
    }
}

async function handleCategorySearch(req, res) {
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

async function handleCategoryAdd(req, res) {
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

async function handleCategoryEdit(req, res) {
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
    try {
        const users = await User.find({ isDeleted: false })
        res.render('customers', { users });
    } catch (error) {
        console.log(error);
    }
}

async function handleUserSearch(req, res) {
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

async function handleUserAdd(req, res) {
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

async function handleCustomerEdit(req, res) {
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



async function handleProductAdd(req, res) {
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

async function handleProductUpdate(req, res) {
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
    handleCategoryView,
    handleCategorySearch,
    handleCategoryAdd,
    handleCategoryEdit,
    handleCategoryDelete,
    handleUserAdd,
    handleUserView,
    handleUserSearch,
    handleCustomerEdit,
    handleCustomerDelete,
    handleProductsView,
    handleProductSearch,
    handleProductsSort,
    handleProductAdd,
    handleProductUpdate,
    handleProdcutDelete,
    handleAdminLogin,
    handleAdminSignup,
    handleAdminLogout,
    handleCustomerBlock,
    handleCustomerUnblock,
    handleImageDelete,

}; 

