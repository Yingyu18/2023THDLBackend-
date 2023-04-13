var express = require('express');
var router = express.Router();


const pool = require('../models/connection_db');
console.log(pool);
router.get('/', async function (req, res, next) {
    console.log('im in');
    try {
        let conn = await pool.getConnection();
        console.log(conn);
        const sql2 = 'SELECT name FROM test_info Where id = 1';
        const rows = await conn.query(sql2); 
        console.log(rows); 
        res.end(JSON.stringify(rows));      
    }
    catch (error) {
        console.log(error);
    }
});

module.exports = router;
