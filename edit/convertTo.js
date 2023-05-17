var express = require('express');
var router = express.Router();


let handler = require('../controllers/fileConverter');
handler = new handler();

router.post('/convertTo', async function(req, res, next) {
    var ids = req.body.file_ids;
    var content = await handler.csv(ids);
    res.render('2darray', { table: content });
    //res.send(content);
});

module.exports = router;