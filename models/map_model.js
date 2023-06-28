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
    saveMap = async (fid, jid, type, res) => {        
        var idx = await tbfunc.getRowId([fid]); 
        var result = 'save success';
        let tmp;
        try {
            let conn = await pool.getConnection();
            let sql;
            let rs;     
            if (type == 1) { 
                sql = "UPDATE file_DB SET map = ?, lastModified = ? WHERE fileID = ?";
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
                sql = "UPDATE file_DB SET isMapped = ?, lastModified = ? WHERE fileID = ?";
                rs = await conn.query(sql, [1, new Date().getTime().toString(), fid]);
                sql = "UPDATE sec_map SET isMapped = ? WHERE fileID = ? and map_ID = ?";
                rs = await conn.query(sql, [1, fid, jid]);
                sql = "select sourceCsvs from file_DB WHERE fileID = ?";
                rs = await conn.query(sql, [jid]);
                rs = rs[0].sourceCsvs.split(',');
                if (await cModel.allMappedCheck(rs, 1, jid)) {
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
                
            } else {
                sql = "UPDATE sec_map SET sec_map = ? WHERE fileID = ? and map_ID = ?";
                rs = await conn.query(sql, [res.toString(), fid, jid]);
                sql = "UPDATE sec_map SET isMapped = ? WHERE fileID = ? and map_ID = ?";
                rs = await conn.query(sql, [1, fid, jid]);
                sql = "select sourceCsvs from file_DB WHERE fileID = ?";
                rs = await conn.query(sql, [jid]);
                rs = rs[0].sourceCsvs.split(',');
                if (await cModel.allMappedCheck(rs, 2, jid) == true) {
                    idx =  await tbfunc.getRowId(rs);
                    let maps = new Array();
                    let tpmap;
                    for (let i = 0; i < rs.length; i++) {
                        tpmap = await tbfunc.getSecMap(rs[i], jid);
                        maps.push(String(tpmap).split(','));
                    }
                    tmp = await cModel.to2dArray(jid, idx, 2, maps);
                    tmp = await jModel.toJson(tmp);
                    sql = "UPDATE file_DB SET content = ?, isMapped = ?, lastModified = ? WHERE fileID = ?";
                    rs = await conn.query(sql, [tmp, 1, new Date().getTime().toString(), jid]);
                }
                
            } 
                           
        conn.release();
        return result;
      } catch (error) {
        console.log(error);
      }
  }

  savePreSet = async (uid, fid, jid, type, res, pname) => {        
    var result = 'save success';
    let head = await tbfunc.getHead(fid);
    let ftp = await tbfunc.getType([fid]);
    ftp = ftp[0];
    pres = res.split(',');
    try {
        let conn = await pool.getConnection();
        let sql;
        let rs;
        sql = "select * from PreSetDB WHERE type = ? and setName = ? and UID = ?";
        rs = await conn.query(sql, [ftp, pname, uid]);
        if (rs[0] != null) {return 'dupe';}
        if (type == 1) { 
            sql = "UPDATE file_DB SET map = ?, lastModified = ? WHERE fileID = ?";
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
        } else {
            sql = "UPDATE sec_map SET sec_map = ? WHERE fileID = ? and map_ID = ?";
            rs = await conn.query(sql, [res.toString(), fid, jid]);
        } 
        for (let i = 0; i < head.length; i++) {
            head[i] += '%' + pres[i];
        }    
        sql = "INSERT INTO PreSetDB (UID, type, map, setName) Values (?, ?, ?, ?)";
        rs = await conn.query(sql, [uid, ftp, head.join(','), pname]);     
    conn.release();
    return result;
   } catch (error) {
     console.log(error);
   }
 }

 delPreSet = async (uid, fid, pname) => {        
    var result = 'delete success';
    let ftp = await tbfunc.getType([fid]);
    ftp = ftp[0];
    try {
        let conn = await pool.getConnection();
        let sql;
        let rs;
        sql = "delete from PreSetDB WHERE type = ? and setName = ? and UID = ?";
        rs = await conn.query(sql, [ftp, pname, uid]);
    conn.release();
    return result;
   } catch (error) {
     console.log(error);
   }
 }

 getPreSet = async (uid, fid) => {        
    var result = new Array();
    let ftp = await tbfunc.getType([fid]);
    ftp = ftp[0];
    try {
        let conn = await pool.getConnection();
        let sql;
        let rs; 
        let tmparr = new Array();
        let tmpcont;
        sql = "select * From PreSetDB WHERE UID = ? and type = ?";
        rs = await conn.query(sql, ['defaultUser', ftp]); 
        if (rs[0] != null) {
            tmparr.push(rs[0].setName);
            tmpcont = rs[0].map.split(',');
        }
        for (let i = 0; i < tmpcont.length; i++) {tmparr.push(tmpcont[i]);}
        result.push(tmparr);
        sql = "select * From PreSetDB WHERE UID = ? and type = ?";
        rs = await conn.query(sql, [uid, ftp]);
        for (let j = 0; j < res.length; j++) {
            if (rs[j] != null) {
                tmparr = new Array();
                tmparr.push(rs[j].setName);
                tmpcont = rs[j].map.split(',');
                for (let i = 0; i < tmpcont.length; i++) {tmparr.push(tmpcont[i]);}
                result.push(tmparr);
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
        let previews = new Array();
        var type = 0;
        let temp;
        sql = "SELECT isMapped FROM file_DB WHERE fileID = ?";
        let sql2 = "SELECT isMapped FROM sec_map WHERE fileID = ? and map_ID = ?";
        let sql3 = "SELECT sec_map FROM sec_map WHERE fileID = ? and map_ID = ?";
        let contsql = "SELECT content FROM file_DB WHERE fileID = ?";
        let ctrow = await conn.query(contsql, [pid]);
        ctrow = ctrow[0].content;
        let check3;
        for (let i = 0; i < arr.length; i++) {
            previews.push(await tbfunc.getPreview(arr[i]));
            let row = await conn.query(sql, [arr[i]]);
            check3 = await conn.query(sql3, [arr[i], pid]);
            if (!(check3[0] != null && check3[0].sec_map == '請進行二次對應' &&  ctrow != null && ctrow != '') && (row[0].isMapped == null || row[0].isMapped == 0)) {
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
                uhead.push(temp.join());
                type = 1;
            } else if (type != 1) {
                let sec_row = await conn.query(sql2, [arr[i], pid]);        
                if (sec_row[0] == null) {
                    let insmap = await tbfunc.getMap(arr[i]);
                    let inssql = "INSERT INTO sec_map (fileID, map_ID, sec_map, isMapped) Values (?, ?, ?, ?)";
                    let insRes =   await conn.query(inssql, [arr[i], pid, insmap, 1]);
                }
                else if (sec_row[0].isMapped == null || sec_row[0].isMapped == 0) {
                    let tmp = await tbfunc.getSecMap(arr[i], pid);
                    type = 2;
                    fid.push(arr[i]);
                    temp = await tbfunc.getHead(arr[i]);
                    fhead.push(temp);
                    shead.push(tmp);
                    temp = await tbfunc.getUniqueHead(arr[i]);
                    uhead.push(temp.join());
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
            "unique_heads": uhead,
            "preivew_contents": previews,
            "type" : type
          }
        result["map_head"] = type == 1 ? ['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
        '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
        '相關組織', '關鍵詞', '摘要/全文'] : await tbfunc.getJsonHead(pid, 1); 
        
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
    var sql = "SELECT content from file_DB WHERE fileID = ?";
    let tb = await conn.query(sql, [fid]);
    tb = tb[0].content.split('\n');
    if (srow > tb.length) {return {"error" : '列數超出檔案本身長度！'};}
    sql = "UPDATE file_DB SET Start_Row = ?, lastModified = ? WHERE fileID = ?";
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

  async checkProjectMappedOtherPlace(pid) {
    this.csvFilter(pid);
    try {
        let conn = await pool.getConnection();
        var sql = "SELECT sourceCsvs FROM file_DB WHERE fileID = ?";
        let arr = await conn.query(sql, [pid]);
        arr = arr[0].sourceCsvs.split(',');
        let temp = 0;
        sql = "SELECT isMapped FROM file_DB WHERE fileID = ?";
        let sql2 = "SELECT isMapped FROM sec_map WHERE fileID = ? and map_ID = ?";
        for (let i = 0; i < arr.length; i++) {
            let row1 = await conn.query(sql, [arr[i]]);
            let row2 = await conn.query(sql2, [arr[i], pid]);
            if (row1[0] && row2[0] && row1[0].isMapped && row2[0].isMapped && row1[0].isMapped == 1 && row2[0].isMapped == 1) {continue;}
            else {
                temp = 1;
                break;
            }
        }        
        if (temp == 1) {
            conn.release();
            return 0;
        } else {            
            let idx =  await tbfunc.getRowId(arr);
            let maps = new Array();
            let tpmap;
            for (let i = 0; i < arr.length; i++) {
                tpmap = await tbfunc.getMap(arr[i]);
                maps.push(String(tpmap).split(','));
            }
            let tmp = await cModel.to2dArray(pid, idx, 1, maps);
            tmp = await jModel.toJson(tmp);
            sql = "UPDATE file_DB SET content = ?, isMapped = ?, lastModified = ? WHERE fileID = ?";
            let rs = await conn.query(sql, [tmp, 1, new Date().getTime().toString(), pid]);
            conn.release();
            return 1;
        }
    } catch (error) {
       console.log(error);
    }
  }
}
module.exports = mapModel;