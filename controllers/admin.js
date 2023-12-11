const Category = require('../models/category');
const User = require('../models/User');
const Product = require('../models/product');
const Admin = require('../models/admin');
const { setAdmin } = require('../service/auth');
const mongoose = require('mongoose');
const bycrypt = require("bcrypt");
const productValidator = require('../middleware/productValidator');
const { check, validationResult } = require('express-validator');
const Orders = require('../models/Order');
const Coupon = require('../models/coupon');
const { isNumber } = require('razorpay/dist/utils/razorpay-utils');

const PRODUCTS_PER_PAGE = 5;

function formatPrice(price) {
    return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
const imgUri = process.env.IMGURI;


async function handleHomePageView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    res.redirect('/admin/dash-board');
}


async function handleCategoryView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    try {

        const categories = await Category.find({ isDeleted: false })


        res.render('admin/categories', { categories });
    } catch (error) {
        console.log(error);
    }
}



async function handleCategorySearch(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const searchKey = req.body.searchKey;
    const query = {
        category_name: { $regex: searchKey, $options: 'i' },
        isDeleted: false,
    };
    const projection = {}; // Optional fields to include/exclude
    const options = {}; // Additional options (e.g., limit, sort)

    try {
        const page = req.query.page || 1;
        const startIndex = (page - 1) * PRODUCTS_PER_PAGE;

        const categories = await Category.find(query, projection, options)
            .skip(startIndex)
            .limit(PRODUCTS_PER_PAGE);

        const totalProducts = await Category.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

        res.render('admin/categories', { categories, currentPage: page, totalPages, PRODUCTS_PER_PAGE });
    } catch (error) {
        console.log(error);
    }
}



async function handleAddCategoryPageView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    res.render('admin/addCategories');
}

async function handleCategoryAdd(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/addCategories', {
            errors: errors.mapped(),
        });
    }


    try {
        const { category_name, description } = req.body;
        await Category.create({
            category_name,
            description
        });
        return res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        return res.render("admin/addCategories", { message: "Failed!!Category already exists" });
    }
}
async function handleEditCategoryPageView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    // if(!req.admin) return res.redirect('/adminlogin');
    let id = req.params.id;
    const category = await Category.findOne({ _id: id });
    // if(!user && user==null) res.render("/categories");
    res.render("admin/editCategories", { category: category });

}

async function handleCategoryEdit(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const category = await Category.findOne({ _id: id });
        return res.render('admin/editCategories', {
            errors: errors.mapped(), category 
        });
    }

    try {
        await Category.findByIdAndUpdate(id, {
            category_name: req.body.category_name,
            description: req.body.description,
        });
        return res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        return res.redirect("/adminCategories");
    }
}

async function handleCategoryDelete(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        return res.rednder("admin/categories");
    }

}


async function handleUserView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    try {

        const users = await User.find({ isDeleted: false })

        res.render('admin/customers', { users });
    } catch (error) {
        console.log(error);
    }
}


async function handleUserSearch(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const searchKey = req.body.searchKey;
    const query = {
        name: { $regex: searchKey, $options: 'i' },
        isDeleted: false,
    }
    const projection = {};
    const options = {};
    try {
        const page = req.query.page || 1;
        const startIndex = (page - 1) * PRODUCTS_PER_PAGE;

        const users = await User.find(query, projection, options)
            .skip(startIndex)
            .limit(PRODUCTS_PER_PAGE);


        const totalProducts = await User.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

        res.render('admin/customers', { users, currentPage: page, totalPages, PRODUCTS_PER_PAGE });
    } catch (error) {
        console.log(error);
    }
}



async function handleAddUserPageView(req, res) {
    res.render('admin/addCustomers');
}

async function handleUserAdd(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('admin/addCustomers', {
            errors: errors.mapped(),
        });
    }

    try {
        const { name, email, password, contactNumber } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bycrypt.hash(password, saltRounds);
        await User.create({
            name,
            email,
            password: hashedPassword,
            contactNumber
        });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.render("admin/addCustomers", { message: "Failed!!User already exists!!" });
    }
};
async function handleEditCustomerPageView(req, res) {
    let id = req.params.id;
    const customer = await User.findOne({ _id: id });
    res.render("admin/editCustomers", { customer: customer });

}

async function handleCustomerEdit(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const customer = await User.findOne({ _id: id });
        return res.render('admin/editCustomers', {
            errors: errors.mapped(), customer
        });
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
        });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }
};

