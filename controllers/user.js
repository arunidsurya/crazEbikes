const express = require("express");
const Cart = require('../models/cart');
const mongoose = require('mongoose');
const User = require('../models/User');
const Orders = require('../models/Order');
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
const bycrypt = require("bcrypt");
const userOTPVerification = require("../models/userOTPVerification");
const transpoter = require("../utils/nodeMailer");
const Razorpay = require('razorpay');
const Coupon = require("../models/coupon");
const Product = require("../models/product");

var instance = new Razorpay({ key_id: process.env.RZP_KEY_ID, key_secret: process.env.RZP_SECRET_KEY })

const images = {
    cover: 'resources/images/coverPhoto.jpg',
    logo: 'resources/images/logo.jpg',
    amazon: 'resources/images/amazon.jpg',
    dhl: 'resources/images/dhl.jpg',
    fedex: 'resources/images/fedex.jpg',
    gPay: 'resources/images/gPay.jpg',
    master: 'resources/images/master.jpg',
    visa: 'resources/images/visa.jpg',
};

const imgUri = process.env.IMGURI;

function formatPrice(price) {
    return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

function generateInvoiceNumber() {
    const staticPrefix = "INV/CRAZEBIKES/WS/2023"; // Add your static alphanumeric values here
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number

    return `${staticPrefix}${randomDigits}`;
}


async function handleCartView(req, res, next) {
    const userId = req.session.userId;

    try {
        const cartDataResult = await Cart.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $unwind: '$cartItems'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'cartItems.product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $group: {
                    _id: null,
                    cartdata: {
                        $push: {
                            product: '$product',
                            quantity: '$cartItems.quantity',
                        }
                    },
                    cartTotal: {
                        $sum: {
                            $multiply: [
                                '$cartItems.quantity',
                                '$product.price'
                            ]
                        }
                    },
                    totalQuantity: { $sum: '$cartItems.quantity' }
                }
            },
        ]);

        if (cartDataResult.length === 0) {
            return res.render('cart', { imgUri, images, message: "0 items in the cart" });
        }

        const { cartdata, cartTotal } = cartDataResult[0]; // Remove userId and totalQuantity here

        res.render('cart', { cartdata, cartTotal, userId, totalQuantity: cartDataResult[0].totalQuantity, imgUri, images, formatPrice });
    } catch (err) {
        console.error('Error:', err);
        next(err);
        // return res.render('cart', { imgUri, images, message: "0 items in the cart" });
        
    }

};

async function handleAddToCart(req, res, next) {
    const userId = req.session.userId;

        try {
            const product_id = req.query.product_id || req.body.productId;
            const quantity = req.body.quantity || 1;


            // Check if the user's cart exists; if not, create a new one
            let cart = await Cart.findOne({ userId: userId });
            if (!cart) {
                cart = new Cart({ userId: userId, cartItems: [] });
            }

            // Check if the product already exists in the cart
            const existingCartItemIndex = cart.cartItems.findIndex(item => item.product_id.toString() === product_id);

            const quantityToAdd = parseInt(quantity, 10);
            if (existingCartItemIndex !== -1) {
                // If the product is already in the cart, update the quantity
                cart.cartItems[existingCartItemIndex].quantity += quantityToAdd;
            } else {
                // If the product is not in the cart, add it
                cart.cartItems.push({ product_id, quantity });
            }

            // Save the updated cart
            await cart.save();

            try {
                const cartDataResult = await Cart.aggregate([
                    {
                        $match: { userId: new mongoose.Types.ObjectId(userId) }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'cartItems.product_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $group: {
                            _id: null,
                            cartdata: {
                                $push: {
                                    product: '$product',
                                    quantity: '$cartItems.quantity' // Include quantity from cartItems
                                }
                            },
                            cartTotal: {
                                $sum: {
                                    $multiply: [
                                        '$cartItems.quantity',
                                        '$product.price'
                                    ]
                                }
                            },
                            totalQuantity: { $sum: '$cartItems.quantity' }
                        }
                    },

                ]);


                if (cartDataResult.length === 0) {
                    // No records found
                    const err = new Error(`no matching data found!!!` );
                    err.status='fail';
                    err.statusCode=404;
                    next(err);
                }

                const { cartdata, cartTotal, totalQuantity } = cartDataResult[0];
                // console.log(cartdata)

                res.render('cart', { cartdata, cartTotal, userId, totalQuantity, imgUri, images, formatPrice });
            } catch (error) {
                console.error('Error:', err);
                next(error);
            }
        } catch (error) {
            console.error(error);
            next(error);
            // res.status(500).json({ error: 'An error occurred while adding the item to the cart' });
        }
};

