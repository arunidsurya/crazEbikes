const express = require('express');
const cron = require('node-cron');
const Orders = require('../models/Order');

const deleteExpiredOrders=async() =>{
    try {
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const ordersToDelete = await Orders.find({
            payment_status:'Pending',
            Order_date:{$lt:thirtyDaysAgo},
        });

        for (const order of ordersToDelete) {
            order.IsDeleted = true;
            order.IsCancelled = true;
            order.cancelledDate = currentDate;
            await order.save();
            console.log(`Order ${order._id} cancelled due to non-payment.`);
          }


    } catch (error) {
        
        console.log(error);
   }

};

module.exports=deleteExpiredOrders;


