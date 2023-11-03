const express = require("express");
const Cart = require('../models/cart');
const mongoose = require('mongoose');
const User = require('../models/User');
const Orders  = require('../models/Order');
const nodemailer = require("nodemailer");
const{v4:uuidv4}= require('uuid');
const bycrypt = require("bcrypt");
const userOTPVerification = require("../models/userOTPVerification");
const transpoter = require("../utils/nodeMailer");



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



async function handleCartView(req, res) {
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

async function handleAddToCart(req, res) {
    const userId = req.session.userId;
    if(userId){
    try {
        const product_id = req.query.product_id;
        const quantity = req.body.quantity;

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
}else{
    res.render('userlogin', { images, imgUri })
}
};



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
                res.json({ success: true, cartTotal, totalQuantity, formatPrice });
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


async function handleDeleteCartItem(req, res) {
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

async function handleCheckoutView(req, res) {
    const userId = req.session.userId;
    if (userId) {
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



    } else {
        res.render('userlogin', { images, imgUri })
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

    if (userId) {
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
    } else {
        res.render('userlogin', { images, imgUri })
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
    const { selectedAddress, paymentMethod, userId, totalPrice } = req.body;
    if (userId) {
      try {
        const status = paymentMethod === 'COD' ? 'placed' : 'pending';
  
        const user = await User.findById(userId);
        const address = [];
        const selectedAddressObj = user.delivery.find((deliveryAddress) =>
          deliveryAddress._id.equals(selectedAddress) // Use the `equals` method to compare ObjectId
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
            const newOrder = new Orders({
              total_price: totalPrice,
              User_id: user._id,
              delivery_address: address,
              Items: orderItems,
              Status: status,
              payment_method:paymentMethod,
            });
  
            await newOrder.save();
            await Cart.deleteMany({ userId: user._id });

            res.redirect('/user/view-orders')
  
            // res.status(200).json({ message: 'Order placed successfully' });
          }
        } else {
          res.status(404).json({ error: 'Cart not found' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
        res.render('userlogin', { images, imgUri })
    }
  }
  

// async function handlePlaceOrder(req, res) {
//     const { selectedAddress, paymentMethod, userId, totalPrice } = (req.body);
//     if (userId) {
//         try {

//             const status = paymentMethod === 'COD' ? 'placed' : 'pending';

//         const user = await User.findById({ _id: userId });
//         const address=[];
//         const selectedAddressObj = user.delivery.find((deliveryAddress) =>
//         deliveryAddress._id.equals(selectedAddress) // Use the `equals` method to compare ObjectId
//       );
        
//       if (selectedAddressObj) {
//         const cleanedAddress = {
//           Address: selectedAddressObj.address,
//           City: selectedAddressObj.city,
//           ContactNumber: selectedAddressObj.contactNumber,
//           Name: selectedAddressObj.name,
//           Pincode: selectedAddressObj.pincode,
//           State: selectedAddressObj.state,
//         };
      
//         address.push(cleanedAddress);
//       }

//         const cart = await Cart.find({ userId: userId });

//         const items = [];

//         // Iterate through each cart and extract cartItems
//         for (const cartItem of cart) {
//             // Assuming cartItems is an array in the cart document
//             const cartItems = cartItem.cartItems;
//             // Add cartItems to the Items array
//             items.push(...cartItems);
//         }

//         if(status,address,items){
//             const newOrder = new Orders({
//                 total_price: totalPrice,
//                 User_id: user._id,
//                 delivery_address: address,
//                 Items: items,
//                 Status: status,
//             });

//             await newOrder.save();
//             await Cart.deleteMany({ userId: user._id });

//         }
            
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Internal server error' });
//         }     

//     } else {
//         res.render('userlogin', { images, imgUri })
//     }
// };



async function handleOrdersView(req, res) {
    const userId = req.session.userId;

    if(userId){
        try {
            // Find all orders for the given user ID
            const userOrders = await Orders.find({ User_id: userId ,isDeleted:false});
    
        
            // Create an array to accumulate orders' data
            const ordersData = userOrders.map(order => {
              return {
                total_price: order.total_price,
                Status: order.Status,
                OrderDate: `${order.Order_date.getFullYear()}-${order.Order_date.getMonth()+1}-${order.Order_date.getDate()}`,
                TimeStamp: `${order.TimeStamp.getFullYear()}-${order.TimeStamp.getMonth()+1}-${order.TimeStamp.getDate()}`,
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
                payment_method:order.payment_method,
              };
            });
    
    
            // Now, after processing all orders, render the view and send the accumulated data
            res.render('manageOrders', { imgUri, images, ordersData, formatPrice });
        
          } catch (error) {
            console.error(error);
            throw error; // Handle the error as needed
          }
    }else{
        res.render('userlogin', { images, imgUri })
    }
   
}



// async function handleOrdersView(req, res) {
//     const userId = req.session.userId;


//     try {
//         const ordersResult = await Orders.aggregate([
//             {
//                 $match: { User_id: new mongoose.Types.ObjectId(userId) }
//             },
//             {
//                 $unwind: '$Items'
//             },
//             {
//                 $lookup: {
//                     from: 'products',
//                     localField: 'Items.product_id',
//                     foreignField: '_id',
//                     as: 'product'
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$_id',
//                     total_price: { $first: '$total_price' },
//                     User_id: { $first: '$User_id' },
//                     isDeleted: { $first: '$isDeleted' },
//                     delivery_address: { $first: '$delivery_address' },
//                     IsCancelled: { $first: '$IsCancelled' },
//                     Status: { $first: '$Status' },
//                     Order_date: { $first: '$Order_date' },
//                     TimeStamp: { $first: '$TimeStamp' },
//                     Items: { $push: '$Items' },
//                     product: { $push: { $arrayElemAt: ['$product', 0] } }
//                 }
//             }
//         ]);

//         // Separate array for 'products'
//         const productsArray = ordersResult.map(order => order.product).flat(); // Use flat() to flatten the array

//         // Extract total_price and collection object _id
//        const totalPrice = ordersResult[0].total_price;
//         const collectionId = ordersResult[0]._id;

//         // Remove 'product' field from the 'ordersResult' objects
//         ordersResult.forEach(order => delete order.product);

//         // You now have totalPrices and collectionIds as separate arrays with the desired values

//         // console.log("Orders Result:", ordersResult);

//         res.render('manageOrders', { imgUri, images, ordersResult, productsArray,totalPrice,collectionId,formatPrice });
//     } catch (err) {
//         console.error('Error:', err);
//     }
// }

async function handleCancelOrder(req,res){
    const orderId=req.query.orderId;
    const userId= req.session.userId;

    if(userId){
        try {
            const order= await Orders.findByIdAndUpdate({_id:orderId},
                {
                    $set:{IsCancelled:true, Status:'Cancelled'}
                }
                );
            res.redirect('/user/view-orders');
        } catch (error) {
            console.log(error)
        }

    }else{
        res.render('userlogin', { images, imgUri })
    }

};

async function handleManageAccountView(req,res){
    const userId= req.session.userId;

    if(userId){
        try {
            
         const user= await User.findById({_id:userId});

         res.render('manageAccount',{user,images,imgUri});

        } catch (error) {
            console.log(error)
        }
    }else{
        res.render('userlogin', { images, imgUri })
    }

}

async function handleChangeName(req,res){
    const userId= req.session.userId;
    const name= req.body.name;


    if(userId){
        try {
            
         const user= await User.findOneAndUpdate({_id:userId},{
            $set:{
                name:name
            }
         });

         res.json({success:true});

        } catch (error) {
            console.log(error)
        }
    }else{
        res.render('userlogin', { images, imgUri })
    }

}

async function handleChangeNumber(req,res){
    const userId= req.session.userId;
    const contactNumber= req.body.contactNumber;


    if(userId){
        try {
            
         const user= await User.findOneAndUpdate({_id:userId},{
            $set:{
                contactNumber:contactNumber
            }
         });

         if(user){
            res.json({success:true});
         }else{
            console.log("no user found")
         }

        } catch (error) {
            console.log(error)
        }
    }else{
        res.render('userlogin', { images, imgUri })
    }

}


async function handleChangeEmail(req,res){
    const email = req.body.email;
    const id= req.session.userId;


    try {
        const otp= `${Math.floor(1000 + Math.random() * 9000)}`;

        //mail options
        const mailOptions ={
            from: process.env.AUTH_EMAIL,
            to:email,
            subject: "Verify Your Email",
            html:`<p> Enter <b>${otp}</b> in the app to verify your email address.</p>
            <p>This code will <b> Expires in one hour</b></P> `
        };
    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bycrypt.hash(otp,saltRounds);
      const newOTPVerification = await new userOTPVerification({
            userId:id,
            otp: hashedOTP,
            createdAt:Date.now(),
            expiresAt:Date.now() + 3600000,
        });
        // save otp record
        await newOTPVerification.save();
        transpoter.sendMail(mailOptions,(error,res)=>{
            if(error){
                console.log(error);
            }
    
        });
        res.json({success:true,email})
  
    } catch (error) {
        res.json({
            status:"FAILED",
            message:error.message,
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
           

            res.json({ success: true, email, message:"completed" });
        }
    } catch (error) {
        console.log(error);
    }
}

async function handleChangePassword(req,res){
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const userId = req.session.userId;

    try {

        const user = await User.findOne({_id:userId});
        if(user){
            const validPassword = await bycrypt.compare(oldPassword,user.password);
            
            if (validPassword) {
                const saltRounds = 10;
              const hashedPassword= await bycrypt.hash(newPassword, saltRounds);
    
              await User.updateOne({ _id: userId }, { password: hashedPassword });

                res.json({staus:true,message:"password updated successfully"});
        }else{
            res.json({staus:false,message:"wrong password entered!!!s"});
        }
    }
        
    } catch (error) {
        console.log(error);
    }

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
    handleOrdersView,
    handleCancelOrder,
    handleManageAccountView,
    handleChangeName,
    handleChangeNumber,
    handleChangeEmail,
    handleVerifyOtp,
    handleChangePassword,
}