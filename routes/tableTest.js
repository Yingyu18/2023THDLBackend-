var express = require('express');
var router = express.Router();
let tableFunc = require('../models/tableFunc');
let cleaner = require('../models/cleaners');
var fs = require('fs');

tableFunc = new tableFunc();
cleaner = new cleaner();




router.get('/', async function (req, res, next) {    
    
    tableFunc.insertFile('whyWang', 'AHTWH_export_20230321224152.csv', 'test', content);
    
});

module.exports = router;