async function handleAddToCartOneItemFromWishlist(req, res , next) {
    const userId = req.session.userId;

        try {
            const product_id = req.query.product_id || req.body.productId;
            const quantity = req.body.quantity || 1;


            // Check if the user's cart exists; if not, create a new one
            let cart = await Cart.findOne({ userId: userId });
            if (!cart) {
                cart = new Cart({ userId: userId, cartItems: [] });
            }

            // Check if the product already exists in the cart
            const existingCartItemIndex = cart.cartItems.findIndex(item => item.product_id.toString() === product_id);

            const quantityToAdd = parseInt(quantity, 10);
            if (existingCartItemIndex !== -1) {
                // If the product is already in the cart, update the quantity
                cart.cartItems[existingCartItemIndex].quantity += quantityToAdd;
            } else {
                // If the product is not in the cart, add it
                cart.cartItems.push({ product_id, quantity });
            }

            // Save the updated cart
            await cart.save();

            const user = await User.findById(userId);

            if (!user) {
                const err = new Error(`no matching data found!!!` );
                err.status='fail';
                err.statusCode=404;
                next(err);
            }

            // Check if the product exists in the wishlist
            const indexToRemove = user.wishlist.indexOf(product_id);
            if (indexToRemove !== -1) {
                // Remove the productId from the wishlist array
                user.wishlist.splice(indexToRemove, 1);

                // Save the updated user document
                await user.save();
            }

            res.redirect('/user/wishlist-view');

        } catch (error) {
            console.error(error);
            next(error);
        }
};

async function handleAddToCartFromWishlist(req, res, next) {
    const userId = req.session.userId;

        try {
            // Assuming user.wishlist contains the product IDs
            const user = await User.findById(userId);

            if (!user) {
                const err = new Error(`no matching data found!!!` );
                err.status='fail';
                err.statusCode=404;
                next(err);
            }

            const wishlistProductIds = user.wishlist || [];

            // Check if the user's cart exists; if not, create a new one
            let cart = await Cart.findOne({ userId: userId });
            if (!cart) {
                cart = new Cart({ userId: userId, cartItems: [] });
            }

            // Convert cart items to a map for efficient lookup
            const cartItemMap = new Map(cart.cartItems.map(item => {
                // Check if the item has a product_id property before using it
                if (item && item.product_id) {
                    return [item.product_id.toString(), item];
                } else {
                    // Handle the case where an item is missing the product_id property
                    console.error('Invalid item in cart.cartItems:', item);
                    return null; // or handle it in a way that makes sense for your application
                }
            }).filter(Boolean));


            // Iterate through wishlist product IDs and add them to the cart
            for (const product_id of wishlistProductIds) {
                const quantityToAdd = 1; // You can adjust the quantity as needed

                // Check if the product already exists in the cart
                if (cartItemMap.has(product_id.toString())) {
                    // If the product is already in the cart, update the quantity
                    cartItemMap.get(product_id.toString()).quantity += quantityToAdd;
                } else {
                    // If the product is not in the cart, add it
                    cartItemMap.set(product_id.toString(), { product_id, quantity: quantityToAdd });
                }
            }

            // Convert back to array and update cart items
            cart.cartItems = Array.from(cartItemMap.values());

            // Save the updated cart
            await cart.save();

            // Clear the wishlist for the user
            // Assuming you have a Wishlist model with a method to clear items by user ID
            user.wishlist = [];
            await user.save();

            // Redirect to the cart page or any other desired page
            res.redirect('/user/cart-view');
        } catch (error) {
            console.error(error);
            next(error);
        }
}


