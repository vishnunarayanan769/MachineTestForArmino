var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper')
const commonHelper = require('../helpers/common-helper');
const { response } = require('express');
/* GET users listing. */
router.get('/',function(req, res) {
  let user=req.session
  commonHelper.getAllProducts().then((products) => {
    res.render('user/home', { products,user});
  })
});

/* Route for navigating to order screen on selecting "Order" in nav bar */
router.get('/orders',verifyUser, async(req, res) => {

  let user=req.session
  let allProducts=await commonHelper.getAllProducts()
  let products=await userHelper.getProductsInCart(req.session.user._id)

    res.render('user/orders',{products,allProducts,user,userID:req.session.user._id})
  
});


// Route for "Add to cart"/"Increasing quantity in order page" START //

router.get('/add-to-cart/:id',(req,res)=>{

  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })

})

router.post('/change-product-quantity', (req,res)=>{

  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelper.getTotalAmoutofAllProduct(req.session.user._id)
    res.json(response)
  })
  
})

// Route for "Add to cart"/"Increasing quantity in order page" END //






/* -------User Login/Logout routing START--------*/


router.get('/create-account', (req, res, next) => {
  res.render('user/create-account')
})

router.get('/login', (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login')
  }
})

/*Route for logging-out **Here session is destroyed** */
router.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.clearCookie()
  res.redirect('/')
})

/*Route for creating new account for users */
router.post('/create-account', (req, res, next) => {
  userHelper.addUser(req.body).then((userResponse) => {
    res.redirect('/');
  })
})

/* Route for loging-in **Here create the session** */
router.post('/loginuser', (req, res, next) => {
  userHelper.userLogin(req.body).then((loginResponse) => {
    if (loginResponse.status) {
      req.session.loggedIn = true
      req.session.adminLoggedIn=false
      req.session.user = loginResponse.user
      res.redirect('/');
    } else {
      res.redirect('/login');
    }

  })
})

/*Common function to verify user is logged in or not */
function verifyUser(req,res,next){
  if(req.session.loggedIn){
    next();
  }else{
    res.redirect('/login')
  }
}

/* ---------User Login/Logout routing END------------- */








module.exports = router;
