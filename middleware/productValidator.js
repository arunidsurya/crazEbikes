
const {check,validationResult} = require('express-validator');





 const productValidator=[
    check('product_name','invalid prodcut name!!')
    .trim()
    .notEmpty()
    .isLength({max:100}),
    check('brand')
    .trim()
    .notEmpty()
    .isAlphanumeric()
    .isLength({max:100}),
    check('brand','brand is required!!')
    .trim()
    .notEmpty()
    .isLength({max:50}),
    check('color','')
    .trim()
    .notEmpty()
    .isLength({max:20}),
    check('price','field is required!!')
    .trim()
    .notEmpty()
    .isNumeric()
    .isLength({max:6}),
    check('description','field is required,Max 3000 words allowed !!')
    .trim()
    .notEmpty()
    .isLength({max:10000}),
]

module.exports=productValidator;

    
