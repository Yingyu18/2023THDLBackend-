var express = require('express');
var router = express.Router();
let tableFunc = require('../models/tableFunc');
tableFunc = new tableFunc();

let handler = require('../controllers/fileConverter');
handler = new handler();

let jModel = require('../models/json_model');
jModel = new jModel();

const bodyParser = require('body-parser')

const {
    authentication
  } = require('../util/util')

router.post('/goToEdit', bodyParser.json(), authentication, async function(req, res) {
    var pid = req.body.project_id;
    var content = await handler.retrieve2D(pid);
    if (content.error) {
        res.status(400).send(content.error);
        return ;
    }
    else {
        res.status(200).send(content);
        return ;
    }
});

router.post('/getTags', bodyParser.json(), authentication, async function(req, res) {
    var pid = req.body.project_id;
    var content = await handler.getTags(pid);
    console.log('ttttttttlog' + content);    
    res.status(200).send(content);
    return ;
    
});

router.post('/saveTags', bodyParser.json(), authentication, async function(req, res) {
    var pid = req.body.project_id;
    var tag = req.body.tags;
    var content = await handler.saveTags(pid, tag);
    if (content.error) {
        res.status(400).send(content.error);
        return ;
    }
    else {
        res.status(200).send('tag save success!');
        return ;
    }
});


router.post('/appendNew',bodyParser.json(), authentication, async function(req, res) {
    var fid = req.body.file_id;
    var pid = req.body.project_id;
    var content = await handler.append(fid, pid);
    res.status(200).send(content);
    return ;
})

router.post('/buildDB', bodyParser.json(), authentication, async function(req, res) {
    const userId = req.user.userId;
    const email = req.user.email;
    const username = req.user.name;
    var DBname = req.body.DBname;
    var pid = req.body.Json_id;
    var content = req.body.content;
    var js = await jModel.toJson(content);
    let saveREs = await tableFunc.simplesaveJson(js, pid);
    var result = await handler.buildXml(js, DBname, pid, userId, email, username);
    res.status(200).send(result);
    return ;
})

module.exports = router;