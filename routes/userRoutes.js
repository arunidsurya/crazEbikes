const express = require('express');
const Cart = require('../models/cart');
const mongoose = require('mongoose');

const { handleCartView, handleAddToCart, handleUpdateCartQuantity, handleDeleteCartItem,
    handleCheckoutView, handleEditAddress, handleAddNewAddress, handlePlaceOrder,
    handleAddAddressView, handleEditAddressView, handleOrdersView, handleCancelOrder,
    handleManageAccountView, handleChangeName, handleChangeNumber, handleChangeEmail,
    handleVerifyOtp, handleChangePassword, handleVerifyPayment, handleApplyCoupon, handleWalletView,
    handleAddToCartFromWishlist, handleAddToWishlist, handleWishlistView, handleDeleteFromWishlist,
    handleDownloadInvoice } = require('../controllers/user')


const router = express.Router();



router.get('/cart-view', handleCartView);

router.get('/checkout', handleCheckoutView);

router.get('/add-new-address', handleAddAddressView);

router.post('/addToCart', handleAddToCart);

router.get('/wishlist-view', handleWishlistView);

router.post('/addToWishList', handleAddToWishlist);

router.get('/addToCartFromWishlist', handleAddToCartFromWishlist);

router.post('/detele-wishlist-item', handleDeleteFromWishlist);

router.post('/updateCartQuantity', handleUpdateCartQuantity);

router.post('/detele-cart-item', handleDeleteCartItem);

router.get('/edit-address', handleEditAddressView);

router.post('/edit-address', handleEditAddress);

router.get('/add-new-address', handleAddAddressView);

router.post('/addNewAddress', handleAddNewAddress);

router.post('/place-order', handlePlaceOrder);

router.get('/view-orders', handleOrdersView);

router.post('/cancel-order', handleCancelOrder);

router.get('/manage-account', handleManageAccountView);

router.post('/change-name', handleChangeName);

router.post('/change-contact-number', handleChangeNumber);

router.post('/change-email', handleChangeEmail);

router.post('/verify-otp', handleVerifyOtp);

router.post('/change-password', handleChangePassword);

router.post('/verify-payment', handleVerifyPayment);

router.post('/applyCoupon', handleApplyCoupon);

router.get('/wallet', handleWalletView)

router.get('/download-invoice',handleDownloadInvoice)


module.exports = router;