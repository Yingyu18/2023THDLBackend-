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
    //create project 時 sourceCsv 都有map
    //fid : last sourceCsv id
    //jid : projectID
    //type: 1 
    //fin : 1
    //res : last sourceCsv 的 map
    saveMap = async (fid, jid, type, fin, res) => {
        console.log('im in~~~~');
        var idx = await tbfunc.getRowId([fid]); console.log ('save idx = ' + idx);
        var result = 'save success';
        let tmp;
        try {
            let conn = await pool.getConnection();
            let sql;
            let rs;     
            if (type == 1) { 
                sql = "UPDATE file_DB SET map = ?, lastModified = ? WHERE fileID = ?";
                console.log('type = ' + type + 'res = ' + res + 'tostring = ' + res.toString());
                rs = await conn.query(sql, [res.toString(), new Date().getTime().toString(), fid]);
                sql = "select fileID From sec_map WHERE fileID = ? and map_ID = ?";
                rs = await conn.query(sql, [fid, jid]);
                if (rs[0] == null) {
                    sql = "INSERT INTO sec_map (fileID, map_ID, sec_map) Values (?, ?, ?)";
                    rs = await conn.query(sql, [fid, jid, res.toString()]);
                } else {
                    sql = "UPDATE sec_map SET sec_map = ? WHERE fileID = ? and map_ID = ?";
                    rs = await conn.query(sql, [res.toString(), fid, jid]);
                }
                if (fin == 1) {
                    sql = "UPDATE file_DB SET isMapped = ?, lastModified = ? WHERE fileID = ?";
                    rs = await conn.query(sql, [1, new Date().getTime().toString(), fid]);
                    sql = "UPDATE sec_map SET isMapped = ? WHERE fileID = ? and map_ID = ?";
                    rs = await conn.query(sql, [1, fid, jid]);
                    sql = "select sourceCsvs from file_DB WHERE fileID = ?";
                    rs = await conn.query(sql, [jid]);
                    rs = rs[0].sourceCsvs.split(',');
                    if (cModel.allMappedCheck(rs, 1, jid)) {
                        console.log('converting 2d array for 1 mapping');
                        idx =  await tbfunc.getRowId(rs);
                        let maps = new Array();
                        let tpmap;
                        for (let i = 0; i < rs.length; i++) {
                            tpmap = await tbfunc.getMap(rs[i]);
                            maps.push(String(tpmap).split(','));
                        }
                        tmp = await cModel.to2dArray(jid, idx, 1, maps);
                        tmp = await jModel.toJson(tmp);
                        sql = "UPDATE file_DB SET content = ?, isMapped = ?, lastModified = ? WHERE fileID = ?";
                        rs = await conn.query(sql, [tmp, 1, new Date().getTime().toString(), jid]);
                    }
                } 
            }  else {
                console.log('type = ' + type + 'res = ' + res + 'tostring = ' + res.toString());
                sql = "UPDATE sec_map SET sec_map = ? WHERE fileID = ? and map_ID = ?";
                rs = await conn.query(sql, [res.toString(), fid, jid]);
                if (fin == 1) {
                    sql = "UPDATE sec_map SET isMapped = ? WHERE fileID = ? and map_ID = ?";
                    rs = await conn.query(sql, [1, fid, jid]);
                    sql = "select sourceCsvs from file_DB WHERE fileID = ?";
                    rs = await conn.query(sql, [jid]);
                    rs = rs[0].sourceCsvs.split(',');
                    if (cModel.allMappedCheck(rs, 2, jid) == true) {
                        idx =  await tbfunc.getRowId(rs);
                        let maps = new Array();
                        let tpmap;
                        for (let i = 0; i < rs.length; i++) {
                            tpmap = await tbfunc.getSecMap(rs[i], jid);
                            console.log('tpmap + = = =' + tpmap);
                            maps.push(String(tpmap).split(','));
                        }
                        tmp = await cModel.to2dArray(jid, idx, 2, maps);
                        tmp = await jModel.toJson(tmp);
                        sql = "UPDATE file_DB SET content = ?, isMapped = ?, lastModified = ? WHERE fileID = ?";
                        rs = await conn.query(sql, [tmp, 1, new Date().getTime().toString(), jid]);
                    }
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
        let uhead = new Array();
        let fid = new Array(); 
        var type = 0;
        let temp;
        sql = "SELECT isMapped FROM file_DB WHERE fileID = ?";
        let sql2 = "SELECT isMapped FROM sec_map WHERE fileID = ? and map_ID = ?";
        let sql3 = "SELECT sec_map FROM sec_map WHERE fileID = ? and map_ID = ?";
        let check3;
        for (let i = 0; i < arr.length; i++) {
            let row = await conn.query(sql, [arr[i]]); console.log(i + 'retrieve = ' +row+ 'type = ' + type+ ' map = '+ row[0].map);      
            if (row[0].isMapped == null || row[0].isMapped == 0) {
                check3 = await conn.query(sql3, [arr[i], pid]);
                if (check3[0] != null && check3[0].sec_map == '請進行二次對應') {continue;}
                if (type == 2) {
                    fhead = new Array();
                    shead = new Array();
                    fid = new Array();
                    uhead = new Array();
                }
                fid.push(arr[i]);
                temp = await tbfunc.getHead(arr[i])
                fhead.push(temp);
                temp = await tbfunc.getMap(arr[i]);
                shead.push(temp);
                temp = await tbfunc.getUniqueHead(arr[i]);
                uhead.push(temp);
                type = 1;
            } else if (type != 1) {
                let sec_row = await conn.query(sql2, [arr[i], pid]);                
                if (sec_row[0].isMapped == null || sec_row[0].isMapped == 0) {
                    let tmp = await tbfunc.getSecMap(arr[i], pid);
                    type = 2;
                    fid.push(arr[i]);
                    temp = await tbfunc.getHead(arr[i]);
                    fhead.push(temp);
                    shead.push(tmp);
                    temp = await tbfunc.getUniqueHead(arr[i]);
                    uhead.push(temp);
                }
            }
          }
        conn.release();
        console.log('type = ' + type);
        let result = {
            "file_ids": fid,
            "project_id": pid,
            "file_heads": fhead,
            "saved_heads": shead,
            "map_head": [],
            "unique_heads": uhead,
            "type" : type
          }
        result["map_head"] = type == 1 ? ['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
        '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
        '相關組織', '關鍵詞', '摘要/全文'] : await tbfunc.getJsonHead(pid, 1); 
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
  
  async changeRow (fid, srow) {
    let conn = await pool.getConnection();
    var sql = "UPDATE file_DB SET Start_Row = ?, lastModified = ? WHERE fileID = ?";
    var result = {
        "file_head": "zzz",
        "unique_head": "ccc"
    }
    try {
        let temp = await conn.query(sql, [srow, new Date().getTime().toString(), fid]);
        result.file_head = await tbfunc.getHead(fid);
        result.unique_head = await tbfunc.getUniqueHead(fid);
        conn.release();
        return result;
    } catch (error) {
        console.log(error);
     }
  }
}
module.exports = mapModel;