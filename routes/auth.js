const express = require('express');

const authController = require('../controllers/auth')

const User = require('../models/user')

const { check, body } = require('express-validator');

const router = express.Router();

router.get('/login', authController.getLogin)

router.post('/login', [
    body('email', 'Please enter a valid Email address'),
    body('password', 'password should be valid').isAlphanumeric().isLength({ min: 6 })

], authController.postLogin)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup)

router.post('/signup', [
    check('email')
    .isEmail()
    .withMessage('Please enter a valid Email')
    .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {

            if (userDoc) {
                return Promise.reject("Email already exists")
            }
        })

    })
    .normalizeEmail(),
    body('password', 'Password must be atleast 6 characters ')
    .isAlphanumeric()
    .isLength({ min: 6, max: 10 })
    .trim(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password should  be matched');
        }

        return true;
    })
    .trim()

], authController.postSignup)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)

module.exports = router;