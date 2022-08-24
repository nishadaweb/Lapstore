const mongoose = require('mongoose'); 
const OrderSchema = new mongoose.Schema({
    User:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    orderItems:[{
        product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'},
        quantity:{
        type: Number
        }
    }],
    totalPrice:{
      type:Number
    },
    paymentAddress:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    orderdDate:{
        type:String

    },
    orderStatus:{
        type:String
    },
    PaymentMethod:{
        type:String
    },
    shipping:{
       type:Number 
    },
    discount:{
        type:Number
    },
    subTotal:{
        type:Number
    }

}
)
    module.exports = mongoose.model('Order',OrderSchema);