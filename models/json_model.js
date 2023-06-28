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
            js[String("file" + (i-1))] = arr[i];           
        }
        return js;       
    }

    async to2D (fid) { 
        var js = await tableFunc.openFile([fid]);
        js = JSON.parse(js);
        if (js == null || js == '') {return {error: 'no such content, complete map first'}}
        let arr = new Array();
        for(var k in js) {
          arr.push(js[k]);
        }
        return arr;       
    }

    async needMapCheck(pid) {
        try {
          let conn = await pool.getConnection();
          var sql = "Select isMapped from file_DB where fileID = ?";
          let result = await conn.query(sql, [pid]); 
          result = result[0].isMapped;  
          conn.release();
          return result;  
        } catch (error) {
          console.log(error);
        }      
      } 
    
    async insertNewCSV(fid, pid) {
        try {
          let conn = await pool.getConnection(); 
          var sql = "Select sourceCsvs, content from file_DB where fileID = ?";
          let src = await conn.query(sql, [pid]);
          let tmp = src[0].sourceCsvs.split(",");
          tmp.push(fid);
          tmp = tmp.join();
          sql = "UPDATE file_DB SET sourceCsvs = ?, lastModified = ? where fileID = ?";
          let result = await conn.query(sql, [tmp, new Date().getTime().toString(), pid]);  
          sql = "Select isMapped from file_DB where fileID = ?";
          tmp = await conn.query(sql, [fid]);
          sql = "Insert Into sec_map (fileID, map_ID, sec_map, isMapped) values (?, ?, ?, ?)"; 
          if (tmp[0].isMapped == 1 && (src[0].content == null || src[0].content == '')) {result = await conn.query(sql, [fid, pid, await tableFunc.getHead(fid), 1]);}       
          else {
            result = await conn.query(sql, [fid, pid, '請進行二次對應', 0]);
          }        
          conn.release();
          return 'success';  
        } catch (error) {
          console.log(error);
        } 
      }

    async resetMapStatus(pid) {
        try {
          let conn = await pool.getConnection();
          var sql = "UPDATE file_DB SET isMapped = ?, lastModified = ? where fileID = ?";
          let result = await conn.query(sql, [0, new Date().getTime().toString(), pid]);  
          sql = "SELECT * FROM file_DB WHERE fileID = ?";
          result = await conn.query(sql, [pid]);
          conn.release();
          return result[0];  
        } catch (error) {
          console.log(error);
        } 
      }

    async getTg(pid) {
      try {
        let conn = await pool.getConnection();
        var sql = "SELECT map from file_DB where fileID = ?";
        let result = await conn.query(sql, [pid]);  
        conn.release();       
        if (result[0] == null || result[0].map == null || result[0].map == '') {console.log('nul!'); return '';}
        else {console.log('not nul!'); return result[0].map;}   
      } catch (error) {
        console.log(error);
      } 
    }
     
    async saveTg(pid, tag) {
      try {
        let conn = await pool.getConnection(); 
        var sql = "UPDATE file_DB SET map = ?, lastModified = ? where fileID = ?"      
        let result = await conn.query(sql, [tag, new Date().getTime().toString(), pid]);
        conn.release();
        return 'done';   
      } catch (error) {
        console.log(error);
      } 
     }  
}


module.exports = jsonConverter;