async function handleWishlistView(req, res, next) {
    const userId = req.session.userId;

    try {
        const user = await User.findById(userId).populate('wishlist'); // Populate the wishlist array with product details

        if (!user) {
            const err = new Error(`no matching data found!!!` );
            err.status='fail';
            err.statusCode=404;
            next(err);
        }

        // Extract product details from the populated wishlist
        const products = user.wishlist.map(product => ({
            _id: product._id,
            name: product.product_name,
            brand: product.brand,
            color: product.color,
            imageUrl: product.imageUrl[0],
            price: product.price,
            description: product.description,
        }));

        if (products.length === 0) {
            return res.render('cart', { imgUri, images, message: "0 items in your wishlist" });
        }
        // Now, you can send the 'products' array to the UI
        res.render('wishlist', { products, images, imgUri, userId, formatPrice });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

async function handleAddToWishlist(req, res, next) {
    const userId = req.session.userId;
    const productId = req.query.productId;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            const err = new Error(`no matching data found!!!` );
            err.status='fail';
            err.statusCode=404;
            next(err);
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            const err = new Error(`no matching data found!!!` );
            err.status='fail';
            err.statusCode=404;
            next(err);
        }

        // Check if the product is already in the wishlist
        if (user.wishlist.includes(productId)) {
            throw new Error('Product is already in the wishlist');
        }

        // Add the product to the wishlist
        user.wishlist.push(productId);

        // Save the updated user document
        await user.save();

        res.json({ success: true, message: 'Product added to wishlist successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        return { success: false, message: error.message };
    }
}

async function handleDeleteFromWishlist(req, res) {

    const userId = req.query.userId;
    const productId = req.query.productId;


    try {
        // Find the user by userId
        const user = await User.findById({ _id: userId });

        if (!user) {
            const err = new Error(`Task not completed!!!` );
            err.status='fail';
            err.statusCode=404;
            next(err);
        }

        // Check if the product exists in the wishlist
        const productIndex = user.wishlist.findIndex(product => product.toString() === productId);

        if (productIndex === -1) {
            throw new Error('Product not found in the wishlist');
        }

        // Remove the product from the wishlist array
        user.wishlist.splice(productIndex, 1);

        // Save the updated user with the removed product
        await user.save();

        res.redirect('/user/wishlist-view');
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error removing product from wishlist' };
    }

}
async function handleUpdateCartQuantity(req, res) {

    function formatPrice(price) {
        return price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    try {
        const userId = req.session.userId;
        const itemId = req.body.itemId;
        const newQuantity = req.body.newQuantity;

        // Find the user's cart
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            const err = new Error(`Cart not found!!!` );
            err.status='fail';
            err.statusCode=404;
            next(err);
        }

        // Find the item in the cart
        const cartItem = cart.cartItems.find(item => item.product_id.toString() === itemId);

        if (!cartItem) {
            return res.json({ success: false, message: 'Item not found in the cart.' });
        } else {
            // Update the item's quantity
            cartItem.quantity = newQuantity;

            // Save the updated cart
            await cart.save();

            try {
                const cartDataResult = await Cart.aggregate([
                    {
                        $match: { userId: new mongoose.Types.ObjectId(userId) }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'cartItems.product_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $group: {
                            _id: null,
                            cartdata: {
                                $push: {
                                    product: '$product',
                                    quantity: '$cartItems.quantity',
                                }
                            },
                            cartTotal: {
                                $sum: {
                                    $multiply: [
                                        '$cartItems.quantity',
                                        '$product.price'
                                    ]
                                }
                            },
                            totalQuantity: { $sum: '$cartItems.quantity' }
                        }
                    },
                ]);

                if (cartDataResult.length === 0) {
                    return res.render('cart', { imgUri, images, message: "0 items in the cart" });
                }

                const { cartTotal, totalQuantity } = cartDataResult[0];
                res.json({ success: true, cartTotal, totalQuantity, formatPrice });
            } catch (err) {
                console.error('Error:', err);
                return res.render('cart', { imgUri, images, message: "0 items in the cart" });
            }
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the cart.' });
    }
};


// async function handleDeleteCartItem(req, res) {
//     const userId = req.query.userid;
//     const product_id = req.query.productid;

//     try {
//         const cart = await Cart.updateOne(
//             { userId: userId },
//             {
//                 $pull: { cartItems: { product_id: product_id } }
//             }
//         );

//         if (cart) {
//             res.redirect('cart-view');
//         }
//     } catch (error) {
//         console.log(error);
//     }
// };

async function handleDeleteCartItem(req, res) {
    const userId = req.query.userid;
    const product_id = req.query.productid;

    console.log(userId);
    console.log(product_id);
    try {
        const cart = await Cart.updateOne(
            { userId: userId },
            {
                $pull: { cartItems: { product_id: product_id } }
            }
        );

        if (cart) {
            res.json({success:true});
        }
    } catch (error) {
        console.log(error);
    }
};

async function handleCheckoutView(req, res) {
    const userId = req.session.userId;

        const userAddress = await User.findById({ _id: userId }, { delivery: 1, _id: 0 });

        try {
            const cartDataResult = await Cart.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(userId) }
                },
                {
                    $unwind: '$cartItems'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'cartItems.product_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: null,
                        cartdata: {
                            $push: {
                                product: '$product',
                                quantity: '$cartItems.quantity',
                            }
                        },
                        cartTotal: {
                            $sum: {
                                $multiply: [
                                    '$cartItems.quantity',
                                    '$product.price'
                                ]
                            }
                        },
                        totalQuantity: { $sum: '$cartItems.quantity' }
                    }
                },
            ]);

            const { cartdata, cartTotal } = cartDataResult[0]; // Remove userId and totalQuantity here

            res.render('checkout', { cartdata, cartTotal, userAddress, userId, totalQuantity: cartDataResult[0].totalQuantity, imgUri, images, formatPrice });
        } catch (err) {
            console.error('Error:', err);
            return res.render('cart', { imgUri, images, message: "0 items in the cart" });
        }
}