async function handleCustomerDelete(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }

};
async function handleCustomerBlock(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }

};
async function handleCustomerUnblock(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, { isBlocked: false });
        return res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/user");
    }

};

async function handleProductsView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');

    try {


        const products = await Product.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .populate({
                path: 'categoryId',
                select: 'category_name',
            })
            ;


        res.render('admin/products', { products, formatPrice, imgUri });
    } catch (error) {
        console.log(error);
    }
};



async function handleAddProductPageView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const categories = await Category.find({isDeleted:false}, { category_name: 1, _id: 1 });
    res.render('admin/addProducts', { categories: categories });
}

async function handleProductAdd(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const categories = await Category.find({}, { category_name: 1, _id: 1 });
        return res.render('admin/addProducts', {
            errors: errors.mapped(),
            categories: categories,
        });
    }
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    try {
        const { product_name, categoryId, brand, color, price, stock, description } = req.body;
        const files = req.files;
        let imagePaths = [];
        if (files) {
            files.map(file => {
                imagePaths.push(file.path)
            })
        }
        await Product.create({
            product_name,
            categoryId,
            brand,
            color,
            imageUrl: imagePaths,
            price,
            stock,
            description,
        });
        return res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        return res.render("admin/addSuccess", { message: "Failed!!" });
    }
};


// async function handleProductAdd(req, res) {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         const categories = await Category.find({}, { category_name: 1, _id: 1 });
//         return res.render('admin/addProducts', {
//             errors: errors.mapped(),
//             categories: categories,
//         });
//     }
//     if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
//     try {
//         const { product_name, categoryId, brand, color, price, stock, description } = req.body;
//         const files = req.files;
//         let imagePaths = [];
       
//         if (files) {
//             // Process each file
//             for (const file of files) {
//                 const imagePath = file.path;

//                 // Perform image cropping using sharp
//                 const croppedImagePath = `path/to/cropped/${file.filename}`;

//                 await sharp(imagePath)
//                     .resize({ width: 300, height: 300, fit: 'cover' })
//                     .toFile(croppedImagePath);

//                 imagePaths.push(croppedImagePath);
//             }
//         }

//         await Product.create({
//             product_name,
//             categoryId,
//             brand,
//             color,
//             imageUrl: imagePaths,
//             price,
//             stock,
//             description,
//         });
//         return res.redirect("/admin/products");
//     } catch (error) {
//         console.log(error);
//         return res.render("admin/addSuccess", { message: "Failed!!" });
//     }
// };




async function handleProductUpdatePageView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;


    const product = await Product.findOne({ _id: id });

    const categories = await Category.find({}, { category_name: 1, _id: 1 });
    res.render("admin/editProducts", { product: product, categories: categories });

}

async function handleProductUpdate(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;
    const files = req.files;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const categories = await Category.find({}, { category_name: 1, _id: 1 });
        return res.render('admin/addProducts', {
            errors: errors.mapped(),
            categories: categories,
        });
    }

    const product = await Product.findById(id);
    let newImagePaths = [];
    if (files) {
        files.map(file => {
            newImagePaths.push(file.path)
        })
    };

    const combImagePath = [...product.imageUrl, ...newImagePaths];

    try {
        await Product.findByIdAndUpdate(id, {
            product_name: req.body.product_name,
            categoryId: req.body.categoryId,
            brand: req.body.brand,
            color: req.body.color,
            imageUrl: combImagePath,
            price: req.body.price,
            stock: req.body.stock,
            description: req.body.description,
        });
        return res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/products");
    }
};
async function handleProdcutDelete(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let id = req.params.id;
    try {
        await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        return res.redirect("/admin/products");
    }

};
async function handleImageDelete(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    let index = req.query.index;
    let id = req.query.productid;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).send("Product not found.");
        }

        // Get the imageUrl at the specified index
        const imageUrlToDelete = product.imageUrl[index];

        // Update the product to remove the imageUrl
        await Product.updateOne(
            { _id: id },
            { $pull: { imageUrl: imageUrlToDelete } }
        );

        return res.redirect("/admin/products");

    } catch (error) {
        console.log(error);
        return res.redirect("/admin/products");
    }

};

async function handleOrdersView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');

    try {


        const orders = await Orders.find({}).sort({ Order_date: -1 })


        const totalProducts = await Orders.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

        res.render('admin/orders', { orders, formatPrice })

    } catch (error) {
        console.log(error);
    }

}



