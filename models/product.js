const mongoose = require('mongoose');
const Category = require('../models/category');

const productSchema= new mongoose.Schema({
    product_name:{
        type:String,
        required:true,
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:true,
    },
    brand:{
        type:String,
        required:true,
    },
    color:{
        type:String,
        required:true,
    },
    imageUrl:[{
        type:String,
    }],
    price:{
        type:Number,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
},{
    timestamps:true,
})

const Product = mongoose.model('product',productSchema);

module.exports= Product;