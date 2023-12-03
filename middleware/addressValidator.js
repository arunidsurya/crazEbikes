
const {check,validationResult} = require('express-validator');



const addressValidator =[
    check('name', 'please enter a valid Name!!')
        .trim()
        .notEmpty()
        .isLength({ max: 150 }),
    check('contactNumber', 'please enter a valid Number!!')
        .trim()
        .notEmpty()
        .isInt()
        .isLength({min:10}),
    check('address', 'Field is mandatory!!') 
        .trim()
        .notEmpty(),
    check('pincode', 'please enter a valid Pincode!!')
        .trim()
        .notEmpty()
        .isInt(),
    check('city', 'Field is mandatory!!')
        .trim()
        .notEmpty(),
    check('state', 'Field is mandatory!!')
        .trim()
        .notEmpty(),

    ]

    

module.exports=addressValidator;