async function handleEditAddressView(req, res) {
    const addressId = req.query.id;
    const userId = req.query.userId;


    const address = await User.findOne(
        { _id: userId, "delivery._id": addressId },
        { "delivery.$": 1 }
    );

    const deliveryAddress = address.delivery[0];

    res.render('editAddress', { images, imgUri, deliveryAddress, userId });
}




async function handleEditAddress(req, res) {

    const { id, name, contactNumber, pincode, address, city, state, userId } = req.body;

        try {
            const user = await User.updateOne({ _id: userId, 'delivery._id': id },
                {
                    $set: {
                        'delivery.$.name': name,
                        'delivery.$.contactNumber': contactNumber,
                        'delivery.$.pincode': pincode,
                        'delivery.$.address': address,
                        'delivery.$.city': city,
                        'delivery.$.state': state
                    }
                }
            );
            res.redirect('/user/checkout')
        } catch (error) {
            console.log(error);
        }
}

async function handleAddAddressView(req, res) {
    res.render('addAddress', { imgUri, images });
}

async function handleAddNewAddress(req, res) {

    const { name, contactNumber, pincode, address, city, state, userId } = req.body;

    try {
        await User.updateOne({ userId: userId },
            {
                $push: {
                    delivery: {
                        name, contactNumber, pincode, address, city, state
                    }
                }
            }
        )
        res.redirect('/user/checkout');
    } catch (error) {

    }
}

