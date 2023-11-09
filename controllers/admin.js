const Product = require('../models/product');
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose')
const { validationResult } = require('express-validator')
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        errorMessage: null,
        hasError: false


    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    if (!image) {

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: 'Attached file is not an image',
            product: {
                title: title,
                price: price,
                description: description

            }

        });

    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: title,
                price: price,
                imageUrl: imageUrl,
                description: description

            }

        });
    }

    const imageUrl = image.path;

    const product = new Product({

        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.session.user._id
    });

    product.save()
        .then(result => {
            // console.log(result);
            console.log('Created Product');
            return res.redirect('/admin/products');
        })
        .catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);

        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                hasError: false,
                errorMessage: null,
                product: product

            });
        })
        .catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);

        });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId

            }

        });



    }

    Product.findById(prodId)
        .then((product) => {

            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }

            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            if (image) {
                fileHelper.deleteFile(product.imageUrl)
                product.imageUrl = image.path;
            }
            return product.save()
                .then(result => {
                    console.log('UPDATED PRODUCT!');
                    res.redirect('/admin/products');
                })
        }).catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);

        });


};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'

            });
        })
        .catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);

        });
};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId).then((product) => {

            if (!product) {
                return next(new Error("no product found"))
            }

            //----- for deleting in wishlist also
            fileHelper.deleteFile(product.imageUrl);

            req.user.clearWishlist(product);

            return Product.deleteOne({ _id: prodId, userId: req.user._id })

        })
        .then(() => {
            res.status(200).json({ message: "Success!" })
        })
        .catch(err => {

            res.status(500).json({ message: "Deleting product Failed" })

        });



};