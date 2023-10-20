
const{getAdmin}= require('../service/auth');

async function checkAdminAuth(req,res,next){
    const adminUid = req.cookies?.adminuid;
    const admin = getAdmin(adminUid);
    console.log(admin);
    req.admin = admin;
    next();
}



module.exports={
    checkAdminAuth,
}