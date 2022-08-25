const express = require('express');
const async = require('hbs/lib/async');
const router = express.Router();
const Admin = require('../models/adminModel');
const adminHelpers=require('../helpers/admin-helpers');
const { response } = require('express');
const multer=require('../helpers/multer')
const category = require('../models/categoryModel');



/* GET home page. */
const verify = (req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }
  else{
    res.redirect('/admin/adminlogin');
  }
}

router.get('/',verify, async(req, res)=> {
 console.log(req.session.adminLoggedIn)
 let session=req.session.admin
 let totalUser = await adminHelpers.getUsersCount()
  let totalOrder =await adminHelpers.getOrderCount()
  let COD = await adminHelpers.findTotalCOD()
  let Razorpay = await adminHelpers.findTotalOnline()
  let shipped = await adminHelpers.totalShipped()
  let deliverd = await adminHelpers.totalDeliverd()
  let sales = await adminHelpers.getTotalSales()
  

  
  res.render('admin/adminhome',{layout:'adminlayout',session,totalUser,totalOrder,COD,Razorpay,shipped,deliverd,sales})


});
router.get('/report',verify,async(req,res)=>{
  let deliverdOrder = await adminHelpers.getAllDeliverdOrder()
  let codsales = await adminHelpers.getCODsales()
  let onlinesales = await adminHelpers.getOnlineSales()
  console.log(codsales +"ghg")
    res.render('admin/report',{deliverdOrder,codsales,onlinesales,admin:true,layout:'adminlayout'})
  })



router.get('/adminlogin',function(req,res){
  if(req.sessionStore.adminLoggedIn){
 res.redirect('/admin')
  }
  else{
    let logerr=req.session.adminLoggErr
    req.session.adminLoggErr = null;
    res.render('admin/admin-login', { logerr })
  }

})
router.post('/login', async(req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {   
      console.log(response);   
      req.session.admin= response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin')
    } else {
      req.session.adminLoggErr = true
      res.redirect('/admin/adminlogin')
    }
  })
})
router.get('/view-category',verify,(req,res)=>{
  if(req.session){
      adminHelpers.getAllCategory().then((categories)=>{
          res.render('admin/viewcategory',{categories,admin:true,layout:'adminlayout'})
      })
  }else{
      res.redirect(302,'/admin/login')
  }
})

router.get('/add-category',verify,(req,res)=>{
  
  let exist = req.session.categoryexist


  res.render('admin/addcategory',{exist,layout:'adminlayout'})
})

router.post('/add-category',verify, multer.upload.single('categoryimage'),(req,res)=>{
  let image = req.file.filename
  adminHelpers.addCategory(req.body,image).then((response)=>{
      console.log(response)
      if(response.check){
          req.session.categoryexist=true
          res.render('admin/addcategory',{exist: req.session.categoryexist,layout:'adminlayout'})
          req.session.categoryexist=false

      }else{
          res.redirect('/admin/view-category')
      }
  })
})
router.get('/edit-category/:id',verify, async (req, res,next) => {
  try{
    if (req.session.adminLoggedIn) {
      let categories = await adminHelpers.getCategory(req.params.id)
      res.render('admin/editcategory', {categories,layout:'adminlayout'})
      
    } else {
      res.redirect('/admin');
    }
  }catch(err){
    res.status(404)
    err.admin=true;
    next(err)
  }
  
})

router.post('/edit-category',verify,multer.upload.single('categoryimage'),(req, res) => {
  let image = req.file.filename
  adminHelpers.editCategory(req.body,image).then(() => {
    res.redirect('/admin/view-category')
  })
})
router.get('/delete-category/:id',verify,(req,res)=>{
  adminHelpers.deleteCategory(req.params.id).then(()=>{
      res.redirect('/admin/view-category')
  })
})
router.get('/view-users',verify, function (req, res, next) {
 
  adminHelpers.getAllUsers().then((userdetails) => {
    if (req.session.adminLoggedIn) {
      res.render('admin/view-users', { userdetails,layout:'adminlayout'});
      
    } else {
      res.redirect('/admin')
    }
  }
  )
});

router.get('/block-user/:id',verify, (req, res) => {
  let usrId = req.params.id;
  adminHelpers.blockUser(usrId).then((response) => {
    res.redirect('/admin/view-users')
  })
})
router.get('/view-product',verify,(req,res)=>{
  if(req.session){
      adminHelpers.getAllProduct().then((products)=>{
          res.render('admin/view-product',{products,layout:'adminlayout'})
      })
  }else{
      res.redirect(302,'/admin/login')
  }
})

router.get('/add-product',verify,async(req,res,next)=>{
  let exist = req.session.productexist
  if (req.session.adminLoggedIn) {
    let categories=await category.find({}).lean()
    console.log(categories)

  res.render('admin/add-product',{exist,layout:'adminlayout',categories})
  }
  else{
    res.redirect('/admin');
  }
})

router.post('/add-product', verify,multer.upload.array('productimage',4),(req,res)=>{
  let images=[]
  files=req.files
  images=files.map((value)=>{
    return value.filename
  })
  console.log(images);
  adminHelpers.addProduct(req.body,images).then((response)=>{
    
      console.log(response)
      if(response.check){
          req.session.productexist=true
          res.render('admin/add-product',{exist:req.session.productexist,layout:'adminlayout'})
          req.session.productexist=false

      }else{
          res.redirect('/admin/view-product')
      }
  })
})

router.get('/edit-product/:id',verify, async (req, res,next) => {
  try{
    if (req.session.adminLoggedIn) {
      let products = await adminHelpers.getProduct(req.params.id)
      let categories=await category.find({}).lean()
      res.render('admin/edit-product', {products,layout:'adminlayout',categories})
      } else {
      res.redirect('/admin');
    }
  }catch(err){
    res.status(404)
    err.admin=true;
    next(err)
  }
 
})

