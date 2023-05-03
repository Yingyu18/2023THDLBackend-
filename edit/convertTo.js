var express = require('express');
var router = express.Router();


const handler = require('../controllers/fileConverter');
handler = new handler();
<<<<<<< HEAD
router.post('/', function(req, res, next) {
    var ids = req.body.file_ids;
    var content = handler.csv(ids);
    res.send(content);
    res.render(content);
=======
router.get('/', async function(req, res, next) {
    var ids = [1, 2, 3, 5];
    var content = await handler.csv('whyWang', ids);
    res.render('2darray', { table: content });
    //res.send(content);
    
>>>>>>> 0ab7f5664011670e1f5f31e036b20815ef4c9d74
});

module.exports = router;