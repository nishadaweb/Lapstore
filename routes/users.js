const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require('../models/userModel');
const userHelpers=require('../helpers/user-helpers')
const adminHelpers=require('../helpers/admin-helpers')
const auth=require('../helpers/auth')
const Products=require('../models/productModel');
const category = require('../models/categoryModel');
const banner = require('../models/bannerModel');
const cart = require('../models/cartModel');
const address = require('../models/addressModel')
const { Router } = require('express');



const isLogin = (req,res,next)=>{
  if(req.session.userloggedIn){
      console.log('session')
    next()
    
    
  }else{
    res.redirect('/login')
  }
}


router.get('/', (async(req, res) => {
  let session = req.session
  let Product = await Products.find({}).lean()
  let categories =await category.find({}).lean()
  let Banner = await banner.find({}).lean()
  
  console.log(session);
   res.render('user/user-home',{layout:'homelayout',users:true,session,Product,categories,Banner});
    req.session.loginerr=false
  

}));
router.get('/AllProducts',(async(req,res)=>{
  let session=req.session
  let Product = await Products.find({}).lean()
  let categories =await category.find({}).lean()
  res.render('user/store',{layout:'homelayout',users:true,session,Product,categories});
}));
router.get('/AllProduct/:category',async(req,res,next)=>{
  try{
    let session = req.session
  let categories=req.params.category;
  let Product = await Products.find({productcategory:categories}).lean()
  adminHelpers.getAllCategory().then(async(categories)=>{
    res.render('user/store',{layout:'homelayout',session,categories,Product})
  })
  req.session.loginerr=false
  }catch(err){
    res.status(404)
    next(err)
  }
  
})


router.get('/login', function(req, res, next) {
 
  if(req.session.userloggedIn){

     res.redirect('/')
  }else{
    let blocked=req.session.blocked
    res.render('user/user-login',{loginerr:req.session.userLoginErr,blocked});
    req.session.userLoginErr=false
  }

});
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if(response.block){
      
      res.render('user/user-login' , {err : 'You are Blocked'})
    }else{
    if (response.status) { 
      req.session.userloggedIn = true   
      req.session.user = response.user
      res.redirect('/')
    }
    else {
      req.session.userLoginErr = "Invalid user name or password"
      res.redirect('/login')
    }
  }
  })
})
router.get('/register', function(req, res, next) {
  
  if(req.session.userloggedIn){
    res.redirect('/')
  }
  else{
    signupErr=req.session.check
  res.render('user/user-register',{signupErr});
  req.session.check=false
  }
});

