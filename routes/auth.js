// const path = require('path');

const express = require('express');
const {check, body} = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/login', 
    [
        check('email').isEmail().withMessage('Please enter a valid email'),
        body('password', 'Password is invalid').isLength({min: 5}).isAlphanumeric()
    ],
    authController.postLogin);

//check function validates email html field. will store errors in an object and pass them along
router.post('/signup', 
    [
        check('email').isEmail().withMessage('Please enter a valid email').custom((value, {req}) => {
            //custom() function checks for returned true/false, thrwn error, or a promise.
            //using a promise allows for async validation
            return User.findOne({email: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email exists already.');
                }
            })
        }),
        body('password', 'Passowrd should be more than 5 characters and only alphanumeric').isLength({min: 5}).isAlphanumeric(),
        body('confirmPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
    ], authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