async function handleOrderDetailedView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const orderId = req.query.orderId;


    if (orderId) {
        try {
            // Find all orders for the given user ID
            const userOrders = await Orders.find({ _id: orderId });


            // Create an array to accumulate orders' data
            const ordersData = userOrders.map(order => {
                return {
                    total_price: order.total_price,
                    Status: order.Status,
                    OrderDate: `${order.Order_date.getFullYear()}-${order.Order_date.getMonth() + 1}-${order.Order_date.getDate()}`,
                    TimeStamp: `${order.TimeStamp.getFullYear()}-${order.TimeStamp.getMonth() + 1}-${order.TimeStamp.getDate()}`,
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
                    isDeleted: order.isDeleted,
                    collectionId: order._id,
                    payment_method: order.payment_method,
                    payment_status: order.payment_status,
                    coupon_amount: order.coupon_discount || 0,
                    coupon_name: order.coupon_code || null,
                };
            });


            // Now, after processing all orders, render the view and send the accumulated data
            res.render('admin/adminOrderDetview', { ordersData, imgUri, formatPrice });

        } catch (error) {
            console.error(error);
            throw error; // Handle the error as needed
        }
    }

}


async function handleChangeOrderStatus(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const status = req.body.selectedOption;
    const orderId = req.body.orderId;

    if (orderId) {
        try {
            if (status == 'Cancelled') {
                const order = await Orders.findByIdAndUpdate({ _id: orderId },
                    {
                        $set: { IsCancelled: true, Status: status }
                    }
                );
                res.redirect('/admin/orders-view');
            } else if (status == 'Deleted') {
                const order = await Orders.findByIdAndUpdate({ _id: orderId },
                    {
                        $set: { isDeleted: true, Status: status }
                    }
                );
                res.redirect('/admin/orders-view');
            } else {
                const order = await Orders.findByIdAndUpdate({ _id: orderId },
                    {
                        $set: { isDeleted: false, IsCancelled: false, Status: status }
                    }
                );
                res.redirect('/admin/orders-view');

            }

        } catch (error) {
            console.log(error)
        }

    }
}



async function handleChangePaymentStatus(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const status = req.body.selectedPaymentOption;
    const orderId = req.body.orderId;

    if (orderId) {
        try {
            const order = await Orders.findByIdAndUpdate(
                { _id: orderId },
                { $set: { payment_status: status } }
            );

            if (order.payment_status === "Completed") {
                const user = await User.findById({ _id: order.User_id });

                if (user) {
                    const totalAmount = order.total_price;
                    const source = order.invoiceNumber;
                    // Update the user's wallet
                    const updatedWallet = await User.findByIdAndUpdate(
                        { _id: order.User_id },
                        {
                            $inc: { 'wallet.amount': totalAmount }, // Increment wallet amount
                            $push: { 'wallet.transactions': { source: source, method: 'credit', description: 'order cancelled by user', transaction_amount: totalAmount } } // Push transaction details
                        },
                        { new: true }
                    );
                }
            }

            res.redirect('/admin/orders-view');

        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}

async function handleAddCouponView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    res.render('admin/addCoupon');
}

async function handleAddCoupon(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
   

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('admin/addCoupon', {
            errors: errors.mapped(),
        });
    }

    const { name, amount, maxUsage, expiresAt, description } = req.body;
    const selectedDate = new Date(expiresAt);
    const utcDate = new Date(selectedDate.toISOString());
    utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset()); // to make time zone offset to zero to avoid wrong date saving

    try {
        const coupon = Coupon.create({
            name,
            amount,
            maxUsage,
            expiresAt: utcDate,
            description,
        });

        res.redirect('/admin/coupons-view')
    } catch (error) {
        console.log(error);
    }

}

async function handleCouponsView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');

    try {
        const coupons = await Coupon.find({ isDeleted: false });
        res.render('admin/couponsViews', { coupons });
    } catch (error) {

    }
}

async function handleEditCouponPageView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const couponId = req.query.id;

    try {

        const coupon = await Coupon.findById({ _id: couponId });
        res.render('admin/editCoupons', { coupon:coupon });

    } catch (error) {
        console.log(error);
    }
}

async function handleEditCoupon(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');
    const couponId = req.query.couponId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const coupon = await Coupon.findById({ _id: couponId });
        return res.render('admin/editCoupons', {
            errors: errors.mapped(),coupon
        });
    }

    try {

        const coupon = await Coupon.findByIdAndUpdate({ _id: couponId },
            {
                name: req.body.name,
                amount: req.body.amount,
                maxUsage: req.body.maxUsage,
                expiresAt: req.body.expiresAt,
                description: req.body.description,
            }

        )

        res.redirect('/admin/coupons-view');

    } catch (error) {
        console.log(error)
    }
}


