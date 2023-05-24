var express = require('express');

let jModel = require('../models/json_model');
jModel = new jModel();

let tableFunc = require('../models/tableFunc');
tableFunc = new tableFunc();

let handler = require('../controllers/fileConverter');
handler = new handler();



const saveJson = async function(req, res, next) {
    var uid = req.user.userID;
    var uname = req.user.name;
    var fid = req.body.file_id;
    var fname = req.body.file_name;
    var newSave = req.body.new_save;
    var arr = req.body.arr;
    var js = await jModel.toJson(arr);
    let result = await tableFunc.saveJson(js, uid, uname, fid, fname, newSave);    
    res.status(200).send(result);
};

module.exports = {
    saveJson,
};