const express = require('express'), bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'DocuSky System User',
    password: 'thdl',
    database: 'test',
    connectionLimit: 5
});
