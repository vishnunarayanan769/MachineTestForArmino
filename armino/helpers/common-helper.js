var db=require('../databaseConfig/connection')
var collections=require('../databaseConfig/collections')

module.exports ={

    /* Get all products Admin added in database */
    getAllProducts:()=>{
        return new Promise(async (resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    
}