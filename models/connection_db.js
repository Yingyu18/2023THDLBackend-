const fs = require("fs");
const config = require('../config/development_config');
const mariadb = require("mariadb");

const pool = mariadb.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    connectionLimit: 500,
    acquireTimeout: 300000

});

// const docuskyPool = mariadb.createPool({
//     host: config.mysql.host,
//     port: config.mysql.port,
//     user: config.mysql.user,
//     password: config.mysql.password,
//     database: config.mysql.databaseDocusky,
//     connectionLimit: 5
// });

module.exports = pool