const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const PRIVATE = require('./database.priv.js');
let _db;

//method for initial connection to database, will stay connected
const mongoConnect = callback => {
    MongoClient.connect(
        'mongodb+srv://node:' +PRIVATE.MONGO_PASSWORD +'@online-shop-dkmzb.mongodb.net/shop?retryWrites=true&w=majority',
        { useNewUrlParser: true }
    )
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback(client);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

//method to access already connected database
const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;