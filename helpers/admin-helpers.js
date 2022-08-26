const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const adminModel = require('../Models/adminModel');
const categoryModel = require('../Models/categoryModel')
const userModel = require('../Models/userModel')
const productModel = require('../Models/productModel');
const bannerModel = require('../Models/bannerModel');
const coupenModel = require('../Models/coupenModel');
const orderModel = require('../Models/orderModel');


    
module.exports={
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let email = adminData.email
            let admin = await adminModel.findOne({email})
            
            let response = {}
            if (admin) {
         if(adminData.email ===admin.email &&adminData.password === admin.password){
            console.log(admin)
            response.status=true
            response.admin=admin
            resolve(response)
         }
            } else {
                response.status = false
                resolve(response)
            }
        })
    },

addCategory: (categoryDetails,image) => {
    return new Promise(async (resolve, reject) => {
        let categoryimage = image
        let {categoryname,categorydescription} = categoryDetails
        let alias=categoryname.toLowerCase();
        let category = await categoryModel.findOne({ alias })
        let status = {
            check: false
        }
        if (category) {
            status.check = true
            resolve(status)
        } else {
            newCategory = new categoryModel({
                categoryname,
                alias,
                categorydescription,
                categoryimage
            }
            )
            newCategory.save().then((data)=>{
                console.log(data)
                status.data=data
                resolve(status)
            })
        }
    })
},
getAllCategory:()=>{
    return new Promise((resolve,reject)=>{
        // let categories = await 
        categoryModel.find({}).lean().then((categories)=>{
            resolve(categories)
        }).catch((err)=>{
            console.log(err +"vjh")
            reject(err)
        })




        
    })
},
deleteCategory:(id)=>{
    return new Promise((resolve,reject)=>{
        categoryModel.findByIdAndDelete(id).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},
getCategory:(id)=>{
    return new Promise(async(resolve,reject)=>{
        // let category = await 
        categoryModel.findOne({_id:id}).lean().then((category)=>{
            resolve(category)
        }).catch((err)=>{
            console.log(err +"vjh")
            reject(err)
        })
       
    })
},
editCategory:(details,image)=>{
    return new Promise((resolve,response)=>{
        let categoryimage =image
        categoryModel.findByIdAndUpdate(details.id,{categoryimage:categoryimage,categoryname:details.categoryname, categorydescription:details.categorydescription}).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},
getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
        let userdetails= await userModel.find({}).lean()
        resolve(userdetails) 
    })
},

getUsers:(id)=>{
    return new Promise(async(resolve,reject)=>{
        let userdetails = await userModel.findOne({_id:id}).lean()
        resolve(userdetails)
    })
},
blockUser:(usrId)=>{
    return new Promise(async(resolve,reject)=>{
       let user = await userModel.findById(usrId).lean()
       if(user.status){
        userModel.findByIdAndUpdate(usrId,{status:false}).then((data)=>{
            resolve(data)
        })
       }
       else{
        userModel.findByIdAndUpdate(usrId,{status:true}).then((data)=>{
            resolve(data)
        })
       }
        
    })
},
addProduct: (productDetails,image) => {
    return new Promise(async (resolve, reject) => {
        let productimage =image
        let {productname,productdescription,productprice,productcategory} = productDetails
        let pname=productname.toLowerCase();
        
        let product = await productModel.findOne({pname})
        let status = {
            check: false
        }
        if (product) {
            status.check = true
            resolve(status)
        } else {
            newProduct= new productModel({
                productname,
                pname,
                productdescription,
                productimage,
                productprice,
                productcategory
            }
            )
            newProduct.save().then((data)=>{
                console.log(data)
                status.data=data
                resolve(status)
            })
        }
    })
},
getAllProduct:()=>{
    return new Promise(async(resolve,reject)=>{
        let products = await productModel.find({}).lean()
        resolve(products) 
    })
},
deleteProduct:(id)=>{
    return new Promise((resolve,reject)=>{
        productModel.findByIdAndDelete(id).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},
getProduct:(id)=>{
    return new Promise(async(resolve,reject)=>{
        productModel.findOne({_id:id}).lean().then((product)=>{
            resolve(product)
        }).catch((err)=>{
            reject(err)
        })
    })
},
editProduct:(details,image)=>{
    return new Promise((resolve,response)=>{
        let productimage =image

        productModel.findByIdAndUpdate(details.id,{productname:details.productname, productdescription:details.productdescription,productimage:productimage,productprice:details.productprice,productcategory:details.productcategory}).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},
addBanner: (bannerDetails,image) => {
    return new Promise(async (resolve, reject) => {
        let bannerimage=image
        let {title,caption,category} = bannerDetails
        let tname=title.toLowerCase();
        
        let banner = await bannerModel.findOne({tname})
        let status = {
            check: false
        }
        if (banner) {
            status.check = true
            resolve(status)
        } else {
            newBanner= new bannerModel({
                title,
                tname,
                bannerimage,
                caption,
                category
            }
            )
            newBanner.save().then((data)=>{
                console.log(data)
                status.data=data
                resolve(status)
            })
        }
    })
},
getAllBanner:()=>{
    return new Promise(async(resolve,reject)=>{
        let banners = await bannerModel.find({}).lean()
        resolve(banners) 
    })
},
deleteBanner:(id)=>{
    return new Promise((resolve,reject)=>{
        bannerModel.findByIdAndDelete(id).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},
getBanner:(id)=>{
    return new Promise(async(resolve,reject)=>{
        let banner = await bannerModel.findOne({_id:id}).lean().then((banner)=>{
            resolve(banner)
        }).catch((err)=>{
            reject(err)
        })




        
    })
},
editBanner:(details,image)=>{
    return new Promise((resolve,response)=>{
        let bannerimage =image

        bannerModel.findByIdAndUpdate(details.id,{bannerimage:bannerimage, title:details.title,caption:details.caption,category:details.ategory}).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},

addCoupon: (couponDetails) => {
    return new Promise(async (resolve, reject) => {
        
        let {name,code,description,percentage} = couponDetails
        let alias=name.toLowerCase();
        
        let coupon = await coupenModel.findOne({alias})
        let status = {
            check: false
        }
        if (coupon) {
            status.check = true
            resolve(status)
        } else {
            newCoupon= new coupenModel({
                name,
                alias,
                code,
                description,
                percentage
            }
            )
            newCoupon.save().then((data)=>{
                console.log(data)
                status.data=data
                resolve(status)
            })
        }
    })
},

deleteCoupon:(id)=>{
    return new Promise((resolve,reject)=>{
        coupenModel.findByIdAndDelete(id).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},

editCoupon:(details)=>{
    return new Promise((resolve,reject)=>{
     coupenModel.findByIdAndUpdate(details.id,{name:details.name,code:details.code,description:details.description,percentage:details.percentage}).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},
getAllCoupon:(id)=>{
    return new Promise(async(resolve,reject)=>{
        let coupon = await coupenModel.find({}).lean().then((coupons)=>{
            resolve(coupons)
        })
        // resolve(coupon)
    })
},
getCoupon:(id)=>{
    return new Promise(async(resolve,reject)=>{
        let coupon = await coupenModel.findOne({_id:id}).lean().then((coupon)=>{
            resolve(coupon)
        }).catch((err)=>{
            console.log(err +"vjh")
            reject(err)
        })



        
        
    })
},
getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let orderdetails= await orderModel.find({}).sort({orderdDate:-1}).populate('User').populate('paymentAddress').populate('orderItems.product').lean()
       
        resolve(orderdetails) 
    })
},

getOrders:(id)=>{
    return new Promise(async(resolve,reject)=>{
        let orderdetails = await orderModel.findOne({_id:id}).lean()
        resolve(orderdetails)
    })
},

changeOrderStatusShipped:(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await orderModel.findByIdAndUpdate({_id:orderId},{
            $set:{orderStatus:'shipped'}
        })
         resolve(order)
       
       
    })
},
changeOrderStatusdelivered:(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await orderModel.findByIdAndUpdate({_id:orderId},{
            $set:{orderStatus:'delivered'}
        })
         resolve(order)
       
       
    })


},
changeOrderStatusarriving:(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await orderModel.findByIdAndUpdate({_id:orderId},{
            $set:{orderStatus:'arriving'}
        })
         resolve(order)
       
       
    })


},
getUsersCount:()=>{
    return new Promise(async(resolve,reject)=>{
        let usercount= await userModel.count()
        resolve(usercount)
    })
},
getProductCount:()=>{
    return new Promise(async (resolve, reject) => {
        let productcount= await productModel.count() 
        resolve(productcount)
    })
},
getOrderCount:()=>{
    return new Promise(async (resolve, reject) => {
        let ordercount= await orderModel.count() 
        resolve(ordercount)
    })
},
findTotalCOD:()=>{
    return new Promise(async (resolve, reject) => {
        const totalCod = await orderModel.find({ PaymentMethod: 'COD' }).count()
        resolve(totalCod);
    })
},
findTotalOnline: () => {
    return new Promise(async (resolve, reject) => {
        const totalOnline = await orderModel.find({ PaymentMethod: 'razorpay' }).count()
        resolve(totalOnline);
    })
},
totalShipped:()=>{

    return new Promise(async (resolve, reject) => {
        const totalShipped = await orderModel.find({ orderStatus: 'shipped' }).count()
        resolve(totalShipped);
    })
},
totalDeliverd:()=>{

    return new Promise(async (resolve, reject) => {
        const totalDeliverd = await orderModel.find({ orderStatus: 'delivered' }).count()
        resolve(totalDeliverd);
    })
},
getAllDeliverdOrder:()=>{
    return new Promise(async (resolve, reject)=>{
        const totalDeliverdOrder = await orderModel.find({orderStatus:'delivered'}).sort({orderdDate:-1}).populate('User').populate('paymentAddress').populate('orderItems.product').lean()
        resolve(totalDeliverdOrder)
    })
    
},
getTotalSales: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let sales = await orderModel.aggregate([
                {
                    $unwind: '$orderItems'
                },
                {
                    $match: { 'orderStatus': 'delivered' }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalPrice' }
                    }
                }
            ])
            if (sales[0]) {
                resolve(sales[0].total)
            } else {
                resolve(sales = 0)
            }
        
            
            
        } catch (error) {
            reject(error)
        }
    })
},
getCODsales: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let codamount
            codamount = await orderModel.aggregate([
                {
                    $unwind: '$orderItems'
                },
                {
                    $match: {
                        'orderStatus': 'delivered',
                        'PaymentMethod': 'COD'
                        
                    }
                },
                {
                    $group: {
                        _id: 
                        '$orderdDate',
                        total: {
                            $sum: '$totalPrice'
                        }
                    }
                }
            ])
            console.log("----------------------------------")
            console.log(JSON.stringify(codamount)+ "hbdjdsbjf")
            if (codamount[0]) {
                resolve(codamount)
            } else {
                resolve(codamount = 0)
            }
        } catch (error) {
            reject(error)
        }
    })
},
getOnlineSales: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let onlineamount
            onlineamount = await orderModel.aggregate([
                {
                    $unwind: '$orderItems'
                },
                {
                    $match: {
                        'orderStatus': 'delivered',
                        'PaymentMethod': 'razorpay'
                        
                    }
                },
                {
                    $group: {
                        _id: 
                        '$orderdDate',
                        total: {
                            $sum: '$totalPrice'
                        }
                    }
                }
            ])
            if (onlineamount[0]) {
                resolve(onlineamount)
            } else {
                resolve(onlineamount = 0)
            }
        } catch (error) {
            reject(error)
        }
    })
}

}