router.post('/register', (req, res) => {
  console.log(req.body);
  auth.userCheck(req.body.email).then((status)=>{
    if(status.check){
      req.session.check=true
      res.redirect('/register')
    }
    else{
      auth.sendOtp(req.body.mobile).then((verification)=>{
       req.session.mobile=req.body.mobile
        req.session.user=req.body
        res.redirect('/otp')
      })
    }
  })
})
  router.post('/loginotp',(req,res)=>{
    console.log(req.body.mobile +"ff")
    auth.checkMobile(req.body.mobile).then((status) => {
      console.log(status)
      if (!status.check) {
        req.session.exist = true
        res.redirect('/login')
      } else {
        auth.sendOtp(req.body.mobile).then((verification => {
          req.session.exist = false
          req.session.mobile = req.body.mobile
          req.session.user = status.user
          console.log(req.session.user);
          res.redirect('/loginotp')
        }))
      }
    })
  })
  router.get('/loginotp',(req,res)=>{
    var mobile = req.session.mobile
    
    res.render('user/loginotp',{ mobile})
  })
  
  router.post('/otpverify',(req,res)=>{
    auth.verifyOtp(req.body.otp, req.body.mobile).then((check) => {
      if (check === 'approved') {
        
        req.session.userloggedIn=true
        
          res.redirect('/')
      } else {
        
        res.redirect('/loginotp')
      }
    })
  })
  router.get('/otp', ((req, res) => {
    var mobile = req.session.mobile
    
    
    res.render('user/registerotp', { mobile })
  }))
  
  router.post('/otp', ((req, res) => {
    auth.verifyOtp(req.body.otp, req.body.mobile).then((check) => {
      if (check === 'approved') {
        
        userHelpers.userSave(req.session.user).then((data) => {
          req.session.user = data
          req.session.loggedIn=true
          req.session.userloggedIn = true
          res.redirect('/')
        })
      } else {
        
        res.redirect('/otp')
      }
    })
  }))
  router.get('/view-profile',(async(req, res) => {
    if(req.session.userloggedIn){
      let userData = await User.findOne({email:req.session.user.email}).lean()
   
      
      let session = req.session
      let userId= req.session.user._id;
      userHelpers.getAddress(userId).then((address) => {
        
      res.render('user/viewprofile',{userData,layout:'homelayout',session,address})
    })
    }
    else{
      res.redirect('/login')
    }
    
    
  }))
  router.get('/edit-profile',((req, res) => {
    
    if(req.session.userloggedIn){
      let userData =req.session.user
      let session = req.session

    console.log(userData);
    res.render('user/editprofile',{layout:'homelayout',userData,session})
    }
    else{
      res.redirect('/login')
    }
  }))
  router.post('/edit-profile', (req, res) => {
    userHelpers.editProfile(req.body).then(() => {
      
      res.redirect('/view-profile')
    })
  })
  router.get('/view-singleproduct/:id',async(req, res,next) => {
    let session = req.session
    console.log(session)
    adminHelpers.getProduct(req.params.id).then(async(product)=>{
      let categories =await category.find({}).lean()
    
      console.log(product)
      res.render('user/singleproduct',{layout:'homelayout',users:true,session,product,categories})
    }).catch((err)=>{
      next(err)
    })
    
    
    
})

router.post('/addToCart/:id',isLogin,(req,res,next)=>{
  if(req.session.user){
    let userId=req.session.user._id;
    let productId = req.params.id;

  
  userHelpers.addToCart(userId,productId).then(response =>{
    res.json({response,status:true})
  })

  }else{
    res.json({status:false})

  }

    
  })


router.get('/view-cart',isLogin,(req,res)=>{
  let session = req.session
  req.session.coupon=null;
  req.session.discount=null;
  userHelpers.getCartProducts(req.session.user._id).then((response)=>{
    adminHelpers.getAllCoupon().then((coupons)=>{
      console.log(JSON.stringify(response) +"cart ")
      
    if(response.notEmpty){
      let cart=response.cart
      res.render('user/viewcart',{layout:'homelayout',user:true,cart,response,session,coupons})
    }
else{
  res.render('user/viewcart',{layout:'homelayout',user:true,response,session})
}
    })
    
  })
  
})

router.get('/cartCount',(req,res)=>{
  userHelpers.cartCount(req.session.user._id).then((response)=>{
    res.json({response})
  })
})

router.post('/quantityPlus/:id',isLogin,(req,res)=>{
  userHelpers.quantityPlus(req.params.id,req.session.user._id).then((response)=>{
    res.json({response})
  })
})

router.post('/quantityMinus/:id',isLogin,(req,res)=>{
  userHelpers.quantityMinus(req.params.id,req.session.user._id).then((response)=>{
    res.json({response})
  })
})

router.post('/deleteFromCart/:id',isLogin,(req,res)=>{
  userHelpers.deleteFromCart(req.session.user._id,req.params.id).then((response)=>{
    res.json({response})
  })
})
router.post('/applyCoupon',isLogin,(req,res)=>{
  userHelpers.applyCoupon(req.body,req.session.user._id).then((response)=>{
   
    if(response.status){
      req.session.coupon = response.coupon
      req.session.discount = response.discount
    }
    res.json({ response })  
  })
})

router.post('/addToWishList/:id', isLogin, (req, res) => {
  if(req.session.user){
    let userId=req.session.user._id;
    let productId = req.params.id;

  
  userHelpers.addToWishList(userId,productId).then(response =>{
    res.json({response,status:true})
  })
  }else{
    res.json({status:false})

  }

    
  })


router.get('/wishlistCount',(req,res)=>{
  userHelpers.wishlistCount(req.session.user._id).then((response)=>{
    res.json({response})
  })
})

