var express = require('express');
var router = express.Router();

const action = require('../models/csvConvert');

router.post('/', function(req, res, next) {
    var ids = req.body.file_ids;
    res.render('index', { title: 'Express' });
});

module.exports = router;
