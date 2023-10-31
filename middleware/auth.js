
const{getAdmin,getUser}= require('../service/auth');


async function checkAdminAuth(req,res,next){
    const adminUid = req.cookies?.adminuid;
    const admin = getAdmin(adminUid);
    req.admin = admin;
    next();
}

async function checkUserAuth(req,res,next){
    const userUid = req.cookies?.useruid;
    const user = getUser(userUid);
    req.user = user;
    next();
}


module.exports={
    checkAdminAuth,
    checkUserAuth,
}