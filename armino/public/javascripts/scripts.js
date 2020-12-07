$(document).ready(function () {
    $(".owl-carousel").owlCarousel();
  });



function addToCart(productID){
        $.ajax({
          url:'/add-to-cart/'+productID,
          method:'get',
          success:(response)=>{
              alert(response)
          }
        })
}
function changeQuantity(cartID,productID,count,userID){

  let quantity=parseInt(document.getElementById(productID).innerHTML)

    $.ajax({
      url:'/change-product-quantity',
      data:{
        user:userID,
        cart:cartID,
        product:productID,
        count:count,
        quantity:quantity
      },
      method:'post',
      success:(response)=>{
        if(response.removeProduct){
          alert("Product removed from cart")
          location.reload()
        }else{
          console.log(response)
          document.getElementById(productID).innerHTML=quantity+count
          document.getElementById('total').innerHTML=response.total.total
        }
    }
    })
}