const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
//multer handles multipart form data (uploading files)
const multer = require('multer');
//helmet adds secure headers to responses
const helmet = require('helmet');
//compresses assets, possibly not needed if hosting provider already does this
const compression = require('compression');
//morgan creates logs of requests/responses, this can also be done by hosting provider
const morgan = require('morgan');

const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const User = require('./models/user');
const PRIVATE = require('./util/database.priv.js');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@online-shop-dkmzb.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(helmet());
app.use(compression());
//will log all requests to this file stream
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    //this middleware automatically creates / reads cookies along with the session
    session({
        secret: PRIVATE.SESSION_SECRET, 
        resave: false, 
        saveUninitialized: false,
        store: store
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        if(!user) {
            return next();
        }
        //user here is full mongoose model object, including all helper methods
        req.user = user;
        next();
    })
    .catch(err => {
        //in async functions you must wrap errors in next() in order to work properly
        next(new Error(err));
    });
})

app.post('/create-order', isAuth, shopController.postOrder);

//csrf protection enabled only after create order / Stripe route
//because we dont need csrf protection for create-order,
//it is protected by Stripe
app.use(csrfProtection); 
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

//error handling middle ware takes 4 args
app.use((error, req, res, next) => {
    console.log(error)
    res.redirect('/500')
})

mongoose.connect(MONGODB_URI, { useNewUrlParser: true})
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));