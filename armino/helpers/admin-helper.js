var db=require('../databaseConfig/connection')
var collections=require('../databaseConfig/collections')

module.exports ={

    addProduct:(product,callback)=>{
        db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })
    },

}