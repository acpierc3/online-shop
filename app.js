const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            //returns sequelize user object, complete with utility methods like destroy()
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//define RELATIONS in models / db
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
//the two above relations are redundant because they go both ways, you can use either - or
User.hasOne(Cart);
Cart.belongsTo(User);
//many to many relationship needs intermediary table defined
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
//
Order.belongsTo(User);
User.hasMany(Order);
//
Order.belongsToMany(Product, {through: OrderItem});
// Product.belongsToMany(Order, {through: OrderItem});


sequelize
//  .sync({force: true})
    .sync()
    .then(res => {
        return User.findByPk(1);
    })
    .then(user => {
        if(!user) {
            return User.create({name:'Adam', email:'test@test.com'})
        }
        return user;
    })
    .then(user => {
        // console.log(user)
        return user.createCart();
    })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });