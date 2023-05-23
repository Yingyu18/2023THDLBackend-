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
    if (jModel.needMapCheck(pid) == 1) {
        res.status(400).send({"error": 'mapping were already completed.'});
        return;
    }
    var result = model.csvFilter(pid);
    res.status(200).send(result);   
    return ; 
}

const fileMapping = async (req, res) => {
    var fid = req.body.file_id;
    var pid = req.body.project_id;
    var type = req.body.type;
    var m_head;

    if (type == 1) {
        if (cModel.firstMapCheck(fid)){
            res.status(400).send({"error": 'mapping were already completed.'});
            return ;
        }
        else {m_head = cModel.core[0];}
    }
    else {
        if (cModel.secondMapCheck(fid, pid)){
            res.status(400).send({"error": 'mapping were already completed.'});
            return ;
        }
        else {m_head = tableFunc.getJsonHead(pid, 1);}
    }
   
   res.status(200).send({
        "file_id": fid,
        "file_head": tableFunc.getHead(fid),
        "map_head": m_head,
    }); 
    return ;
}

const savemap = async (req, res) => {
    var uid = req.user.userID;  
    var fid = req.body.file_id;
    var pid = req.body.json_id;
    var type = req.body.type;
    var res = req.body.map_res;
    var fin = req.body.finish;
    var arr = model.saveMap(fid, pid, type, fin, res);
    if (arr.error) {
        res.status(400).send({message: arr.error});
        return ;
    }
    else {
        res.status(200).send('save success');
        return ;
    }
}
const getmap = async (req, res) => {    
    var uid = req.user.userID;
    var fid = req.body.file_id;
    var type = req.body.type;
    var pid = req.body.json_id;
    var arr = type == 1 ? tableFunc.getMap(fid) : tableFunc.getSecMap(fid, pid);
    res.status(200).send({"map": arr});
    return ;
}

const retrieveMapped = async (req, res) => {    
    var pid = req.body.project_id;
    res.status(200).send(tableFunc.getIsMap(pid));
}
module.exports = {
    projectMapping,
    fileMapping,
    savemap,
    getmap,
    retrieveMapped
};
