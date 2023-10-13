const mongoose = require('mongoose');

const categorySchema= new mongoose.Schema({
    category_name:{
        type:String,
        unique:true,
    },
    description:{
        type:String,
    },
},
{
    timestamps:true
}
)

const Category=mongoose.model('category',categorySchema);

module.exports=Category;