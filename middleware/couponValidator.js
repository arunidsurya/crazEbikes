
const { check, validationResult } = require('express-validator');


const couponValidator = [
    check('name', 'FIled cannot be empty.Alphabets of max 25 characters!!')
        .trim()
        .notEmpty()
        .isAlpha()
        .isLength({ max: 25 }),
    check('name', 'FIled cannot be empty.Alphabets of max 25 characters!!')
        .trim()
        .notEmpty()
        .isAlpha()
        .isLength({ max: 25 }),
    check('amount', 'field is required!!-ve values not allowed')
        .trim()
        .notEmpty()
        .isNumeric()
        .isInt({ min: 1})
        .isLength({ max: 6 })
        .custom((value, { req }) => {
            // Custom validation: Check if the price is not negative
            if (parseFloat(value) < 0) {
                throw new Error('Price cannot be negative.');
            }
            return true;
        }),
    check('maxUsage', 'field cannot be empty!!!-ve values not allowed')
        .trim()
        .notEmpty()
        .isNumeric()
        .isInt({ min: 1 })
        .isLength({ max: 6 })
        .custom((value, { req }) => {
            // Custom validation: Check if the price is not negative
            if (parseFloat(value) < 0) {
                throw new Error('Stock cannot be negative.');
            }
            return true;
        }),
    check('expiresAt', 'field cannot be empty!!!')
        .trim()
        .notEmpty(),
    check('description', 'field is required,Max 10000 characters allowed !!')
        .trim()
        .notEmpty()
        .isLength({ max: 10000 }),

]

module.exports = couponValidator;


