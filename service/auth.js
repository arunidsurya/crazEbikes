const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();


const secret =process.env.SECRET;

function setAdmin(admin){
    return jwt.sign({
        _id:admin._id,
        email:admin.email,
    },
    secret);
}

function getAdmin(adminToken) {
    if(!adminToken) return null;
    try {
        return jwt.verify(adminToken,secret);
    } catch (error) {
        return null;
    }
}

function setUser(user){
    return jwt.sign({
        _id:user._id,
        email:user.email,
    },
    secret);
}

function getUser(adminToken) {
    if(!userToken) return null;
    try {
        return jwt.verify(userToken,secret);
    } catch (error) {
        return null;
    }
}

module.exports={
    getAdmin,
    setAdmin,
    setUser,
    getUser,
}