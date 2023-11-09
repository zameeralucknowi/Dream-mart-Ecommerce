const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const transport = require('nodemailer-brevo-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator')

const transporter = nodemailer.createTransport(
    new transport({
        apiKey: process.env.MAIL_KEY
    })
)

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'login',
        errorMessage: message,
        oldInput: { email: "", password: "" }

    })
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password }

        })

    }

    User.findOne({ email: email })
        .then(user => {

            if (!user) {

                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'login',
                    errorMessage: 'Invalid Email or Password  ',
                    oldInput: { email: email, password: password }

                })

            }

            bcrypt.compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save((err) => {

                            res.redirect('/')
                        })

                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'login',
                        errorMessage: 'Invalid Email or Password',
                        oldInput: { email: email, password: password }

                    })
                })
                .catch((err) => {
                    console.log(err);
                })

        })
        .catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);

        });
}


exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/')
    });

}

exports.getSignup = (req, res, next) => {
    let message = req.flash('err');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: { email: "", password: "", confirmPassword: "" }

    })
}

exports.postSignup = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password, confirmPassword: confirmPassword }

        })



    }

    bcrypt.hash(password, 12)
        .then((hashpassword) => {

            const user = new User({
                email: email,
                password: hashpassword,
                cart: { items: [] }

            })

            return user.save();
        })
        .then(() => {
            res.redirect('/login')
            return transporter.sendMail({
                to: email,
                from: ' "Dream Mart Shopping-Cart" <zameeralucknowi@gmail.com>',
                subject: 'SignUp Status',
                html: ' <h1> Your SignUp is SuccessFull <h1>',

            })
        })
        .catch(err => {

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);

        });

}

exports.getReset = (req, res, next) => {

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset',
        errorMessage: message

    })
}

exports.postReset = (req, res, next) => {

    const email = req.body.email;

    crypto.randomBytes(32, (err, buffer) => {

        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({ email: email }).then((user) => {

                if (!user) {
                    req.flash('error', 'No Account found with that Email');
                    return res.redirect('/reset')
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000

                return user.save();


            })
            .then((result) => {

                res.redirect('/')
                return transporter.sendMail({
                    to: email,
                    from: ' "Dream Mart Shopping-Cart" <zameeralucknowi@gmail.com>',
                    subject: 'Password Reset',
                    html: `<p1> You requested a Password Reset <p1>
                           <p1> Click this  <a href="http://localhost:3000/reset/${token}"> link</a>  to set a new Password  <p1>`,

                })

            })
            .catch(err => {

                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);

            });



    })



}


exports.getNewPassword = (req, res, next) => {

    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then((user) => {

            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token

            })

        })
        .catch(() => {

        })




}


exports.postNewPassword = (req, res, next) => {

    const password = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then((user) => {
            resetUser = user;
            return bcrypt.hash(password, 12)

        })
        .then((hashpassword) => {
            resetUser.password = hashpassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;

            return resetUser.save()

        })
        .then((result) => {
            res.redirect('/login')
        })
        .catch(() => {

        })

}