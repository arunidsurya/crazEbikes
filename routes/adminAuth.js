const express = require('express');
const {handleAdminLogin,handleAdminSignup,handleAdminLogout} = require('../controllers/adminAuth');
const loginValidator = require('../middleware/expreXValidator');


const router = express.Router();

router.post("/",loginValidator,handleAdminLogin);
router.post("/signup",handleAdminSignup);
router.get("/logout",handleAdminLogout);


module.exports=router;

