require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser'); // for pRSING THE INCOMING text data from forms
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session) // create a session with the user in the Db
const csrf = require('csurf'); // to prevent  csrf attacks ny passing csrf tokens into submission forms
const flash = require('connect-flash'); // to send messages before redirecting a page
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression')


const errorController = require('./controllers/error');
const User = require('./models/user')
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


const MONGODB_URI = process.env.DATABASE;

const store = mongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },

    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname)
    }

})

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {

        cb(null, false);
    }

}


const csrfProtection = csrf();
const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

// app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }))

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use((req, res, next) => {

    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then((user) => {
            // throw new Error("dummy")
            if (!user) {
                return next()
            }

            req.user = user;
            next()
        })
        .catch((err) => {

            next(new Error(err))

        })
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use('/500', errorController.get500)
app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose.connect(MONGODB_URI).then(() => {
    console.log("Database connected")

    app.listen(process.env.PORT || 3000);
}).catch((err) => {
    console.log(err)
})


// #00695c
//   "start": "SET NODE_ENV=production&SET MONGO_USER=zameeralucknowi& SET MONGO_PASSWORD=zameer2399& SET MONGO_DATABASE=shop& SET STRIPE_KEY=sk_test_tR3PYbcVNZZ796tH88S4VQ2u& node app.js",