router.get('/wishlist', isLogin, (req, res) => {
  let session = req.session
  userHelpers.wishListProducts(req.session.user._id).then((response) => {
    if (response.notEmpty) {
      let wishListItems = response.products.wishListItems
      res.render('user/viewwishlist', { layout:'homelayout',user: true, session, response, wishListItems })
    } else {
      res.render('user/viewwishlist', { layout:'homelayout',user: true, session, response })
    }
  })
})

router.get('/checkWishlist/:id', isLogin, (req, res) => {
  userHelpers.checkWishlist(req.session.user._id, req.params.id).then((wishList) => {
    res.json({ wishList })
  })
})

router.post('/removeWishListItem/:id', isLogin, (req, res) => {
  userHelpers.removeWishListItem(req.session.user._id, req.params.id).then((response) => {
    res.json({ response })
  })
})

router.get("/checkout", isLogin, (req, res) => {
  const userId = req.session.user._id;
  let session = req.session
  userHelpers.getAddress(userId).then((address) => {
  userHelpers.getCartProducts(userId).then((response) => {
    adminHelpers.getAllCategory().then(async(categories)=>{
      let cartProducts = response.cart
      if(req.session.discount){
        cartProducts.discount = req.session.discount
      }
      console.log(cartProducts,"checkout")
      userHelpers.cartTotal(cartProducts).then((response) => {
      res.render("user/checkout", { layout:'homelayout',user: true, session, cartProducts, address,response,categories });
    })
  })
  })
  })
})
router.get('/add-address', isLogin, (req, res) => {
  let session = req.session
  let userId= req.session.user._id;
  console.log('yttfy',userId)
  userHelpers.getAddress(userId).then((address) => {
    res.render("user/addresspage", { layout:'homelayout',user: true, address, session })
  })
})

router.post('/address', isLogin, (req, res) => {
  const userId = req.session.user._id;
  userHelpers.addAddress(req.body, userId).then((address) => {
    res.redirect('/view-profile')
  })
})

router.get('/orders-list',isLogin, async (req, res) => {
  let session = req.session
  const userId = req.session.user._id;
  console.log(userId + "bd")
  let orders = await userHelpers.getUserOrders(userId)
  console.log(orders +"dbsd")
  res.render('user/orders-list', {layout:'homelayout', orders,session})
})


router.post('/place-Order',isLogin,(req,res)=>{
  let userId = req.session.user._id;
  orderDetails = req.body
  if(req.session.coupon){
    orderDetails.discount = req.session.discount
  }
  userHelpers.PlaceOrder(orderDetails,userId).then((order)=>{
    console.log(order,"PlaceOrder")
    if(order.PaymentMethod === 'COD'){
      console.log("asdfasfafa aslfdka fasfd")
      res.json({order})
    }else{
      userHelpers.generateRazorPay(order).then((data)=>{
        console.log(data)
        res.json({data})
      })
    }
  })
})
router.post('/verifyPayment',isLogin, (req, res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changeOrderStatus(req.body,req.session.user._id).then(()=>{
      res.json({status: true});
    })
  })
})

router.get('/order-success/:id',(req,res,next)=>{
  let session = req.session
  console.log(req.params.id)
  userHelpers.getUserOrders(req.params.id).then((order)=>{
  res.render('user/ordersuccess',{layout:'homelayout',user:true,order})
}).catch((err)=>{
  next(err)
})
})
router.get('/Cancel-order/:id',(req,res)=>{
  let orderId = req.params.id;
  userHelpers.cancelOrder(orderId).then((response) => {
    res.redirect('/orders-list')
  })
})

router.get('/orderDetails/:id', isLogin, (req, res, next) => {
  let session = req.session
  userHelpers.getOrder(req.params.id).then((order) => {
    res.render("user/Order-details", {layout:'homelayout', order, user: true, session });
    
  }).catch((err) => {
    next(err);
  });
})

router.post('/search', async (req, res) => {
  
  userHelpers.search(req.body).then((products) => {
    
    if(products){
    res.render('user/store', {layout:'homelayout',products})
    }
    else{
      res.render('user/user-home',{message:'No matching Products'})
    } 

  })
})
    
 
  
    

  



router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})

module.exports = router;

