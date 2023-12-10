
const { check, validationResult } = require('express-validator');


const categoryValidator = [
    check('category_name', 'FIled cannot be empty.Alphabets of max 25 characters!!')
        .trim()
        .notEmpty()
        .isAlpha()
        .isLength({ max: 25 }),
    check('description', 'field is required,Max 10000 characters allowed !!')
        .trim()
        .notEmpty()
        .isLength({ max: 10000 }),

]

module.exports = categoryValidator;


