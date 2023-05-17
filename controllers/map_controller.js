let model = require('../models/map_model');
const tableFunc = require('../models/tableFunc');

const firstMapping = async (req, res) =>{
    var {ids} = req.body.file_ids;
    var rowidxs = tableFunc.getRowInfo(ids);
    var arr = new Array();
    var cnt = 0;
    var temprow;
    ids.forEach(element => {
        temprow = model.getColInfo(element, rowidxs[cnt]);
        if (temprow.error) {
            res.status(400).send({message: '上傳時指定錯誤列數，標題列為空。'})
        }
        else {
            arr.push(temprow);
            cnt++;
        }
    });
    res.status(200).send(arr);
}

const secondMapping = async (req, res) => {
    var id = req.body.file_id;
    var jid = req.body.json_id;
    var jhead = req.body.json_head;
    var rowidx = tableFunc.getRowInfo([id]);
    var arr = model.getColInfo(id, rowidx);
    if (arr.error) {
        res.status(400).send({message: '上傳時指定錯誤列數，標題列為空。'})
    }
    else {res.status(200).send({
        json_head: jhead,
        file_head: arr,
        json_id: jid,
    });}
}

const saveMapping = async (req, res) => {    
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
    firstMapping,
    secondMapping,
    saveMapping
};
