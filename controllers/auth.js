const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const {validationResult} = require('express-validator')

const User = require('../models/user');
const PRIVATE = require('../util/database.priv.js');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: PRIVATE.SENDGRID_API_KEY
    }
}));

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error')[0],
        oldInput: {
            email: "", 
            password: ""
        },
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error')[0],
        oldInput: {
            email: "", 
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    });
};


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        //don't want to redirect if validation fails, want to return to same page
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email, 
                password: password
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: {
                    email: email, 
                    password: password
                },
                validationErrors: []
            });
        }
        bcrypt.compare(password, user.password)
            .then(matching => {
                if(matching) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect('/');
                    })
                }
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email, 
                        password: password
                    },
                    validationErrors: []
                });
            })
            .catch(err => {
                console.log(err);
                res.redirect('/login');
            });
        
        
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        //don't want to redirect if validation fails, want to return to same page
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email, 
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }
    //we know that user / password are good at this point because we've already checked 
    //in the middleware before this function
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: {items: []}
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'shop@node.com',
                subject: 'Your New Account!',
                html: '<h1>You successfully signed up!</h1>'
            })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/');
    })
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error')[0]
    });
}

exports.postReset = (req, res, next) => {

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found.');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            if(result) {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'shop@node.com',
                    subject: 'Password Reset Requested!',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    `
                })
            }
        })
        .catch(err => console.log(err));
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: req.flash('error')[0],
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
    // console.log("POST NEW PASSWORD")
    let storeUser;

    User.findOne({
        resetToken: req.body.passwordToken, 
        resetTokenExpiration: {$gt: Date.now()},
        _id: req.body.userId
    })
    .then(user => {
        if (!user) {
            req.flash('error', 'No account with that email found.');
            return res.redirect('/reset');
        }
        storeUser = user;
        return bcrypt.hash(req.body.password, 12)
    })
    .then(hashedPassword => {
        storeUser.password = hashedPassword;
        storeUser.resetToken = undefined;
        storeUser.resetTokenExpiration = undefined;
        return storeUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => console.log(err));
}