async function handlePlaceOrder(req, res) {
    const { selectedAddressId, paymentMethod, userId, totalPrice, coupon_name, coupon_amount } = req.body;

        try {
            const status = paymentMethod === 'COD' ? 'placed' : 'pending';

            const user = await User.findById(userId);
            const address = [];
            const selectedAddressObj = user.delivery.find((deliveryAddress) =>
                deliveryAddress._id.equals(selectedAddressId) // Use the `equals` method to compare ObjectId
            );

            if (selectedAddressObj) {
                const cleanedAddress = {
                    Address: selectedAddressObj.address,
                    City: selectedAddressObj.city,
                    ContactNumber: selectedAddressObj.contactNumber,
                    Name: selectedAddressObj.name,
                    Pincode: selectedAddressObj.pincode,
                    State: selectedAddressObj.state,
                };

                address.push(cleanedAddress);
            }

            const cart = await Cart.findOne({ userId: userId })
                .populate('cartItems.product_id')
                .exec();

            if (cart) {
                // Step 2: Loop through the cart items and extract product details.
                const orderItems = cart.cartItems.map(cartItem => {
                    const product = cartItem.product_id;
                    return {
                        product_id: product._id,
                        quantity: cartItem.quantity,
                        product_name: product.product_name,
                        imageUrl: product.imageUrl[0],
                        price: product.price,
                        color: product.color,
                    };
                });

                if (status && address && orderItems) {
                    const invoiceNumber = generateInvoiceNumber();

                    const newOrder = new Orders({
                        invoiceNumber: invoiceNumber,
                        total_price: totalPrice,
                        User_id: user._id,
                        delivery_address: address,
                        Items: orderItems,
                        Status: status,
                        payment_method: paymentMethod,
                        coupon_code: coupon_name || null,
                        coupon_discount: coupon_amount || 0,
                    });

                    const saveOrder = await newOrder.save();
                    await Cart.deleteMany({ userId: user._id });

                    // Update stock for each product in orderItems
for (const orderItem of orderItems) {
    const productId = orderItem.product_id;
    const quantity = orderItem.quantity;

    // Assuming you have a Product model
    const product = await Product.findById(productId);

    // Update stock
    if (product) {
        const updatedStock = product.stock - quantity;
        // Assuming 'stock' is the field in your Product model representing the stock
        await Product.findByIdAndUpdate(productId, { stock: updatedStock });
    }
}


                    if (req.body.paymentMethod === 'COD') {
                        res.json({ CODpayment: true });
                    } else if (req.body.paymentMethod === 'ONLINE') {
                        const user = await User.findById({ _id: userId });
                        const walletAmount = user.wallet.amount || 0;
                        const amount = (parseInt(totalPrice, 10)) * 100;
                        const orderId = saveOrder._id;
                        var options = {
                            amount: amount,
                            currency: "INR",
                            receipt: orderId,
                        };
                        instance.orders.create(options, function (err, order) {
                            const order_det = order;
                            // console.log("new Order:",order_det);
                            res.json({ order: order_det, walletAmount, KEY_ID: process.env.RZP_KEY_ID });
                        })
                    } else if (req.body.paymentMethod === 'WALLET') {
                        const user = await User.findById({ _id: userId });
                        if (user) {
                            const walletAmount = user.wallet.amount;
                            const priceToPay = (parseInt(totalPrice, 10));

                            if (priceToPay < walletAmount) {
                                const remainingWalletAmount = walletAmount - totalPrice;
                                console.log(remainingWalletAmount);
                                const orderId = saveOrder.id;
                                const updatedOrder = await Orders.findByIdAndUpdate(
                                    { _id: orderId },
                                    { $set: { payment_status: 'Completed', Status: 'Placed' } }
                                );
                                const source = updatedOrder.invoiceNumber;
                                const updatedWallet = await User.findByIdAndUpdate(
                                    { _id: userId },
                                    {
                                        $set: { 'wallet.amount': remainingWalletAmount }, // Increment wallet amount
                                        $push: { 'wallet.transactions': { source: source, method: 'debit', description: 'Payment completd for the order', transaction_amount: priceToPay } } // Push transaction details
                                    },
                                    { new: true }
                                );

                                res.json({ WALLETpayment: true });

                            } else {
                                const amount = (priceToPay - walletAmount) * 100;
                                const orderId = saveOrder._id;
                                var options = {
                                    amount: amount,
                                    currency: "INR",
                                    receipt: orderId,
                                };
                                instance.orders.create(options, function (err, order) {
                                    const order_det = order;
                                    // console.log("new Order:",order_det);
                                    res.json({ order: order_det, walletAmount, KEY_ID: process.env.RZP_KEY_ID });
                                })
                            }

                        }
                    }


                    // res.redirect('/user/view-my-orders');

                    // res.status(200).json({ message: 'Order placed successfully' });
                }
            } else {
                res.status(404).json({ error: 'Cart not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
}



async function handleMyOrdersView(req, res) {
    const userId = req.session.userId;

        try {

            const page = parseInt(req.query.page) || 1;
            const itemsPerPage = 5;

            // Find all orders for the given user ID with pagination
            const userOrders = await Orders.find({ User_id: userId, isDeleted: false })
                .sort({ Order_date: -1 })
                .skip((page - 1) * itemsPerPage)
                .limit(itemsPerPage);


            // Create an array to accumulate orders' data
            const ordersData = userOrders.map(order => {
                return {
                    total_price: order.total_price,
                    Status: order.Status,
                    OrderDate: `${order.Order_date.getFullYear()}-${order.Order_date.getMonth() + 1}-${order.Order_date.getDate()}`,
                    TimeStamp: `${order.TimeStamp.getFullYear()}-${order.TimeStamp.getMonth() + 1}-${order.TimeStamp.getDate()}`,
                    IsCancelled: order.IsCancelled,
                    invoiceNumber: order.invoiceNumber,
                    // Extract and transform items
                    productsArray: order.Items.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        product_name: item.product_name,
                        imageUrl: item.imageUrl,
                        price: item.price,
                        color: item.color,
                    })),
                    address: order.delivery_address[0], // Assuming there's only one address in an order
                    totalPrice: order.total_price,
                    isCancelled: order.IsCancelled,
                    collectionId: order._id,
                    payment_method: order.payment_method,
                    coupon_amount: order.coupon_discount || 0,
                };
            });

            // Calculate total number of pages
            const totalOrders = await Orders.countDocuments({ User_id: userId, isDeleted: false });
            const totalPages = Math.ceil(totalOrders / itemsPerPage);

            // Now, after processing all orders, render the view and send the accumulated data
            res.render('manageOrders', { imgUri, images, ordersData, formatPrice, currentPage: page, totalPages });

        } catch (error) {
            console.error(error);
            throw error; // Handle the error as needed
        }

}

async function handleSelectedOrderView(req, res) {
    const orderId = req.query.orderId;
    const userId = req.session.userId;

        const order = await Orders.findById({ _id: orderId });
        res.render('viewSelectedorder', { order, imgUri, images, formatPrice })

}


async function handleCancelOrder(req, res) {
    const orderId = req.query.orderId;
    const userId = req.session.userId;
    const dateToday = (new Date()).toISOString();

        try {
            const order = await Orders.findByIdAndUpdate({ _id: orderId },
                {
                    $set: { IsCancelled: true, Status: 'Cancelled', cancelledDate: dateToday }
                }
            );

            res.redirect('/user/view-my-orders');
        } catch (error) {
            console.log(error)
        }

};

async function handleManageAccountView(req, res) {
    const userId = req.session.userId;

        try {

            const user = await User.findById({ _id: userId });

            res.render('manageAccount', { user, images, imgUri });

        } catch (error) {
            console.log(error)
        }
}

async function handleChangeName(req, res) {
    const userId = req.session.userId;
    const name = req.body.name;

        try {

            const user = await User.findOneAndUpdate({ _id: userId }, {
                $set: {
                    name: name
                }
            });

            res.json({ success: true });

        } catch (error) {
            console.log(error)
        }

}

async function handleChangeNumber(req, res) {
    const userId = req.session.userId;
    const contactNumber = req.body.contactNumber;

        try {

            const user = await User.findOneAndUpdate({ _id: userId }, {
                $set: {
                    contactNumber: contactNumber
                }
            });

            if (user) {
                res.json({ success: true });
            } else {
                console.log("no user found")
            }

        } catch (error) {
            console.log(error)
        }
}


async function handleChangeEmail(req, res) {
    const email = req.body.email;
    const id = req.session.userId;

    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        //mail options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `<p> Enter <b>${otp}</b> in the app to verify your email address.</p>
            <p>This code will <b> Expires in one hour</b></P> `
        };
        // hash the otp
        const saltRounds = 10;
        const hashedOTP = await bycrypt.hash(otp, saltRounds);
        const newOTPVerification = await new userOTPVerification({
            userId: id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });
        // save otp record
        await newOTPVerification.save();
        transpoter.sendMail(mailOptions, (error, res) => {
            if (error) {
                console.log(error);
            }

        });
        res.json({ success: true, email })

    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        });
    }

}

async function handleVerifyOtp(req, res) {
    const email = req.body.newEmail;
    const otp = req.body.otp;
    const userId = req.session.userId;

    try {
        if (userId && otp) {
            const userOTPVerificationRecords = await userOTPVerification.find({
                userId,
            });

            const { expiresAt } = userOTPVerificationRecords[0];
            const hashedOTP = userOTPVerificationRecords[0].otp;

            const validOTP = await bycrypt.compare(otp, hashedOTP);


            if (validOTP) {
                await User.updateOne({ _id: userId }, { isVerified: true, email: email });
            }

            await userOTPVerification.deleteMany({ userId });


            res.json({ success: true, email, message: "completed" });
        }
    } catch (error) {
        console.log(error);
    }
}

async function handleChangePassword(req, res) {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const userId = req.session.userId;

    try {

        const user = await User.findOne({ _id: userId });
        if (user) {
            const validPassword = await bycrypt.compare(oldPassword, user.password);

            if (validPassword) {
                const saltRounds = 10;
                const hashedPassword = await bycrypt.hash(newPassword, saltRounds);

                await User.updateOne({ _id: userId }, { password: hashedPassword });

                res.json({ staus: true, message: "password updated successfully" });
            } else {
                res.json({ staus: false, message: "wrong password entered!!!s" });
            }
        }

    } catch (error) {
        console.log(error);
    }

}


async function handleVerifyPayment(req, res) {
    const razorpay_payment_id = req.body.response.razorpay_payment_id;
    const razorpay_order_id = req.body.response.razorpay_order_id;
    const razorpay_signature = req.body.response.razorpay_signature;
    const orderId = req.body.order.receipt;
    const userId = req.session.userId;
    const updateWalletAmount = req.body.walletAmount;


    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', process.env.RZP_SECRET_KEY);

    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    hmac = hmac.digest('hex'); // converting to hexa code

    if (hmac == razorpay_signature) {
        const order = await Orders.findById({ _id: orderId });
        if (order.payment_method == 'WALLET') {
            source = order.invoiceNumber;
            const updatedWallet = await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $set: { 'wallet.amount': 0 }, // Increment wallet amount
                    $push: { 'wallet.transactions': { source: source, method: 'debit', description: 'Payment completd for the order', transaction_amount: updateWalletAmount } } // Push transaction details
                },
                { new: true }
            );

            const updateStatus = await Orders.findByIdAndUpdate({ _id: orderId },
                {
                    $set: { Status: "Placed", payment_status: "Completed", payment_method: "WALLET+ONLINE" }
                }
            )

            res.json({ success: true });
        } else {
            const updateStatus = await Orders.findByIdAndUpdate({ _id: orderId },
                {
                    $set: { Status: "Placed", payment_status: "Completed" }
                }
            )

            res.json({ success: true });
        }


    }
}

async function handleApplyCoupon(req, res) {
    const name = req.body.couponName;
    const currentDate = new Date();

    const coupons = await Coupon.find({ name: name, isDeleted: false });

    if (coupons.length > 0) {
        if (currentDate > coupons[0].expiresAt) {
            res.json({ success: false, message: 'Coupon has expired.' });
        } else if (coupons[0].usageCount >= coupons[0].maxUsage) {
            res.json({ success: false, message: 'Coupon has reached maximum usage.' });
        } else {

            await Coupon.findByIdAndUpdate(coupons[0]._id, { $inc: { usageCount: 1 } });

            res.json({
                success: true,
                couponName: coupons[0].name,
                couponAmount: coupons[0].amount,
            });
        }
    } else {
        res.json({ success: false, message: 'Coupon not found.' });
    }
}



async function handleWalletView(req, res) {
    const userId = req.session.userId;

        try {

            const user = await User.findById(userId);
            if (user) {
                const wallet = user.wallet;

                // Sort transactions in reverse chronological order
                wallet.transactions.sort((a, b) => b.date - a.date);


                // Render the wallet view with pagination information
                res.render('walletView', {
                    wallet,
                    imgUri, 
                    images, 
                    formatPrice,
                });
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }

}


async function handleDownloadInvoice(req, res) {
    const orderId = req.query.orderId;

    const order = await Orders.findById({ _id: orderId })

    res.render('Invoice', { order, imgUri, formatPrice, images })
}


module.exports = {
    handleCartView,
    handleAddToCart,
    handleUpdateCartQuantity,
    handleDeleteCartItem,
    handleCheckoutView,
    handleEditAddress,
    handleAddNewAddress,
    handlePlaceOrder,
    handleAddAddressView,
    handleEditAddressView,
    handleMyOrdersView,
    handleSelectedOrderView,
    handleCancelOrder,
    handleManageAccountView,
    handleChangeName,
    handleChangeNumber,
    handleChangeEmail,
    handleVerifyOtp,
    handleChangePassword,
    handleVerifyPayment,
    handleApplyCoupon,
    handleWalletView,
    handleAddToCartFromWishlist,
    handleAddToCartOneItemFromWishlist,
    handleAddToWishlist,
    handleWishlistView,
    handleDeleteFromWishlist,
    handleDownloadInvoice
}