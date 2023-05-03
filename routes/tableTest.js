var express = require('express');
var router = express.Router();
let tableFunc = require('../models/tableFunc');
let cleaner = require('../models/cleaners');
var fs = require('fs');

tableFunc = new tableFunc();
cleaner = new cleaner();




router.get('/', async function (req, res, next) {    
    var content = fs.readFileSync('./rawfiles/20230419123456789/root/101/tlcda_meta_2023-05-03.csv', 'utf-8');
    console.log(content);
      
});

module.exports = router;