var express = require('express');
var router = express.Router();

let tableFunc = require('../models/tableFunc');
tableFunc = new tableFunc();

let handler = require('../controllers/fileConverter');
handler = new handler();


router.get('/', async function(req, res, next) {
    var id = req.body.file_id;
    var fname = req.body.file_name;
    var arr = req.body.arr;
    var fd = req.body.folder;
    var token = req.body.Token;
    var resBody;
    if (id == null) {id = '';}
    var js = await handler.json(arr);
    resBody = tableFunc.saveJson(js, uid, id, fname, fd);
    res.send(resBody);
});

module.exports = router;