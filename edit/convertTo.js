var express = require('express');
var router = express.Router();

let handler = require('../controllers/fileConverter');
handler = new handler();
router.get('/', async function(req, res, next) {
    var ids = [1, 2, 3, 4];
    var content = await handler.csv('whyWang', ids);
    console.log('content = ' + content);
    res.render('2darray', { table: content });
    //res.send(content);
    
});

module.exports = router;