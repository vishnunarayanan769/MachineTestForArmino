var db = require('../databaseConfig/connection')
var collections = require('../databaseConfig/collections')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID


module.exports = {

    // Helpers of creating new account //
    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0])
            })
        })
    },

    // Helper for logging-in user //
    userLogin: (loginData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: loginData.Email })
            if (user) {
                await bcrypt.compare(loginData.Password, user.Password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },

    // Helper for adding product to cart //
    addToCart: (productId, userId) => {

        let productObj = {
            item: objectId(productId),
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            //If cart already exists
            if (userCart) {
                let sameProductExists = userCart.products.findIndex(product => product.item == productId)
                //if same product exists in the cart, then increase quatity
                if (sameProductExists != -1) {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(userId), 'products.item': objectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                    //if same product not exits in the cart
                } else {

                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: productObj }
                        }).then((response) => {
                            resolve()
                        })
                }
                //if new cart created
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [productObj]
                }

                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })

    },

    //Helper for getting products in user cart //
    getProductsInCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()

            cartItems.count = cartItems.length
            resolve(cartItems)


        })
    },

    //Helper for changing quatity in ordere page
    changeProductQuantity: (details) => {

        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)
        console.log(details.count, details.quantity)
        return new Promise(async (resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }

                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }

                    }).then((response) => {
                        resolve({status:true})
                    })
            }

        }
        )
    },


    getTotalAmoutofAllProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id:null,
                        total: {$sum:{$multiply:['$quantity','$product.ProductPrice']}}
                    }
                }
            ]).toArray()
            resolve(total[0])
        })
    }
}