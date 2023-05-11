var express = require('express');
var router = express.Router();

let tableFunc = require('../models/tableFunc');
tableFunc = new tableFunc();

let handler = require('../controllers/fileConverter');
handler = new handler();

router.get('/', async function(req, res, next) {
    var id = req.body.file_id;
    var arr = await handler.jsonArr('whyWang', id);  
    var fname = await tableFunc.queryName(id);  
    res.send({"array": arr, "file_id": id, "file_name": fname});
});

module.exports = router;