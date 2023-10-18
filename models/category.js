const mongoose = require('mongoose');

const categorySchema= new mongoose.Schema({
    category_name:{
        type:String,
        unique:true,
    },
    description:{
        type:String,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
},
{
    timestamps:true
}
)

const Category=mongoose.model('category',categorySchema);

module.exports=Category;