router.post('/edit-product',verify, multer.upload.array('productimage',4),(req, res) => {
  let images=[]
  files=req.files
  images=files.map((value)=>{
    return value.filename
  })
  adminHelpers.editProduct(req.body,images).then(() => {
    res.redirect('/admin/view-product')
  })
})
router.get('/delete-product/:id',verify,(req,res)=>{
  adminHelpers.deleteProduct(req.params.id).then(()=>{
      res.redirect('/admin/view-product')
  })
})

router.get('/view-banner',verify,(req,res)=>{
  if(req.session){
      adminHelpers.getAllBanner().then((banners)=>{
          res.render('admin/view-banner',{banners,layout:'adminlayout'})
      })
  }else{
      res.redirect(302,'/admin/login')
  }
})
router.get('/add-banner',verify,async(req,res)=>{
  let exist=req.session.bannerexist
  let categories=await category.find({}).lean()
  res.render('admin/add-banner',{layout:'adminlayout',categories,exist})
})
router.post('/add-banner',verify,multer.upload.single('bannerimage'),(req,res)=>{
let image=req.file.filename
console.log(image);
adminHelpers.addBanner(req.body,req.file.filename).then((response)=>{
  if(response.check){
    req.session.bannerexist=true
    res.render('admin/add-banner',{exist:req.session.productexist,layout:'adminlayout'})
    req.session.bannerexist=false

  }else{
    res.redirect('/admin/view-banner')
  }
})
})
router.get('/edit-banner/:id',verify, async (req, res,next) => {
  try{
    if (req.session.adminLoggedIn) {
      let categories = await adminHelpers.getAllCategory(req.params.id)
      let banner = await adminHelpers.getBanner(req.params.id)
      res.render('admin/edit-banner', {layout:'adminlayout',categories,banner})
      
    } else {
      res.redirect('/admin');
    }

  }catch(err){
    res.status(404)
    err.admin=true;
    next(err)
  }
 
})
router.post('/edit-banner',verify,multer.upload.single('bannerimage'),(req, res) => {
  let image=req.file.filename
  console.log(image)
  adminHelpers.editBanner(req.body,req.file.filename).then(() => {
    res.redirect('/admin/view-banner')
  })
})
router.get('/delete-banner/:id',verify,(req,res)=>{
  adminHelpers.deleteBanner(req.params.id).then(()=>{
      res.redirect('/admin/view-banner')
  })
})
router.get('/view-coupon',verify,(req,res)=>{
  if(req.session){
  adminHelpers.getAllCoupon().then((coupon)=>{
    console.log(coupon +"djkdnkj")
          res.render('admin/view-coupon',{coupon,layout:'adminlayout'})
      })
  }else{
      res.redirect(302,'/admin/login')
  }
})
router.get('/add-coupon',verify,async(req,res)=>{
  let exist=req.session.couponexist

  res.render('admin/add-coupon',{layout:'adminlayout',exist})
})
router.post('/add-coupon',verify,(req,res)=>{
adminHelpers.addCoupon(req.body).then((response)=>{
  if(response.check){
    req.session.couponexist=true
    res.render('admin/add-coupon',{exist:req.session.couponexist,layout:'adminlayout'})
    req.session.couponexist=false

  }else{
    res.redirect('/admin/view-coupon')
  }
})
})
router.get('/edit-coupon/:id',verify, async (req, res,next) => {
  try{

    if (req.session.adminLoggedIn) {
      let coupon = await adminHelpers.getCoupon(req.params.id)
      console.log(coupon +"sddfdf")
      res.render('admin/editcoupon', {layout:'adminlayout',coupon})
      
    } else {
      res.redirect('/admin');
    }

  }catch(err){
    res.status(404)
    err.admin=true;
    next(err)
  }
  
})
router.post('/edit-coupon',verify,(req, res) => {
  adminHelpers.editCoupon(req.body).then(() => {
    res.redirect('/admin/view-coupon')
  })
})
router.get('/delete-coupon/:id',verify,(req,res)=>{
  adminHelpers.deleteCoupon(req.params.id).then(()=>{
      res.redirect('/admin/view-coupon')
  })
})
router.get('/view-order',verify, function (req, res, next) {
 
  adminHelpers.getAllUsers().then((userdetails) => {
  adminHelpers.getAllOrders().then((orderdetails) => { 
      
    if (req.session.adminLoggedIn) {
      res.render('admin/view-orders', { userdetails,orderdetails,layout:'adminlayout'});
      
    } else {
      res.redirect('/admin')
    }
  })
  }
  )
});
router.get('/orderstatus-shipped/:id', verify,(req, res) => {
  
   adminHelpers.changeOrderStatusShipped(req.params.id).then(() => {
     res.redirect('/admin/view-order')
   })
 })
 router.get('/orderstatus-deliverd/:id',verify, (req, res) => {
   
  
  adminHelpers.changeOrderStatusdelivered(req.params.id).then(() => {
    res.redirect('/admin/view-order')
  })
})
 router.get('/orderstatus-arriving/:id',verify, (req, res) => {
   
  
  adminHelpers.changeOrderStatusarriving(req.params.id).then(() => {
    res.redirect('/admin/view-order')
  })
})
router.get('/revenueChart',verify, (req, res) => {
  adminHelpers.getAllOrders().then(orders => {
      res.json({orders})
  })
})
router.get('/revenueChart1',verify, (req, res) => {
  adminHelpers.findTotalCOD().then(COD => {
    adminHelpers.findTotalOnline().then(online => {

      let orders = {
        COD,
        online
      }
      
      res.json({orders})
    })
  })
})








router.get('/adminLoggout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/admin');
});
module.exports = router;
