const mongoose = require('mongoose');
const Schema = mongoose.Schema

const cartSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required:true
        
    },
    cartItems: [{
        product:{
        type: Schema.Types.ObjectId,
        ref: 'Product'},
        quantity:{
        type: Number
        },
        price:{
            type:Number
        }
    }],
},

{
    timestamps: true,
}
)

module.exports = mongoose.model('Cart', cartSchema);
