require('dotenv').config();
const pool = require('./connection_db');
let tbfunc = require('./tableFunc');
let cleaner = require('./cleaners');
let cModel = require('./csv_model');
let jModel = require('./json_model');
tbfunc = new tbfunc();
cleaner = new cleaner();
cModel = new cModel();
jModel = new jModel();

class mapModel {
     core = ['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
    '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
    '相關組織', '關鍵詞', '摘要/全文'];

    saveMap = async (fid, jid, type, fin, res) => {
        var idx = await tbfunc.getRowId(fid);
        var result = 'save success';
        let tmp;
        try {
            let conn = await pool.getConnection();
            let sql;
            let rs;        
            if (type == 1) { 
                sql = "UPDATE file_DB SET map = ? WHERE fileID = ?";
                console.log('type = ' + type + 'res = ' + res + 'tostring = ' + res.toString());
                rs = await conn.query(sql, [res.toString(), fid]);
                if (fin == 1) {
                    tmp = await cModel.to2dArray(jid, idx, 1);
                    tmp = await jModel.toJson(tmp);
                    sql = "UPDATE file_DB SET content = ? isMapped = ? WHERE fileID = ?";
                    rs = await conn.query(sql, [tmp, true, jid]);
                } 
            }  else {
                console.log('type = ' + type + 'res = ' + res + 'tostring = ' + res.toString());
                sql = "UPDATE sec_map SET sec_map = ? WHERE fileID = ? and map_ID = ?";
                rs = await conn.query(sql, [res.toString(), fid, jid]);
                if (fin == 1) {
                    tmp = await cModel.to2dArray(jid, idx, 2);
                    tmp = await jModel.toJson(tmp);
                    sql = "UPDATE file_DB SET content = ? isMapped = ? WHERE fileID = ?";
                    rs = await conn.query(sql, [tmp, true, jid]);
                }
            } 
                           
        conn.release();
        return result;
      } catch (error) {
        console.log(error);
      }
  }
    csvFilter = async (pid) => {
    try {
        let conn = await pool.getConnection();
        var sql = "SELECT sourceCsvs FROM file_DB WHERE fileID = ?";
        let arr = await conn.query(sql, [pid]);
        arr = arr[0].sourceCsvs.split(',');
        let fhead = new Array();
        let shead = new Array();
        let fid = new Array(); 
        var type;
        let temp;
        sql = "SELECT map FROM file_DB WHERE fileID = ?";
        for (let i = 0; i < arr.length; i++) {
            let row = await conn.query(sql, [arr[i]]);            
            if (row[0].map == null) {
                fid.push(arr[i]);
                temp = await tbfunc.getHead(arr[i])
                fhead.push(temp);
                shead.push(row[0].map);
                type = 1;
            } else if (row[0].map.includes(',,') || row[0].map == '') {
                fid.push(arr[i]);
                temp = await tbfunc.getHead(arr[i])
                fhead.push(temp);
                shead.push(row[0].map);
                type = 1;
            } else if (type != 1) {
                let tmp = await tbfunc.getSecMap(arr[i], pid);
                if (tmp == null) {
                    type = 2;
                    fid.push(arr[i]);
                    temp = await tbfunc.getHead(arr[i])
                    fhead.push(temp);
                    shead.push(tmp);
                } else if (tmp.includes(',,') || tmp === '') {
                    type = 2;
                    fid.push(arr[i]);
                    temp = await tbfunc.getHead(arr[i])
                    fhead.push(temp);
                    shead.push(tmp);
                }
            }
          }
        conn.release();
        let result = {
            "file_ids": fid,
            "project_id": pid,
            "file_heads": fhead,
            "saved_heads": shead,
            "map_head": [],
            "type" : type
          }
        result["map_head"] = type == 1 ? this.core : await tbfunc.getJsonHead(pid, 1); 
        console.log(result);
        return result;
    } catch (error) {
       console.log(error);
    }
  }

  fileMapCheck (map) {
    if (map == null) {return false;}
    else if (map == '' || map.includes(',,')) {return false;}
    else {return true;}
  }
}
module.exports = mapModel;