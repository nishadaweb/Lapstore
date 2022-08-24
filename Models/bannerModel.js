const mongoose=require('mongoose');
const bannerSchema=new mongoose.Schema({
    bannerimage:String,
    title:String,
    caption:String,
    category:String,
    tname:String
});
const Banner=mongoose.model('Banner',bannerSchema)
module.exports=Banner;