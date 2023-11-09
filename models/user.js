const mongoose = require('mongoose');
const Product = require('./product')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    resetToken: String,
    resetTokenExpiration: Date,

    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    },

    wishlist: {
        items: [{
            productIds: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                reruired: true
            }
        }]
    }

})

userSchema.methods.clearCart = function() {
    this.cart = { items: [] }

    return this.save();
}

userSchema.methods.addToCart = function(product) {


    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    })

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({ productId: product._id, quantity: newQuantity })
    }

    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart;
    return this.save();



}

userSchema.methods.removeFromCart = function(productId) {

    const updatedCartItems = this.cart.items.filter(p => {
        return p.productId.toString() !== productId.toString();
    })

    this.cart.items = updatedCartItems;

    return this.save();

}

userSchema.methods.addWish = function(product) {

    const wishlistProducts = [...this.wishlist.items];
    const productIndex = wishlistProducts.findIndex(p => {
        return p.productIds._id.toString() === product._id.toString();
    })

    if (productIndex >= 0) {
        console.log(" product already exists")
    } else {

        wishlistProducts.push({ productIds: product._id });

        const updatedWishlist = { items: wishlistProducts };
        this.wishlist = updatedWishlist;

    }

    return this.save();

}


userSchema.methods.clearWishlist = function(product) {

    const updatedWishlist = this.wishlist.items.filter(p => {
        return p.productIds._id.toString() !== product._id.toString();
    })

    this.wishlist.items = updatedWishlist;

    return this.save();

}

module.exports = mongoose.model('User', userSchema);

// const ObjectId = require('mongodb').ObjectId;
// const getDb = require('../util/database').getDb;

// class User {
//     constructor(userName, email, cart, id) {
//         this.name = userName;
//         this.email = email;
//         this.cart = cart || { items: [] }
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection("users").insertOne(this);
//     }

//     addToCart(product) {

//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         })

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity })
//         }

//         const updatedCart = { items: updatedCartItems }
//         const db = getDb();
//         return db.collection("users").updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } })
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection("users").findOne({ _id: new ObjectId(userId) })
//     }



//     getCart() {

//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         })

//         return db.collection("products").find({ _id: { $in: productIds } }).toArray().then(products => {
//             return products.map(p => {
//                 return {...p,
//                     quantity: this.cart.items.find(i => {
//                         return i.productId.toString() === p._id.toString()
//                     }).quantity
//                 }
//             })
//         })
//     }

//     deleteProductFromCart(productId) {
//         const updatedCart = this.cart.items.filter(p => {
//             return p.productId.toString() !== productId.toString();
//         })

//         const db = getDb();
//         return db.collection("users").updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: updatedCart } } })

//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new ObjectId(this._id),
//                         name: this.name
//                     }
//                 }
//                 return db.collection("orders").insertOne(order)
//             })
//             .then((result) => {
//                 this.cart = { items: [] };
//                 return db.collection("users").updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: [] } } })
//             })

//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection("orders").find({ 'user._id': new ObjectId(this._id) }).toArray();
//     }



// }
// module.exports = User;