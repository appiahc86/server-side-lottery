const config = require("./config");

const db = require('knex')({
    client: 'mysql',
    connection: {
        host : config.DB_HOST,
        port : 3306,
        user : config.DB_USER,
        password : config.DB_PASS,
        database : config.DB_NAME
    },
    pool: { min: 5, max: 30 }
});

module.exports = db;