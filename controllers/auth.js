const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {

    User.findById('5d431da60f54ac4e98c52383')
    .then(user => {
        //user here is full mongoose model object, including all helper methods.
        req.session.isLoggedIn = true;
        req.session.user = user;
        //normally dont need to save session, but this allows us to add callback function so we are only redirected once session has been stored in DB (prevents potential race conditions)
        req.session.save(err => {
            console.log(err);
            res.redirect('/');
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