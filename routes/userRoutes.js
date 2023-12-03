const express = require('express');
const Cart = require('../models/cart');
const mongoose = require('mongoose');
const addressValidator = require('../middleware/addressValidator');

const { handleCartView, handleAddToCart, handleUpdateCartQuantity, handleDeleteCartItem,
    handleCheckoutView, handleEditAddress, handleAddNewAddress, handlePlaceOrder,handleOrdersPay,handleWalletPay,
    handleAddAddressView, handleEditAddressView,handleAccountEditAddress, handleMyOrdersView,
    handleSelectedOrderView, handleCancelOrder,handleManageAccountView, handleChangeName, handleChangeNumber, 
    handleChangeEmail,handleVerifyOtp, handleChangePassword, handleVerifyPayment,handleVerifyWalletPayment, handleApplyCoupon, 
    handleWalletView,handleAddToCartFromWishlist, handleAddToWishlist, handleWishlistView, 
    handleDeleteFromWishlist,handleAddToCartOneItemFromWishlist,handleDownloadInvoice } = require('../controllers/user')


const router = express.Router();



router.get('/cart-view', handleCartView);

router.get('/checkout', handleCheckoutView);

router.post('/addToCart', handleAddToCart);

router.get('/wishlist-view', handleWishlistView);

router.post('/addToWishList', handleAddToWishlist);

router.get('/addToCartFromWishlist', handleAddToCartFromWishlist);

router.post('/addToCartOneItemFromWishlist', handleAddToCartOneItemFromWishlist);

router.post('/detele-wishlist-item', handleDeleteFromWishlist);

router.post('/updateCartQuantity', handleUpdateCartQuantity);

router.post('/detele-cart-item', handleDeleteCartItem);

router.get('/edit-address', handleEditAddressView);

router.post('/edit-address-form', handleEditAddress);

router.post('/account-edit-address',addressValidator, handleAccountEditAddress);

router.get('/add-new-address', handleAddAddressView);

router.post('/addNewAddress',addressValidator, handleAddNewAddress);

router.post('/place-order', handlePlaceOrder);

router.get('/view-my-orders', handleMyOrdersView);

router.get('/view-selected-order', handleSelectedOrderView);

router.post('/cancel-order', handleCancelOrder);

router.post('/orders-pay', handleOrdersPay);

router.post('/wallet-pay', handleWalletPay);

router.get('/manage-account', handleManageAccountView);

router.post('/change-name', handleChangeName);

router.post('/change-contact-number', handleChangeNumber);

router.post('/change-email', handleChangeEmail);

router.post('/verify-otp', handleVerifyOtp);

router.post('/change-password', handleChangePassword);

router.post('/verify-payment', handleVerifyPayment); 

router.post('/verify-wallet-payment', handleVerifyWalletPayment);

router.post('/applyCoupon', handleApplyCoupon);

router.get('/wallet', handleWalletView)

router.get('/download-invoice',handleDownloadInvoice)


module.exports = router;