const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
    fname:{
        type : String,
        required : true
    },
    lname:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type : String,
        required : true

    },
    status:{
        type:Boolean ,
        required:true

    }
    
})
const users = mongoose.model('User', userSchema)
module.exports = users
