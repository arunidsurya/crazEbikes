const express = require('express');
const Cart = require('../models/cart');
const mongoose = require('mongoose');



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



async function handleCartView(req, res){
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
        return res.render('cart', { imgUri, images, message: "0 items in the cart" });
    }

    // if (!userId && userId == undefined) {
//     res.render('userlogin', { imgUri, images })
// } else {

//     const cartdata = await Cart.findOne({ userId: userId }).populate({
//         path: 'cartItems.product_id',
//         model: 'product'
//     });


//     // console.log(cartdata);
//     let cartTotal = 0;
//     let totalQunatity = 0;

//     for (let i = 0; i < cartdata.cartItems.length; i++) {
//         const item = cartdata.cartItems[i];
//         const itemPrice = item.product_id.price;
//         const itemQuantity = item.quantity;
//         totalQunatity += item.quantity;
//         cartTotal += itemPrice * itemQuantity;
//     }
//     res.render('cart', { cartdata, cartTotal, totalQunatity, imgUri, images, formatPrice });
// }

};

async function handleAddToCart(req, res){

    try {
        const product_id = req.query.product_id;
        const quantity = req.body.quantity;
        const userId = req.session.userId;
        
        // Check if the user's cart exists; if not, create a new one
        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            cart = new Cart({ userId: userId, cartItems: [] });
        }

        // Check if the product already exists in the cart
        const existingCartItemIndex = cart.cartItems.findIndex(item => item.product_id.toString() === product_id);

        if (existingCartItemIndex !== -1) {
            // If the product is already in the cart, update the quantity
            cart.cartItems[existingCartItemIndex].quantity = quantity;
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
                return res.status(404).json("No records found");
            }

            const { cartdata, cartTotal, totalQuantity } = cartDataResult[0];
            // console.log(cartdata)

            res.render('cart', { cartdata, cartTotal, userId, totalQuantity, imgUri, images, formatPrice });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('An error occurred while fetching the cart data.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while adding the item to the cart' });
    }
};



async function handleUpdateCartQuantity(req, res){

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
            return res.json({ success: false, message: 'Cart not found.' });
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
                res.json({ success: true, cartTotal, totalQuantity });
            } catch (err) {
                console.error('Error:', err);
                return res.render('cart', { imgUri, images, message: "0 items in the cart" });
            }

            // const cartdata = await Cart.findOne({ userId: userId }).populate({
            //     path: 'cartItems.product_id',
            //     model: 'product'
            // });


            // let cartTotal = 0;
            // let totalQunatity = 0;

            // for (let i = 0; i < cartdata.cartItems.length; i++) {
            //     const item = cartdata.cartItems[i];
            //     const itemPrice = item.product_id.price;
            //     const itemQuantity = item.quantity;
            //     totalQunatity += item.quantity;
            //     cartTotal += itemPrice * itemQuantity;
            // }

            // res.json({ success: true, cartTotal, totalQunatity });

            // // res.json({ success: true });
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the cart.' });
    }
};


async function handleDeleteCartItem(req, res){
    const userId = req.query.userid;
    const product_id = req.query.productid;

    try {
        const cart = await Cart.updateOne(
            { userId: userId },
            {
                $pull: { cartItems: { product_id: product_id } }
            }
        );

        if (cart) {
            res.redirect('cart-view');
        }
    } catch (error) {
        console.log(error);
    }
};





module.exports={
    handleCartView,
    handleAddToCart,
    handleUpdateCartQuantity,
    handleDeleteCartItem,
}