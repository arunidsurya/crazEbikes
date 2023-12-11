
const { check, validationResult } = require('express-validator');





const productValidator = [
    check('product_name', 'invalid prodcut name!! Alphabets of max 25 characters ')
        .trim()
        .notEmpty()
        .isLength({ max: 100 }),
    check('categoryId', 'Category can not be empty !!')
        .trim()
        .notEmpty(),
    check('brand', 'brand is required!!')
        .trim()
        .notEmpty()
        .isLength({ max: 50 }),
    check('color', 'field cannot be empty!!!')
        .trim()
        .notEmpty()
        .isLength({ max: 20 }),
    check('stock', 'field cannot be empty!!!')
        .trim()
        .notEmpty()
        .isNumeric()
        .isInt({ min: 0 })
        .isLength({ max: 6 })
        .custom((value, { req }) => {
            // Custom validation: Check if the price is not negative
            if (parseFloat(value) < 0) {
                throw new Error('Stock cannot be negative.');
            }
            return true;
        }),
    check('price', 'field is required!!')
        .trim()
        .notEmpty()
        .isNumeric()
        .isInt({ min: 0 })
        .isLength({ max: 6 })
        .custom((value, { req }) => {
            // Custom validation: Check if the price is not negative
            if (parseFloat(value) < 0) {
                throw new Error('Price cannot be negative.');
            }
            return true;
        }),
    check('description', 'field is required,Max 3000 words allowed !!')
        .trim()
        .notEmpty()
        .isLength({ max: 10000 }),
    // check('images')
    //     .custom((value, { req }) => {
    //         // Custom validation: Check if the file format is jpg or png
    //         if (!value || !value.every(file => /\.(jpg|jpeg|png)$/i.test(file.originalname))) {
    //             throw new Error('Invalid file format. Only JPG or PNG images are allowed.');
    //         }
    //         return true;
    //     }),
]

module.exports = productValidator;


