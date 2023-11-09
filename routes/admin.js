const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const { check, body } = require('express-validator');

const isAuth = require('../middleware/is-auth')


const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', isAuth, [
        body('title', 'must be text')
        .isString(),
        // body('imageUrl', 'should be a valid url')
        // .isURL(),

        body('price', 'only Numbers are allowed')
        .isNumeric(),
        body('description', 'must be text')
        .isString()
    ],
    adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, [
    body('title', 'must be text')
    .isString(),
    body('price', 'only Numbers are allowed')
    .isNumeric(),
    body('description', 'must be text')
    .isString()
], adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;