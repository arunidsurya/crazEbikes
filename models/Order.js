const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
    total_price: { type: Number },
    Order_date: { type: Date, default: Date.now }, // Set a default value using Date.now()
    User_id: { type: Schema.Types.ObjectId },
    TimeStamp: { type: Date, default: Date.now }, // Set a default value using Date.now()
    isDeleted: { type: Boolean, default:false },
    delivery_address: [{
        Address: { type: String },
        City: { type: String },
        ContactNumber: { type: String },
        Name: { type: String },
        Pincode: { type: String },
        State: { type: String },
    }],
    IsCancelled: { type: Boolean, default:false },
    Items: [{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
        },
        quantity:{
            type:Number,
        }
       
    }],
    Status: { type: String },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports=Orders;
