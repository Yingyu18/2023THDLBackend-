const fs = require('fs');
var express = require('express');
var router = express.Router();

const pool = require('../models/connection_db');

conn = pool.getConnection();
router.get('/', async function(req, res) {
    try {
        const sql = 'INSERT INTO test_info (name) VALUES = ?';
        await conn.query(sql, req.params.name);
        const sql2 = 'SELECT * FROM test_info WHERE name = ?';
        const rows = await conn.query(sql2, req.params.name);
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports = router;
