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

const selectMapping = async (req, res) => {
    var fid = req.body.file_id;
    var uid = req.user.userID; console.log('uid = ' + uid);
    var PreSet = await model.getPreSet(uid, fid);
    res.status(200).send({"preset_heads" : PreSet}); 
    return ;
}

const savemap = async (req, res) => {
    var uid = req.user.userID;  
    var fid = req.body.file_id;
    var pid = req.body.json_id;
    var type = req.body.type;
    var result = req.body.map_res;
    var arr = await model.saveMap(fid, pid, type, result);    
    res.status(200).send('save success');
    return ;
    
}

const savePreSet = async (req, res) => {
    var uid = req.user.userID;  
    var fid = req.body.file_id;
    var pid = req.body.json_id;
    var type = req.body.type;
    var result = req.body.map_res;
    var pname = req.body.PreSetName;
    var arr = await model.savePreSet(fid, pid, type, result, pname);
    if (arr == 'dupe') {res.status(400).send('duplicate.');}  
    else {res.status(200).send('save success');}
    return ;
    
}

const delPreSet = async (req, res) => {
    var uid = req.user.userID;  
    var fid = req.body.file_id;
    var pname = req.body.PreSetName;
    if (pname == '系統預設') {
        res.status(400).send('禁止刪除系統預設設定');
        return ;
    }
    var arr = await model.delPreSet(fid, pname);     
    res.status(200).send('delete success');
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
    selectMapping,
    savemap,
    getmap,
    savePreSet,
    delPreSet,
    retrieveMapped,
    changeRow
};
