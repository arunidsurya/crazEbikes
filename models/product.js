const mongoose = require('mongoose');

const productSchema= new mongoose.Schema({
    product_name:{
        type:String,
        required:true,
    },
    categoryId:{
        type:String,
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
    imageUrl:{
        type:String,
    },
    retailPrice:{
        type:String,
        required:true,
    },
    discount:{
        type:String,
        required:true,
    },
    finalPrice:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
},{
    timestamps:true,
})

const Product = mongoose.model('product',productSchema);

module.exports= Product;