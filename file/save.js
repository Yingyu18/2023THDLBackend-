var express = require('express');

let jModel = require('../models/json_model');

let tableFunc = require('../models/tableFunc');
tableFunc = new tableFunc();

let handler = require('../controllers/fileConverter');
handler = new handler();



const save = async function(req, res, next) {
    var uid = req.user.userID;
    var uname = req.user.name;
    var fid = req.body.file_id;
    var fname = req.body.file_name;
    var arr = req.body.arr;
    if (fid == null) {fid = -1;}
    var js = jModel.toJson(arr);
    let res = tableFunc.saveJson(js, uid, uname, fid, fname);    
    res.status(200).send(res);
};

module.exports = {
    save,
};