async function handleDeleteCoupon(req, res) {
    const coupenId = req.params.id;

    try {

        await Coupon.findByIdAndUpdate({ _id: coupenId }, { isDeleted: true });
        res.redirect('/admin/coupons-view');
    } catch (error) {

    }
}


async function handleDashBoardView(req, res) {
    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');

    const timeRange = req.query.timeRange || 'monthly';
    let totalsData;

    if (timeRange == 'monthly') {
        try {

            totalsData = await Orders.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$Order_date" }, // Group by year
                            month: { $month: "$Order_date" }, // Group by month
                        },
                        totalOrderPrice: { $sum: "$total_price" }, // Sum total_price for each group
                    },
                },
                {
                    $project: {
                        year: "$_id.year",
                        month: "$_id.month",
                        totalOrderPrice: 1,
                        _id: 0,
                    },
                },
            ]);



        } catch (error) {
            console.log(error);
        }
    } else if (timeRange == 'weekly') {
        try {

            totalsData = await Orders.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$Order_date" },
                            week: { $week: "$Order_date" },
                        },
                        totalOrderPrice: { $sum: "$total_price" },
                    },
                },
                {
                    $project: {
                        year: "$_id.year",
                        week: "$_id.week",
                        totalOrderPrice: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: {
                        year: 1,
                        week: 1
                    }
                }
            ]);



        } catch (error) {
            console.log(error);
        }


    } else if (timeRange == 'yearly') {
        try {

            totalsData = await Orders.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: { $toDate: "$Order_date" } },
                        },
                        totalOrderPrice: { $sum: "$total_price" },
                    },
                },
                {
                    $project: {
                        year: "$_id.year",
                        totalOrderPrice: 1,
                        _id: 0,
                    },
                },
            ]);



        } catch (error) {
            console.log(error);
        }

    }

    const orders = await Orders.find({});
    const totalOrderPrice = orders.reduce((sum, order) => sum + order.total_price, 0);
    const averageOrderValue = totalOrderPrice / (orders.length);
    const totalOrders = orders.length;

    // Flatten the Items arrays from all orders into a single array of products
    const allProducts = orders.reduce((products, order) => {
        return products.concat(order.Items.map(item => item.product_id.toString()));
    }, []);

    // Count the occurrences of each product ID
    const productCount = allProducts.reduce((count, productId) => {
        count[productId] = (count[productId] || 0) + 1;
        return count;
    }, {});

    // Sort productCount object by count in descending order
    const sortedProductCount = Object.entries(productCount).sort((a, b) => b[1] - a[1]);

    // Extract the product IDs of the most ordered, second most ordered, and third most ordered products
    const mostOrderedProductId = sortedProductCount[0] ? sortedProductCount[0][0] : null;
    const secondMostOrderedProductId = sortedProductCount[1] ? sortedProductCount[1][0] : null;
    const thirdMostOrderedProductId = sortedProductCount[2] ? sortedProductCount[2][0] : null;

    const productIdsToFind = [mostOrderedProductId, secondMostOrderedProductId, thirdMostOrderedProductId].filter(Boolean);

    // Retrieve details of the most ordered products from the Products collection
    const products = await Product.find({
        _id: { $in: productIdsToFind }
    });

    const outOfStockProducts = await Product.find({ stock: { $lt: 100 } }) || null;

    console.log(outOfStockProducts);

    // Send the monthly totals back to the UI
    res.render('admin/dashBorad', { totalsData, totalOrderPrice, products, timeRange, averageOrderValue, totalOrders, outOfStockProducts, formatPrice, imgUri });
}

