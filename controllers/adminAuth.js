const Category = require('../models/category');
const User = require('../models/User');
const Product = require('../models/product');
const Admin = require('../models/admin');
const { setAdmin } = require('../service/auth');
const mongoose = require('mongoose');
const bycrypt = require("bcrypt");
const {check,validationResult} = require('express-validator');


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

    try {
        
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.render('adminlogin',{
                errors:errors.mapped(),
            });
        }
        const { email, password } = req.body;
    
        const admin = await Admin.findOne({ email});
        const validPassword = await bycrypt.compare(password,admin.password);
        if (!admin || !validPassword) return res.render("adminlogin", {
            error: "Invalid email or password",
        });
    
        const adminToken = setAdmin(admin);
        res.cookie("adminuid", adminToken);
        return res.redirect("/admin/dash-board");

    } catch (error) {
        console.log(error);
    }

};

async function handleAdminLogout(req, res) {

    res.cookie("adminuid", " ");
    req.admin = " ";
    return res.redirect("/adminLogin");
};



module.exports = {
    
    handleAdminLogin,
    handleAdminSignup,
    handleAdminLogout,

}; 

