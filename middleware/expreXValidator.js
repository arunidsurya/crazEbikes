
const {check,validationResult} = require('express-validator');



const loginValidator =[
    check('email','Invalid Email')
    .trim()
    .notEmpty()
    .isEmail(),
    check('password','The password length should have minmium 8')
    .trim()
    .notEmpty()
    .isLength({min:8,max:16}),
]



module.exports=loginValidator;