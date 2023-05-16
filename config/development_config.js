require('dotenv').config()

module.exports = {
    mysql: {
      host: process.env.HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      databaseDocusky:process.env.DATABASE_DOCUSKY,
      port: process.env.SQLPORT
    }
}