async function handleSalesReportView(req, res) {

    if (!req.admin && req.admin == null) return res.redirect('/adminLogin');

    const timeRange = req.query.timeRange || 'monthly';
    let totalsData;

    if (timeRange == 'monthly') {
        try {

            totalsData = await Orders.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$Order_date" }, // Group by year
                            month: { $month: "$Order_date" }, // Group by month
                        },
                        totalOrderPrice: { $sum: "$total_price" }, // Sum total_price for each group
                    },
                },
                {
                    $project: {
                        year: "$_id.year",
                        month: "$_id.month",
                        totalOrderPrice: 1,
                        _id: 0,
                    },
                },
            ]);



        } catch (error) {
            console.log(error);
        }
    } else if (timeRange == 'weekly') {
        try {

            totalsData = await Orders.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$Order_date" },
                            week: { $isoWeek: "$Order_date" },
                        },
                        totalOrderPrice: { $sum: "$total_price" },
                    },
                },
                {
                    $project: {
                        year: "$_id.year",
                        week: "$_id.week",
                        totalOrderPrice: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: {
                        year: 1,
                        week: 1
                    }
                }
            ]);



        } catch (error) {
            console.log(error);
        }


    } else if (timeRange == 'yearly') {
        try {

            totalsData = await Orders.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: { $toDate: "$Order_date" } },
                        },
                        totalOrderPrice: { $sum: "$total_price" },
                    },
                },
                {
                    $project: {
                        year: "$_id.year",
                        totalOrderPrice: 1,
                        _id: 0,
                    },
                },
            ]);



        } catch (error) {
            console.log(error);
        }

    }

    const orders = await Orders.find({});
    const totalOrderPrice = orders.reduce((sum, order) => sum + order.total_price, 0);
    const averageOrderValue = totalOrderPrice / (orders.length);
    const totalOrders = orders.length;

    // Flatten the Items arrays from all orders into a single array of products
    const allProducts = orders.reduce((products, order) => {
        return products.concat(order.Items.map(item => item.product_id.toString()));
    }, []);

    // Count the occurrences of each product ID
    const productCount = allProducts.reduce((count, productId) => {
        count[productId] = (count[productId] || 0) + 1;
        return count;
    }, {});

    // Sort productCount object by count in descending order
    const sortedProductCount = Object.entries(productCount).sort((a, b) => b[1] - a[1]);

    // Extract the product IDs of the most ordered, second most ordered, and third most ordered products
    const mostOrderedProductId = sortedProductCount[0] ? sortedProductCount[0][0] : null;
    const secondMostOrderedProductId = sortedProductCount[1] ? sortedProductCount[1][0] : null;
    const thirdMostOrderedProductId = sortedProductCount[2] ? sortedProductCount[2][0] : null;
    const forthMostOrderedProductId = sortedProductCount[3] ? sortedProductCount[3][0] : null;
    const fifthMostOrderedProductId = sortedProductCount[4] ? sortedProductCount[4][0] : null;


    const productIdsToFind = [mostOrderedProductId, secondMostOrderedProductId, thirdMostOrderedProductId, forthMostOrderedProductId, fifthMostOrderedProductId].filter(Boolean);

    // Retrieve details of the most ordered products from the Products collection
    const products = await Product.find({
        _id: { $in: productIdsToFind }
    });

    const top5Users = await Orders.aggregate([
        {
            $group: {
                _id: '$User_id',
                count: { $sum: 1 },
            },
        },
        {
            $sort: { count: -1 },
        },
        {
            $limit: 5,
        },
    ]);

    // Extract User_id values from the aggregation result
    const top5UserIds = top5Users.map(user => user._id);

    // Find user details for the top 5 User_ids
    const userDetails = await User.find({ _id: { $in: top5UserIds } });




    // Send the monthly totals back to the UI
    res.render('admin/salesReport', { totalsData, averageOrderValue, totalOrders, totalOrderPrice, orders, userDetails, products, timeRange, formatPrice,imgUri });



}







module.exports = {
    handleHomePageView,
    handleCategoryView,
    handleCategorySearch,
    handleAddCategoryPageView,
    handleCategoryAdd,
    handleEditCategoryPageView,
    handleCategoryEdit,
    handleCategoryDelete,
    handleAddUserPageView,
    handleUserAdd,
    handleUserView,
    handleUserSearch,
    handleEditCustomerPageView,
    handleCustomerEdit,
    handleCustomerDelete,
    handleProductsView,
    handleAddProductPageView,
    handleProductAdd,
    handleProductUpdatePageView,
    handleProductUpdate,
    handleProdcutDelete,
    handleCustomerBlock,
    handleCustomerUnblock,
    handleImageDelete,
    handleOrdersView,
    handleOrderDetailedView,
    handleChangeOrderStatus,
    handleChangePaymentStatus,
    handleAddCoupon,
    handleAddCouponView,
    handleCouponsView,
    handleEditCouponPageView,
    handleEditCoupon,
    handleDeleteCoupon,
    handleDashBoardView,
    handleSalesReportView,


};

