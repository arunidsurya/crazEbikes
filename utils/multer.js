const multer= require('multer');


const fileStorage=multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'images');
    },
    filename:(req,file,callback)=>{
        callback(null,new Date().toISOString()+"_"+file.originalname);
    }
});



const fileFilter =(req,file,callback)=>{
    if(file.mimetype === 'image/png' ||file.mimetype === 'image/jpeg' ){
        callback(null,true);
    }
    else{
        callback(null,false);
    }
}

module.exports={
    fileStorage,
    fileFilter,
}