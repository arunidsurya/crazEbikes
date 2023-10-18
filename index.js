const express = require('express');
const bodyParser= require('body-parser');
const path = require("path");
const nocache = require("nocache");
const cookieParser = require("cookie-parser");
const adminRouter= require('./routes/admin');
const staticRouter= require('./routes/staticRoutes')
const connectMongoDB= require('./mongodb/connectMongo');
const dotenv = require('dotenv');
dotenv.config();
const multer= require('multer');
const {fileStorage,fileFilter}=require('./utils/multer');
const {checkAdminAuth}= require("./middleware/auth")

const app = express();
const PORT = 5000;

connectMongoDB(process.env.MONGO_URL)
.then(()=>console.log('mongoDB is connected'));



app.set('view engine','ejs');
app.set("views",path.resolve("./views"));

app.use(nocache());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));
app.use(multer({dest:'images',storage: fileStorage , fileFilter:fileFilter}).array('image',10)); 

app.use("/admin",adminRouter);
app.use('/',checkAdminAuth,staticRouter);






app.listen(PORT,()=>{console.log(`server is running at port ${PORT}`)});