var express = require('express');
var router = express.Router();
let tableFunc = require('../models/tableFunc');
tableFunc = new tableFunc();

let handler = require('../controllers/fileConverter');
handler = new handler();

const {
    authentication
  } = require('../util/util')


router.post('/goToEdit', authentication, async function(req, res) {
    const userId = req.user.userId;
    var pid = req.body.project_id;
    var content = await handler.retrieve2D(pid);
    if (content.error) {res.status(400).send(content.error);}
    else {res.status(200).send(content);}
});


router.post('/appendNew', authentication, async function(req, res) {
    const userId = req.user.userId;
    var fid = req.body.file_id;
    var pid = req.body.project_id;
    var content = await handler.append(fid, pid);
    res.status(200).send(content);
})

router.post('/buildDB', async function(req, res) {
    const userId = req.user.userId;
    var DBname = req.body.DBname;
    var pid = req.body.Json_id;
    var content = req.body.content;
    var res = await handler.buildXml(content, DBname, pid, userId);
    res.status(200).send(res);
})

module.exports = router;