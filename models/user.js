const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
  constructor(username, email, _id) {
    this.username = username;
    this.email = email;
    this._id = _id ? new mongodb.ObjectId(_id) : null;
  }

  save() {
    const db = getDb();
    return db.collection('users')
      .insertOne(this)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      })
  }

  // static fetchAll() {
  //   const db = getDb();
  //   return db.collection('products')
  //     .find()
  //     //returns array of entire database, only use if you know it is a pretty small collection
  //     .toArray()
  //     .then(products => {
  //       console.log(products);
  //       return products;
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     })
  // }

  static findById(prodId) {
    const db = getDb();
    return db.collection('users')
      .find({_id: new mongodb.ObjectId(prodId)})
      //get first element with next() -- only element in this case. can also use findOne
      .next()
      .then(user => {
        console.log("FOUND USER", user);
        return user;
      })
      .catch(err => {
        console.log(err);
      })
  }

  // static deleteById(prodId) {
  //   const db = getDb();
  //   return db.collection('products')
  //     .deleteOne({_id: new mongodb.ObjectId(prodId)})
  //     .then(result => {
  //       console.log(result);
  //       return result;
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     })
  // }

}

module.exports = User;