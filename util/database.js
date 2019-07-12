const PRIVATE = require('./database.priv.js')

const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', PRIVATE.PASSWORD, {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;





//::::::::::::::::::::::::::::::
//::::::PRE-SEQUELIZE CODE::::::
//::::::::::::::::::::::::::::::

// const mysql = require('mysql2');
// const PRIVATE = require('./database.priv.js')

// //create pool instead of individual connections to DB each time there is a query
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: PRIVATE.PASSWORD
// });

// //use promise here to allow chaining after promise resolution
// module.exports = pool.promise();