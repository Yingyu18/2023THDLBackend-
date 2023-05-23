require('dotenv').config();
const pool = require('./connection_db');
let tbfunc = require('./tableFunc');
let cleaner = require('./cleaners');
const csvConvert = require('../models/csvConvert');
tbfunc = new tbfunc();
cleaner = new cleaner();

class mapModel {
    getColInfo = async (id, row) => {
        var arr = tbfunc.openFile([id]);
        arr = cleaner.rawTable(arr);
        var res = arr[row-1];
        if (res[0] == null) {return {error : '上傳時指定錯誤列數，標題列為空。'}}
        else {return res;}    
}

    saveMap = async (id, jid, type, fin, res) => {
        var arr;
        var idx;
        try {
            let conn = await pool.getConnection();
            var sql = "SELECT Start_Row FROM file_DB WHERE fileID = ?";
            let rs = await conn.query(sql, id);
        idx = rs.Start_Row;
        if (fin) {
            arr = csvConvert.to2dArray([id], [res], [idx], [type]);    
        } else {arr = {"message": "對應尚未完成，結果已暫存"};}
        
        if (type == 1) { 
            sql = "UPDATE file_DB SET map = ? WHERE fileID = ?";
            rs = await conn.query(sql, res.toString(), id);
        } else {
            sql = "Select * from sec_map WHERE fileID = ? and json_ID = ?";
            rs = await conn.query(sql, id, jid);
            if (res.next()) {
                sql = "UPDATE sec_map SET sec_map = ? WHERE fileID = ? and json_ID = ?";
                rs = await conn.query(sql, res.toString(), id, jid);
            } else {
                 sql = "Insert into sec_map (fileID, json_ID, sec_map, create_time) VALUES (?, ?, ?, ?)";
                rs = await conn.query(sql, id, jid, res.toString(), new Date());
            }
        }                 
        conn.release();
      } catch (error) {
        console.log(error);
      }
    if (arr.error) {
        return {error: arr.error};
    } else {
        return arr;
    } 
  }
    csvFilter = async (pid) => {
    try {
        let conn = await pool.getConnection();
        var sql = "SELECT sourceCsvs FROM file_DB WHERE fileID = ?";
        let arr = await conn.query(sql, pid);
        let fhead = new Array();
        let shead = new Array();
        let fid = new Array();
        arr = tbfunc.getSrcsID(arr[0].sourceCsvs);
        sql = "SELECT map FROM file_DB WHERE fileID = ?";
        for (let i = 0; i < arr.length; i++) {
            let row = await conn.query(sql, arr[i]);            
            if (row[0].map.includes(',,')) {
                fid.push(arr[i]);
                fhead.push(tbfunc.);
                type = 1;
            } 
          }                      
        conn.release();
        let result = {
            "file_ids": arr,
            "project_id": pid,
            "file_heads": [],
            "saved_heads": [],
            "map_head": [],
            "type" : 0
          }
    } catch (error) {
       console.log(error);
    }

  }
}
module.exports = mapModel;