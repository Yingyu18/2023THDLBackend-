var express = require('express');
var router = express.Router();


const handler = require('../controllers/fileConverter');
handler = new handler();
router.post('/', function(req, res, next) {
    var ids = req.body.file_ids;
    var content = handler.csv(ids);
    res.send(content);
    res.render(content);
});

module.exports = router;