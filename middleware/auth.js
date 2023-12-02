
const{getAdmin,getUser}= require('../service/auth');


async function checkAdminAuth(req,res,next){
    const adminUid = req.cookies?.adminuid;
    const admin = getAdmin(adminUid);
    req.admin = admin;
    next();
}

async function checkUserAuth(req,res,next){
    const userId= req.session.userId;
    if(!userId||userId==null){
       return res.redirect('/user-login');
    }
    next();
}


module.exports={
    checkAdminAuth,
    checkUserAuth,
}