const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
    total_price: { type: Number },
    coupon_code: { type: String },
    coupon_discount: { type: Number, default: 0 },
    Order_date: { type: Date, default: Date.now }, // Set a default value using Date.now()
    User_id: { type: Schema.Types.ObjectId, ref: 'user' },
    TimeStamp: { type: Date, default: Date.now }, // Set a default value using Date.now()
    isDeleted: { type: Boolean, default: false },
    delivery_address: [{
        Address: { type: String },
        City: { type: String },
        ContactNumber: { type: String },
        Name: { type: String },
        Pincode: { type: String },
        State: { type: String },
    }],
    IsCancelled: { type: Boolean, default: false },
    cancelledDate: { type: Date,default:null },
    IsRefund:{ type: Boolean, default: false },
    refundDate: { type: Date, default:null},
    Items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
        },
        quantity: {
            type: Number,
        },
        product_name: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        price: {
            type: Number,
        },
        color: {
            type: String,
        }
    }]
    ,
    Status: { type: String },
    payment_method: { type: String },
    payment_status: { type: String, default: "Pending" },
    invoiceNumber:{type:String}
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;
