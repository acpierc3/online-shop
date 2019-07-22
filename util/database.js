const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const PRIVATE = require('./database.priv.js')

const mongoConnect = callback => {
    MongoClient.connect(
        'mongodb+srv://node:' +PRIVATE.MONGO_PASSWORD +'@online-shop-dkmzb.mongodb.net/test?retryWrites=true&w=majority'
    )
        .then(client => {
            console.log('Connected!');
            callback(client);
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = mongoConnect;