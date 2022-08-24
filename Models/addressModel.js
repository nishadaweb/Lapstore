const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    User:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name:{
        type: String,
    },
    address:{
        type: String,
    },
    address1:{
        type: String,
    },
    address2:{
        type: String,
    },
    city:{
        type: String,
    },
    state:{
        type: String,
    },
    
    pinCode:{
        type: Number,
    },
    mobile:{
        type:String,
    },
    defaultAddress:{
        type: Boolean,
    },
    
},{
     timestamps: true 
});

module.exports = mongoose.model('Address',AddressSchema);