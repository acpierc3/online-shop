const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, _id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = new mongodb.ObjectId(_id);
  }

  save() {
    const db = getDb();
    let dbOp;
    if(this._id) {
      dbOp = db.collection('products')
            //$set: this, could be written more verbosely, explicitly setting title: this.title and so on
        .updateOne({_id: this._id}, {$set: this})
    } else {
      dbOp = db.collection('products')
        .insertOne(this);
    }
    return dbOp
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      })
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
      .find()
      //returns array of entire database, only use if you know it is a pretty small collection
      .toArray()
      .then(products => {
        console.log(products);
        return products;
      })
      .catch(err => {
        console.log(err);
      })
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection('products')
      .find({_id: new mongodb.ObjectId(prodId)})
      .next()
      .then(product => {
        console.log("HERE YA PRODUCT",product);
        return product;
      })
      .catch(err => {
        console.log(err);
      })
  }

}

module.exports = Product;





























//::::::::::::::::::::::::::::::
//::::::PRE-SEQUELIZE CODE::::::
//::::::::::::::::::::::::::::::

// const db = require('../util/database');

// const Cart = require('./cart');

// module.exports = class Product {
//   constructor(id, title, imageUrl, description, price) {
//     this.id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }

//   save() {
//     //use question mark pattern here to avoid sql injection attacks
//     return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
//     [this.title, this.price, this.imageUrl, this.description]
//     );
//   }

//   static deleteById(id) {

//   }

//   static fetchAll() {
//     return db.execute('SELECT * FROM products');
//   }

//   static findById(id) {
//     return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
//   }

// };
