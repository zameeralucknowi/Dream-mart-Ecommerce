const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth')

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// // regex
router.get('/products/:productId([0-9a-fA-F]{24})', isAuth, shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);
router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess);
router.get('/checkout/cancel', isAuth, shopController.getCheckout);


router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/addTo-wishlist/:productId', isAuth, shopController.addToWishlist);

router.get('/wishlist', isAuth, shopController.getWishlist);

router.delete('/deleteFromWishlist/:productId', isAuth, shopController.deleteProductFromWishlist);


module.exports = router;