const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');
const PRIVATE = require('./util/database.priv.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5d389abb29cbd416ec3cfcf3')
        .then(user => {
            req.user = new User(user.name, user.email, user._id, user.cart);
            next();
        })
        .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://node:' +PRIVATE.MONGO_PASSWORD +'@online-shop-dkmzb.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));