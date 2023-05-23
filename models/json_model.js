var fs = require('fs');
let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');
const pool = require("./connection_db");

tableFunc = new tableFunc();
cleaner = new cleaner();

class jsonConverter {

   async toJson (arr) { 
        let js = {
           "columns" : arr[0],
           "xmlTags" : arr[1]
        }
        for (let i = 2; i < arr.length; i++) {
            js["file" + (i-1)] = arr[i];
        }
        return js;       
    }

    async to2D (fid) { 
        var js = tableFunc.openFile([fid]);
        if (js === null || js === '') {return {error: 'no such content, complete map first'}}
        let arr = new Array();
        for(var k in js) {arr.push(js[k]);}
        return arr;       
    }

    async needMapCheck(pid) {
        try {
          let conn = await pool.getConnection();
          var sql = "Select is_mapped from file_DB where fileID = ?";
          let result = await conn.query(sql, [pid]);      
          conn.release();
          return result;  
        } catch (error) {
          console.log(error);
        }      
      } 
    
    async insertNewCSV(fid, pid) {
        try {
          let conn = await pool.getConnection();
          var sql = "Select fileName from file_DB where fileID = ?";
          let fname = await conn.query(sql, [fid]);   
          sql = "Select sourceCsvs from file_DB where fileID = ?";
          let src = await conn.query(sql, [pid]);   
          sql = "UPDATE file_DB SET sourceCsvs = ? where fileID = ?";
          let result = await conn.query(sql, [src.push(fname), pid]);  
          sql = "Insert Into sec_map SET fileID = ?, map_ID = ?, sec_map = ?, create_time = ? values (?, ?, ?, ?)";  
          result = await conn.query(sql, [fid, pid, '', Date.now()]);  
          conn.release();
          return 'success';  
        } catch (error) {
          console.log(error);
        } 
      }

    async resetMapStatus(pid) {
        try {
          let conn = await pool.getConnection();
          var sql = "UPDATE file_DB SET is_mapped = ? where fileID = ?";
          let result = await conn.query(sql, [false, pid]);      
          conn.release();
          return 'csv append success';  
        } catch (error) {
          console.log(error);
        } 
      }
         
}


module.exports = jsonConverter;
