var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/admin-helper')

/*Home page loading for Admin */
router.get('/', function (req, res, next) {
    res.render('admin/add-products');
});

/*Adding products from Admin page */
router.post('/add-product', (req, res) => {
 productHelper.addProduct(req.body, (id) => {
     let image=req.files.ProductImage
     console.log(image.name)
     image.mv('./public/images/product-image/'+id+'.jpg',(err,done)=>{
         if(!err){
            res.redirect('/admin');
         }else{
             console.log(err)
         }
     })
        
    })
})


module.exports = router;
