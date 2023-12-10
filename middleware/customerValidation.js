
const {check,validationResult} = require('express-validator');



const customerValidator =[
    check('name','Invalid Name!!')
    .trim()
    .notEmpty()
    .isAlpha(),
    check('email','Invalid Email!!')
    .trim()
    .notEmpty()
    .isEmail(),
    check('password','The password length should have minmium 8')
    .trim()
    .notEmpty()
    .isLength({min:8,max:16}),
    check('contactNumber','Invalid Contact Number')
    .trim()
    .notEmpty()
    .isLength({min:10,max:12}),
]



module.exports=customerValidator;