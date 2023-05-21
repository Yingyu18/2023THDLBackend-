var express = require('express');
var router = express.Router();
let tableFunc = require('../models/tableFunc');
tableFunc = new tableFunc();

let handler = require('../controllers/fileConverter');
handler = new handler();

const {
    authentication
  } = require('../util/util')


router.post('/convertTo', authentication, async function(req, res) {
    var ids = req.body.file_ids;
    var content = await handler.csv(ids);
    res.status(200).send(content);
});

router.post('/openJson', authentication, async function(req, res) {
    var id = req.body.file_id;
    var arr = await handler.jsonArr(id);  
    var fname = await tableFunc.queryName(id);  
    res.status(200).send({"array": arr, "file_id": id, "file_name": fname});
});

router.post('/appendNew', authentication, async function(req, res) {
    var Token = req.body.Token;
    var id = req.body.file_id
    var jid = req.body.json_id
    var jhead = req.body.json_head
    var content = await handler.append(id, jid, jhead);
    res.status(200).send(content);
})

router.post('/buildDB', async function(req, res) {
    
    var DBname = req.body.DBname;
    var content = req.body.content;
    var res = await handler.xml(content, DBname);
    res.status(200).send(res);
})

module.exports = router;