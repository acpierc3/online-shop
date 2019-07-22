const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const PRIVATE = require('./database.priv.js')

MongoClient.connect('mongodb+srv://node:' +PRIVATE.MONGO_PASSWORD +'@online-shop-dkmzb.mongodb.net/test?retryWrites=true&w=majority');