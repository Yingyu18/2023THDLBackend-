let model = require('../models/map_model');
const tableFunc = require('../models/tableFunc');
const jModel = require('../models/json_model');

const projectMapping = async (req, res) =>{
    var pid = req.body.project_id;
    if (jModel.needMapCheck(pid)) {res.status(400).send({"error": 'mapping were already completed.'});}
    var result = model.csvFilter(pid);
    var cnt = 0;
    var temprow;
    ids.forEach(element => {
        temprow = model.getColInfo(element, rowidxs[cnt]);
        if (temprow.error) {
            res.status(400).send({"message": '上傳時指定錯誤列數，標題列為空。'})
        }
        else {
            arr.push(temprow);
            cnt++;
        }
    });
    res.status(200).send({
        "file_ids": "Array <int>",
        "project_id": pid,
        "file_heads": "Array<Array <String>>",
        "map_head": "Array <String>",
        "type" : "int"
      });
    
}

const fileMapping = async (req, res) => {
    var id = req.body.file_id;
    var jid = req.body.json_id;
    var jhead = req.body.json_head;
    var rowidx = tableFunc.getRowInfo([id]);
    var arr = model.getColInfo(id, rowidx);
    if (arr.error) {
        res.status(400).send({"message": '上傳時指定錯誤列數，標題列為空。'})
    }
    else {res.status(200).send({
        json_head: jhead,
        file_head: arr,
        json_id: jid,
    });}
}

const savemap = async (req, res) => {    
    var id = req.body.file_id;
    var type = req.body.type;
    var res = req.body.map_res;
    var fin = req.body.finish;
    var arr = model.saveMap(id, jid, type, fin, res);
    if (arr.error) {
        res.status(400).send({message: arr.error})
    }
    else {res.status(200).send({
        jid: req.body.json_id,
        next: fin,
        array: arr
    });}
}
const getmap = async (req, res) => {    
    var id = req.body.file_id;
    var type = req.body.type;
    var res = req.body.map_res;
    var fin = req.body.finish;
    var arr = model.saveMap(id, jid, type, fin, res);
    if (arr.error) {
        res.status(400).send({message: arr.error})
    }
    else {res.status(200).send({
        jid: req.body.json_id,
        next: fin,
        array: arr
    });}
}

module.exports = {
    projectMapping,
    fileMapping,
    savemap,
    getmap
};
