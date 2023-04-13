
const config = require('../config/development_config');
const mariadb = require("mariadb");


const pool = mariadb.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    connectionLimit: 5
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('connection to database failed.');  
  }
  if (connection) {
    connection.release();
  }

  return;
})

module.exports = pool;