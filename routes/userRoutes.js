const express = require('express');
const Cart = require('../models/cart');
const mongoose = require('mongoose');

const{handleCartView,handleAddToCart,handleUpdateCartQuantity,handleDeleteCartItem,
    handleCheckoutView,handleEditAddress,handleAddNewAddress,handlePlaceOrder,
    handleAddAddressView,handleEditAddressView}=require('../controllers/user')


const router = express.Router();



router.get('/cart-view', handleCartView);

router.get('/checkout', handleCheckoutView);

router.get('/add-new-address', handleAddAddressView);


router.post('/addToCart', handleAddToCart);


router.post('/updateCartQuantity', handleUpdateCartQuantity);


router.post('/detele-cart-item', handleDeleteCartItem );

router.get('/edit-address', handleEditAddressView);

router.post('/edit-address', handleEditAddress );

router.get('/add-new-address', handleAddAddressView);

router.post('/addNewAddress',handleAddNewAddress);

router.post('/place-order',handlePlaceOrder);




module.exports = router;