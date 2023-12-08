const express = require('express');




function generateInvoiceNumber() {
    const staticPrefix = "INV/CRAZEBIKES/WS/2023"; // Add your static alphanumeric values here
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number

    return `${staticPrefix}${randomDigits}`;
}


module.exports=generateInvoiceNumber;