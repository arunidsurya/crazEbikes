const express = require('express');
const Cart = require('../models/cart');
const mongoose = require('mongoose');

const{handleCartView,handleAddToCart,handleUpdateCartQuantity,handleDeleteCartItem}=require('../controllers/user')


const router = express.Router();



router.get('/cart-view', handleCartView);


router.post('/addToCart', handleAddToCart);


router.post('/updateCartQuantity', handleUpdateCartQuantity);


router.post('/detele-cart-item', handleDeleteCartItem );






module.exports = router;