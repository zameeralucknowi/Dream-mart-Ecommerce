// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

// let _db;

// const mongoConnect = (callback) => {
//     MongoClient.connect('mongodb+srv://zameeralucknowi:zameer2399@cluster0.y0t25ex.mongodb.net/shop?retryWrites=true&w=majority')
//         .then((client) => {
//             console.log("Database Connected!")
//             _db = client.db();
//             callback();

//         }).catch((err) => {
//             console.log(err);
//             throw err
//         })
// }

// const getDb = () => {
//     if (_db) {
//         return _db;
//     }

//     throw 'no database found!'
// }

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;