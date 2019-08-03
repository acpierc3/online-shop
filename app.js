const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const errorController = require('./controllers/error');
const User = require('./models/user');
const PRIVATE = require('./util/database.priv.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({secret: PRIVATE.SESSION_SECRET, resave: false, saveUninitialized: false})
);

app.use((req, res, next) => {
    User.findById('5d431da60f54ac4e98c52383')
        .then(user => {
            //user here is full mongoose model object, including all helper methods
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://node:' +PRIVATE.MONGO_PASSWORD +'@online-shop-dkmzb.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        User.findOne()
            .then(user => {
                if(!user) {
                    const user = new User({
                        name: 'Adam',
                        email: 'adam@test.com',
                        cart: {
                            items: []
                        }
                    })
                    user.save();
                }
            });
        app.listen(3000);
    })
    .catch(err => console.log(err));