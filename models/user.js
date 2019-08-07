const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true}
        }]
    }
});

//methods must be written like this, so that "this" keyword till refers to the Schema
userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    const updatedCart = {
      ...this.cart,
      items: [...this.cart.items]
    }
    if (cartProductIndex > -1) {
      updatedCart.items[cartProductIndex].quantity++;
    } else {
      updatedCart.items.push({productId: product._id, quantity: 1});
    }
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteItemFromCart = function(prodId) {
    const updatedCart = {
      ...this.cart,
      items: this.cart.items.filter(prod => {
        return prod.productId.toString() !== prodId.toString();
      })
    }
    this.cart = updatedCart;
    return this.save();
  }

userSchema.methods.clearCart = function() {
    this.cart.items = [];
    return this.save();
}

module.exports = mongoose.model('User', userSchema);


// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class User {
//   constructor(username, email, _id, cart) {
//     this.username = username;
//     this.email = email;
//     this._id = _id ? new mongodb.ObjectId(_id) : null;
//     this.cart = cart; // {items: []}        cart is object with items array of objects
//   }

//   save() {
//     const db = getDb();
//     return db.collection('users')
//       .insertOne(this)
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     const updatedCart = {
//       ...this.cart,
//       items: [...this.cart.items]
//     }
//     if (cartProductIndex > -1) {
//       updatedCart.items[cartProductIndex].quantity++;
//     } else {
//       updatedCart.items.push({productId: new mongodb.ObjectId(product._id), quantity: 1});
//     }
//     const db = getDb();
//     return db.collection('users')
//       .updateOne(
//         {_id: new mongodb.ObjectId(this._id)},
//         {$set: {cart: updatedCart}}
//     );    //$set completely overrides old cart with new cart
//   }

//   // static fetchAll() {
//   //   const db = getDb();
//   //   return db.collection('products')
//   //     .find()
//   //     //returns array of entire database, only use if you know it is a pretty small collection
//   //     .toArray()
//   //     .then(products => {
//   //       console.log(products);
//   //       return products;
//   //     })
//   //     .catch(err => {
//   //       console.log(err);
//   //     })
//   // }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(cp => {
//       return cp.productId;
//     })
//     //$in keyword returns any objects which have an id in specified array
//     return db.collection('products')
//       .find({_id: {$in: productIds}})
//       .toArray()
//       .then(products => {
//         return products.map(product => {
//           //using arrow functions allows the this here to still refer to overall class instead of creating new encapsulation
//           return {
//             ...product,
//             quantity: this.cart.items.find(i => {
//               return i.productId.toString() === product._id.toString();
//             }).quantity
//           };
//         });
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db.collection('users')
//       .find({_id: new mongodb.ObjectId(prodId)})
//       //get first element with next() -- only element in this case. can also use findOne
//       .next()
//       .then(user => {
//         console.log("FOUND USER", user);
//         return user;
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }

//   deleteItemFromCart(prodId) {
//     const updatedCart = {
//       ...this.cart,
//       items: this.cart.items.filter(prod => {
//         return prod.productId.toString() !== prodId.toString();
//       })
//     }
//     const db = getDb();
//     return db.collection('users')
//       .updateOne(
//         {_id: new mongodb.ObjectId(this._id)},
//         {$set: {cart: updatedCart}}
//       )    //$set completely overrides old cart with new cart
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: new mongodb.ObjectId(this._id),
//             name: this.username
//           }
//         };
//         return db.collection('orders').insertOne(order)
//       })
//       .then(result => {
//         //clean existing cart in server memory and in db
//         this.cart = {items: []};
//         return db.collection('users')
//           .updateOne(
//             {_id: new mongodb.ObjectId(this._id)},
//             {$set: {cart: this.cart}}
//           )    
//       })
    
    
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection('orders')
//       .find({'user._id': new mongodb.ObjectId(this._id)})
//       .toArray();
//   }

// }

// module.exports = User;