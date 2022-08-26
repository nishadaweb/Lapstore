const async = require('hbs/lib/async');
const { reject } = require('bcrypt/promises')
const User = require('../Models/userModel');
const bcrypt = require('bcrypt');
var moment = require('moment');
const cartModel = require('../Models/cartModel');
const wishlistModel = require('../Models/wishlistModel');
const addressModel = require('../Models/addressModel')
const coupenModel = require('../Models/coupenModel');
const productModel = require('../Models/productModel');
const orderModel = require('../Models/orderModel');
var moment = require('moment')
const Razorpay = require('razorpay');

const env = require('dotenv').config()

var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY,
    key_secret: process.env.RAZOR_SECRET,
  });

const mongoose = require('mongoose');
const { CANCELLED } = require('dns');

let userHelper = {
    
    userSave:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let {fname,lname,email,mobile,password,confirmPassword,status}=userData

                password= await bcrypt.hash(password,10)
                 user = new User({
                    fname,
                    lname,
                    email,
                    mobile,
                    password,
                    confirmPassword,
                    status
                })

                user.save().then((data)=>{
                    console.log(data)
                    resolve(data)
                }).catch((err)=>{
                    console.log(err)
                })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await User.findOne({ email: userData.email })
            if (user) {
                if(user.status){
                    response.block=true
                    resolve(response)
                }else{
                    response.block=false
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        resolve({ status: false })
                    }
                
                })
            }
            } else {
                resolve({ status: false })
            }
        })
    
    },
    editProfile:(userData)=>{
        return new Promise((resolve,response)=>{
            User.findByIdAndUpdate(userData.id,{fname:userData.fname, lname:userData.lname,email:userData.email,mobile:userData.mobile}).then((userData)=>{
                console.log(userData)
                resolve(userData)
            })
        })


    },
    
    addToCart: (userId, productId) => {
        let user_Id = mongoose.Types.ObjectId(userId);
        const response = {
            duplicate: false
        }
        return new Promise(async (resolve, reject) => {

            let cart = await cartModel.findOne({ user: user_Id })

            if (cart) {
                let cartProduct = await cartModel.findOne({ user: user_Id, 'cartItems.product': productId })
                if (cartProduct) {
                    response.duplicate = true
                    resolve(response)
                } else {
                    let cartArray = { product: productId, quantity: 1 }
                    cartModel.findOneAndUpdate({ user: user_Id }, { $push: { cartItems: cartArray } }).then(async (data) => {
                        let wishList = await wishlistModel.findOne({ user: user_Id, 'wishListItems.product': productId })
                        if (wishList) {
                            wishlistModel.updateOne({ user: userId }, {
                                $pull: {
                                    wishListItems:
                                        { product: productId }
                                }
                            }).then((data) => {
                                response.added = false
                                response.data = data
                                resolve(response)
                            })
                        }
                        resolve(data)
                    })
                }
            } else {
                console.log('gjghg');
                let product = productId;
                let quantity = 1;
                cart = new cartModel({
                    user: userId,
                    cartItems: [
                        {
                            product,
                            quantity
                        }
                    ]
                })
                cart.save().then(async (data) => {
                    let wishList = await wishlistModel.findOne({ user: user_Id, 'wishListItems.product': productId })
                    if (wishList) {
                        wishlistModel.updateOne({ user: userId }, {
                            $pull: {
                                wishListItems:
                                    { product: productId }
                            }
                        }).then((data) => {
                            response.added = false
                            response.data = data
                            resolve(response)
                        })
                    }
                    resolve(data)
                })
            }
        })
    },
    showCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartProduct = await cartModel.findOne({ user: userId }).populate('products').lean()
            resolve(cartProduct)

        })
    },
    deleteFromCart: (userId, productId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId }, {
                $pull: {
                    cartItems:
                        { product: productId }
                }
            }).then((data) => {
                resolve(data)
            })
        })

    },
    cartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cartProduct = await cartModel.findOne({ user: userId });
            if (cartProduct) {
                console.log(cartProduct);
                count = cartProduct.cartItems.length
                console.log(count);
            }
            resolve(count)
        })
    },
    getCartProducts: (userId) => {
        
        return new Promise(async(resolve, reject) => {
            let response={}
            
            let cartItems = await cartModel.findOne({ user: userId }).populate('cartItems.product').lean()
            if (cartItems){
            if(cartItems.cartItems.length > 0){
                response.notEmpty = true;
                response.cart = cartItems;


                console.log(cartItems);
                resolve(response)
            }
            else{
                response.notEmpty = false;
                resolve(response)
            }
        }
        else{
            response.notEmpty = false;
            resolve(response) 
        }
            })
        
    },
    quantityPlus: (productId, userId) => {
        console.log(productId)
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId, 'cartItems.product': productId }, { $inc: { 'cartItems.$.quantity': 1 } }).then(async (data) => {
                let cart = await cartModel.findOne({ user: userId }).lean()
                let response = {}
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == productId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                response.count = count
                resolve(response)
            })
        })
    },
    quantityMinus: (productId, userId) => {
        console.log(productId)
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId, 'cartItems.product': productId }, { $inc: { 'cartItems.$.quantity': -1 } }).then(async (data) => {
                let response = {}
                let cart = await cartModel.findOne({ user: userId }).lean()
                response.cart = cart
                console.log(cart)
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == productId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                if (count == 0) {
                    cartModel.updateOne({ user: userId }, {
                        $pull: {
                            cartItems:
                                { product: productId }
                        }
                    }).then((data) => {
                        response.data = data
                    })
                }
                response.count = count
                resolve(response)
            })
        })
    },
    deleteFromCart: (userId, productId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId }, {
                $pull: {
                    cartItems:
                        { product: productId }
                }
            }).then((data) => {
                resolve(data)
            })
        })
    },
    cartTotal: (cart) => {
        console.log(JSON.stringify(cart) + "hjhgjhg")
        return new Promise(async (resolve, reject) => {
            let total = cart.cartItems.reduce((acc, curr) => {
                acc = acc + curr.product.productprice * curr.quantity
                return acc;
            }, 0)
            console.log(total + "dhedh")
            let response = {};
            let shipping = 0;
            if (total < 30000) {
                shipping = 1000;
            }
            response.shipping = shipping;
            response.total = total;
            response.grandTotal = response.total+response.shipping;
            if(cart.discount){
               response.grandTotal = response.grandTotal - cart.discount
                response.discount = cart.discount
            }
            resolve(response);
        })
    },
    applyCoupon: (code,id) => {
        return new Promise(async(resolve, reject) => {
            let response = {}
            response.discount = 0
            // code.code = code.code.toUpperCase();
            let coupon = await coupenModel.findOne({code:code.code})
            if(coupon){
                response.status = true
                response.coupon = coupon
                userHelper.getCartProducts(id).then((cartProducts)=>{
                    userHelper.cartTotal(cartProducts.cart).then((total)=>{
                        response.discount = (total.grandTotal * coupon.percentage)/100
                        response.grandTotal = total.grandTotal - response.discount
                        console.log(response,"HFJHHJGJHGJHGJHG")
                        resolve(response)
                    })
                })
            }else{
                response.status = false
                resolve(response)
            }
        })
    },
    addToWishList:(userId,productId)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            let userWishlist = await wishlistModel.findOne({user: userId})
            if(userWishlist){
                let exist = await wishlistModel.findOne({user: userId,'wishListItems.product':productId})
                if(!exist){
                    let conditions = {
                        user: userId,
                        'wishListItems.product': { $ne: productId }
                    };
                    var update = {
                        $addToSet: { wishListItems: { product: productId} }
                    }
                    wishlistModel.findOneAndUpdate(conditions, update).then((data)=>{
                        response.added = true
                        response.data = true
                        resolve(response)
                    })
                }else{
                    wishlistModel.updateOne({ user: userId }, {
                        $pull: {
                            wishListItems:
                                { product: productId }
                        }
                    }).then((data)=>{
                        response.added = false
                        response.data = data
                        resolve(response)
                    })
                }

            }else{
                let user = userId
                let product = productId
                let wishlistItems = []
                wishlistItems[0] = {product}
                newWishlist = new wishlistModel({
                    user,
                    wishlistItems
                })
                newWishlist.save().then((data) => {
                    response.added = true
                    response.data = data
                    resolve(response)
                })
            }
        })
    },
    wishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlistProduct = await wishlistModel.findOne({ user: userId });
            if (wishlistProduct) {
                console.log(wishlistProduct);
                count = wishlistProduct.wishListItems.length
                console.log(count);
            }
            resolve(count)
        })
    },
    checkWishlist:(userId,productId)=>{
        return new Promise(async(resolve,reject) => {
            let wishlist = null
            wishlistModel.find({user:userId,wishListItems: { 
                $elemMatch: { product: productId } 
             }}).then((data)=>{
                if(data.length > 0){
                    wishlist = true
                    console.log(wishlist,'exist')
                }else{
                    wishlist = false
                    console.log(wishlist,'not')
                }
                resolve(wishlist)
             })
            
        })
    },
    wishListProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let products = await wishlistModel.findOne({user:userId}).populate('wishListItems.product').lean()
            
            if (products.wishListItems.length > 0) {
                response.notEmpty = true
                response.products = products
                resolve(response)
            } else {
                response.notEmpty = false
                resolve(response)
            }
        })
    },
    removeWishListItem: (userId, productId) => {
        return new Promise((resolve, reject) => {
            let response = {}
            wishlistModel.updateOne({ user: userId }, {
                $pull: {
                    wishListItems:
                        { product: productId }
                }
            }).then((data) => {
                response.removed = true
                response.data = data
                resolve(response)
            })
        })
    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await addressModel.find({ User: userId }).lean();
            resolve(address);
        })
    },
    addAddress: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            try{

                
                let address = await addressModel.find({ User: userId }).lean();
                
                let Address = new addressModel({
                    User: userId,
                    name: data.name,
                    address:data.address,
                    address1: data.address1,
                    address2: data.address2,
                    city: data.city,
                    state: data.state,
                    pinCode: data.pinCode,
                    mobile: data.mobile,
                    defaultAddress:false
                })
            console.log(Address)
                Address.save().then((address) => {
                    resolve(address);
                })
            }catch(err){
                console.log(err)
            }
            })
    },
   
     
    PlaceOrder:(data,userId)=>{
        let orderStatus;
        return new Promise(async (resolve, reject) => {
          if(data.paymentMethod==='COD'){
           orderStatus = 'placed';
          }
          else{
            orderStatus = 'pending';
          }
          console.log(data);
          userHelper.getCartProducts(userId).then((cartProducts)=>{
            userHelper.cartTotal(cartProducts.cart).then((response)=>{
                console.log(JSON.stringify(response) + "yddytfyt")
                if(data.discount){
                    response.grandTotal = response.grandTotal - data.discount
                    console.log(response.grandTotal,data.discount)
                }

             let order = new orderModel({
                User: userId,
                orderItems: cartProducts.cart.cartItems,
                totalPrice:response.grandTotal,
                
                orderdDate: moment().format("DD-MM-YY"),
                paymentAddress: data.address,
                PaymentMethod:data.paymentMethod,
                subTotal:response.subTotal,
                shipping:response.shipping,
                discount:data.discount,
                orderStatus
              })
              order.save().then(async(data)=>{
                // cartModel.findByIdAndRemove()
                let cartItems = cartProducts.cart.cartItems
                // for(let i=0;i<cartItems.length;i++){
                    cartModel.findOneAndUpdate({user:userId},{$pull:{cartItems:{}}}).then((data)=>{
                        console.log(data);
                    
                    })
                // }
                console.log(data,"jgjgjhgjhgjhggfdtreythgdhgc")
                resolve(data);
              })
            })
          })
        })
      },
      generateRazorPay:(Order)=>{
        return new Promise((resolve,reject) => {
            console.log(Order,"generator")
            let fund = Order.totalPrice * 100
            fund = parseInt(fund)
            var options = {
                amount: fund,  
                currency: "INR",
                receipt: ""+Order._id,
              };
              instance.orders.create(options, function(err, order) {
                console.log(order+"cvxcv");
                console.log(err);
                resolve(order)
              });

        })
      },
      verifyPayment:(data)=>{
        return new Promise(async (resolve, reject) => {
          const crypto = require('crypto');
          let hmac = crypto.createHmac('sha256',process.env.RAZOR_SECRET)
          let body=data.payment.razorpay_order_id + "|" + data.payment.razorpay_payment_id;
          hmac.update(body.toString());
          hmac = hmac.digest('hex');
          if(hmac==data.payment.razorpay_signature){

            console.log("verified")
            resolve();
          }else{
            reject();
          }
        })
      },
      changeOrderStatus:(data,id)=>{
        return new Promise(async (resolve, reject)=>{
          orderModel.findByIdAndUpdate(data.order.receipt,{ orderStatus:true,orderStatus:'placed' }).then(()=>{
            cartModel.findOneAndRemove({user:id}).then(()=>{
                resolve()
            })
          })
        })
      },
    getUserOrders:(userId)=>{
            return new Promise(async (resolve, reject) => {
            // let userOrder = await 
            orderModel.find({ User:userId }).sort({orderdDate:-1}).populate('orderItems.product').populate('paymentAddress').lean().then((userOrder)=>{
                resolve(userOrder)
            }).catch((err)=>{
                reject(err)
            })
             })
        },
        getOrder: (id) => {
            return new Promise((resolve, reject) => {
              orderModel
                .findById(id)
                .populate("orderItems.product")
                .populate("orderItems.product.categoryname")
                .populate("paymentAddress")
                .lean()
                .then((order) => {
                  resolve(order);
                  console(order +"bdhd")
                })
                .catch((err) => {
                  reject(err);
                });
            });
          },
        cancelOrder:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
               let order = await orderModel.findById(orderId).lean()
               
                orderModel.findByIdAndUpdate(orderId,{orderStatus:'cancelled'}).then((data)=>{
                    resolve(data)
                })
               
              
                
            })
        },
        search: (searchID) => {
                //    console.log(searchID.productname);
            return new Promise(async (resolve, reject) => {
              let products = await productModel.find({ productname: searchID.productname}).lean()
              console.log(JSON.stringify(products) +"fhsdbfhb")
              resolve(products)
            })
            
          } 

    }
    module.exports = userHelper

        
    
    

    
    

    

    
