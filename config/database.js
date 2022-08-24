const mongoose = require( 'mongoose')
const mongourl='mongodb://127.0.0.1:27017/lapstore'
const mongoconnection=mongoose.connect(mongourl,()=>
console.log("database connected"))
module.exports={mongoconnection}