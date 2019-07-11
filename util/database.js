const mysql = require('mysql2');
const PASSWORD = require('./database.priv')

//create pool instead of individual connections to DB each time there is a query
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: PASSWORD
});

module.exports = pool.promise();