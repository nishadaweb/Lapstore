const multer=require('multer');


const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/images/productimg');
    },
    filename:function (req,file,cb){
        const name=Date.now() + '-' + file.originalname;
        cb(null,name);
    }
})
const upload = multer({storage:storage})

module.exports={storage,upload}

