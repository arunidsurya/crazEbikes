const express = require('express');
const session = require("express-session");
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const path = require("path");
const nocache = require("nocache");
const multer = require('multer');
const cookieParser = require("cookie-parser");
const { check, validationResult } = require('express-validator');
const MonthlyTotals = require('./models/monthlyTotal');
const imgUri = process.env.IMGURI;
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




const connectMongoDB = require('./mongodb/connectMongo');
const { fileStorage, fileFilter } = require('./utils/multer');


const adminRouter = require('./routes/admin');
const userAuthRouter = require('./routes/userAuth');
const userRouter = require('./routes/userRoutes')
const staticRouter = require('./routes/staticRoutes');
const adminAuthRouter = require("./routes/adminAuth")
const { checkAdminAuth, checkUserAuth } = require("./middleware/auth");
const Orders = require('./models/Order');
const Product = require('./models/product');



const app = express();
const PORT = 5000;

connectMongoDB(process.env.MONGO_URL)
  .then(() => console.log('mongoDB is connected'));


app.set('view engine', 'ejs');
app.set("views", path.resolve("./views"));


app.use(session({
  secret: process.env.SECRET_KEY, // Change this to a strong, random secret key
  resave: false,
  saveUninitialized: true,
}));
app.use(nocache());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ dest: 'images', storage: fileStorage, fileFilter: fileFilter }).array('image', 10));


//Routes

app.use("/admin-auth", adminAuthRouter);
app.use("/admin", checkAdminAuth, adminRouter);
app.use('/', checkAdminAuth, checkUserAuth, staticRouter);
app.use("/user-auth", userAuthRouter);
app.use('/user', userRouter);

app.get('/monthly', async (req, res) => {
  const monthlyTotals = await Orders.aggregate([
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

  const orders = await Orders.find({});
  const totalOrderPrice = orders.reduce((sum, order) => sum + order.total_price, 0);

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
  const mostOrderedProductId = sortedProductCount[0][0];
  const secondMostOrderedProductId = sortedProductCount[1][0];
  const thirdMostOrderedProductId = sortedProductCount[2][0];

  console.log('Most Ordered Product ID:', mostOrderedProductId);
  console.log('Second Most Ordered Product ID:', secondMostOrderedProductId);
  console.log('Third Most Ordered Product ID:', thirdMostOrderedProductId);

  // Retrieve details of the most ordered products from the Products collection
  const products = await Product.find({
    _id: { $in: [mostOrderedProductId, secondMostOrderedProductId, thirdMostOrderedProductId] }
  });



  console.log(monthlyTotals)
  // Send the monthly totals back to the UI
  res.render('dashBorad', { monthlyTotals, totalOrderPrice,products });


})

app.get('/total', async (req, res) => {

  const orders = await Orders.find({});
  const totalOrderPrice = orders.reduce((sum, order) => sum + order.total_price, 0);

  console.log(totalOrderPrice);

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
  const mostOrderedProductId = sortedProductCount[0][0];
  const secondMostOrderedProductId = sortedProductCount[1][0];
  const thirdMostOrderedProductId = sortedProductCount[2][0];

  console.log('Most Ordered Product ID:', mostOrderedProductId);
  console.log('Second Most Ordered Product ID:', secondMostOrderedProductId);
  console.log('Third Most Ordered Product ID:', thirdMostOrderedProductId);

  // Retrieve details of the most ordered products from the Products collection
  const products = await Product.find({
    _id: { $in: [mostOrderedProductId, secondMostOrderedProductId, thirdMostOrderedProductId] }
  });

  console.log('Most Ordered Products:', products);

});




app.listen(PORT, () => { console.log(`server is running at port ${PORT}`) });