const nodemailer = require("nodemailer");


// Nodemailer conf
let transpoter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASS,
    },
})

//testing success 
transpoter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        console.log("Ready for messages");
        console.log(success);
    }
});


module.exports=transpoter;