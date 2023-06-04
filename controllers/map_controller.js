let model = require('../models/map_model');
let tableFunc = require('../models/tableFunc');
let jModel = require('../models/json_model');
let cModel = require('../models/csv_model');
jModel = new jModel();
cModel = new cModel();
tableFunc = new tableFunc();
model = new model();

const projectMapping = async (req, res) =>{
    var pid = req.body.project_id;
    let ck = await jModel.needMapCheck(pid)
    if (ck == 1) {
        res.status(400).send({"error": 'mapping were already completed.'});
        return;
    }
    var result = await model.csvFilter(pid);
    res.status(200).json(result).send();   
    return ; 
}

const fileMapping = async (req, res) => {
    var fid = req.body.file_id;
    var pid = req.body.project_id;
    var type = req.body.type;
    var m_head;
    let ck;
    if (type == 1) {
        ck = await cModel.firstMapCheck(fid);
        if (ck){
            res.status(400).send({"error": 'mapping were already completed.'});
            return ;
        }
        else {m_head = ['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
        '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
        '相關組織', '關鍵詞', '摘要/全文'];}
    }
    else {
        ck = await cModel.secondMapCheck(fid);
        if (ck){
            res.status(400).send({"error": 'mapping were already completed.'});
            return ;
        }
        else {m_head = await tableFunc.getJsonHead(pid, 1);}
    }
    var fhead = await tableFunc.getHead(fid);
   res.status(200).send({
        "file_id": fid,
        "file_head": fhead,
        "map_head": m_head,
    }); 
    return ;
}

const savemap = async (req, res) => {
    var uid = req.user.userID;  
    var fid = req.body.file_id;
    var pid = req.body.json_id;
    var type = req.body.type;
    var result = req.body.map_res;
    var fin = req.body.finish;
    var arr = await model.saveMap(fid, pid, type, fin, result);    
    res.status(200).send('save success');
    return ;
    
}
const getmap = async (req, res) => {    
    var uid = req.user.userID;
    var fid = req.body.file_id;
    var type = req.body.type;
    var pid = req.body.json_id;
    var arr = type == 1 ? await tableFunc.getMap(fid) : await tableFunc.getSecMap(fid, pid);
    res.status(200).send({"map": arr});
    return ;
}

const retrieveMapped = async (req, res) => {    
    var pid = req.body.project_id;
    var result = await tableFunc.getIsMap(pid);
    res.status(200).send({"is_mapped" : result});
}
const changeRow = async(req, res) => {
    var fid = req.body.file_id;
    var srow = req.body.start_row;
    var result = await model.changeRow(fid, srow);
    if (result.error) {res.status(400).send(result);} 
    else {res.status(200).send(result);}
}
module.exports = {
    projectMapping,
    fileMapping,
    savemap,
    getmap,
    retrieveMapped,
    changeRow
};
