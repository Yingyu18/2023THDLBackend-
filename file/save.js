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
    var resBody;
    if (id == null) {id = '';}
    var js = await handler.json(arr);
    if (js) {res.status(200).send("save sucess, filename = " + fname +'\n content: \n' + js);}
    else {res.status(200).send("save fail");}
});

module.exports = router;