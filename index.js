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
const errorHandler=require("./middleware/errorHandler");
const Swal = require('sweetalert2');
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
const User = require('./models/User');



const app = express();
const PORT =process.env.PORT;

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
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ dest: 'images', storage: fileStorage, fileFilter: fileFilter }).array('image', 10));



//Routes

app.use("/admin-auth", adminAuthRouter);
app.use("/admin", checkAdminAuth, adminRouter);
app.use('/', checkAdminAuth, staticRouter);
app.use("/user-auth", userAuthRouter);
app.use('/user',checkUserAuth, userRouter ,errorHandler);



app.all('*',(req,res,next)=>{
  const err = new Error(`cant find ${req.originalUrl} on the server` );
  err.status='fail';
  err.statusCode=404;
  next(err);
})








app.listen(PORT, () => { console.log(`server is running at port ${PORT}`) });