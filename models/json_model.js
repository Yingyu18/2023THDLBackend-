var fs = require('fs');
let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');
const pool = require("./connection_db");

tableFunc = new tableFunc();
cleaner = new cleaner();

class jsonConverter {

   async toJson (arr) { 
    console.log('arr 0 = ' +  arr[0]);
    console.log('arr 1 = ' +  arr[1]);
        let js = {
           "columns" : arr[0],
           "xmlTags" : arr[1]
        }
        for (let i = 2; i < arr.length; i++) {
            console.log('i = ' + arr[i] );
            js[String("file" + (i-1))] = arr[i];
            console.log('json i = ' + js[String("file" + (i-1))]);
        }
        return js;       
    }

    async to2D (fid) { 
        var js = await tableFunc.openFile([fid]); console.log('js = ' + js);
        js = JSON.parse(js);
        if (js == null || js == '') {return {error: 'no such content, complete map first'}}
        let arr = new Array();
        for(var k in js) {
          console.log('k = ' + k , '---- cont = ' + js[k]);
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
          var sql = "Select fileName from file_DB where fileID = ?";
          let fname = await conn.query(sql, [fid]);   
          sql = "Select sourceCsvs from file_DB where fileID = ?";
          let src = await conn.query(sql, [pid]);   
          sql = "UPDATE file_DB SET sourceCsvs = ?, lastModified = ? where fileID = ?";
          let result = await conn.query(sql, [src.push(fid), new Date().getTime().toString(), pid]);  
          sql = "Insert Into sec_map SET fileID = ?, map_ID = ?, sec_map = ? values (?, ?, ?)";  
          result = await conn.query(sql, [fid, pid, '']);  
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
          conn.release();
          return 'csv append success';  
        } catch (error) {
          console.log(error);
        } 
      }
         
}


module.exports = jsonConverter;
