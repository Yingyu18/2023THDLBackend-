class tableFunc {
  async insertFile(uid, uname, fileName, content, type) {
    const pool = require("./connection_db");
    console.log("insert file for user: " + uid);
    try {
      let conn = await pool.getConnection();
      var sql =
        "INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, upload_time, type, lastModified) VALUES (?,?,?,?,?,?,?,?)";
      var time = new Date().getTime().toString();
      await conn.query(sql, [
        fileName,
        uid,
        uname,
        1,
        content,
        time,
        type,        
        time,        
      ]);
      console.log("insert success");
      conn.release();
    } catch (error) {
      console.log(error);
    }
  }

  async openFile(fileIDs) {
    const pool = require("./connection_db");
    var array = Array(fileIDs.length);
    try {
      let conn = await pool.getConnection();
      let row;
      var sql = 'SELECT content FROM file_DB WHERE fileID = ?';
      for (let i = 0; i < fileIDs.length; i++) {
        row = await conn.query(sql, [fileIDs[i]]);
        array[i] = row[0].content;
      }
      conn.release();
      return array;
    } catch (error) {
      console.log(error);
    }
  }

  async openForProject(pid) {
    const pool = require("./connection_db");
    var array = [[],[]];
    var temp;
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT sourceCsvs FROM file_DB WHERE fileID = ?";      
      let row = await conn.query(sql, [pid]);
      row = row[0].sourceCsvs.split(','); console.log('converting 2d csv ids = ' + row);
      sql = "SELECT content, source FROM file_DB where fileID = ?"
      for (let i = 0; i < row.length; i++) {
        console.log('opening idx with ' + row[i]);
        temp = await conn.query(sql, [row[i]]);
        array[0].push(temp[0].content);
        array[1].push(temp[0].source);
      }
      conn.release();
      return array;
    } catch (error) {
      console.log(error);
    }
  }

  async open2DbyXML(xml_id) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT fileID FROM sec_map WHERE map_ID = ?";      
      let jid = await conn.query(sql, [xml_id]);
      jid = jid[0].fileID;
      return jid;
    } catch (error) {
      console.log(error);
    }
  }

  async getRowId(fileIDs) {
    const pool = require("./connection_db");
    var array = Array(fileIDs.length);
    try {
      let conn = await pool.getConnection();
      let row;
      var sql = "SELECT Start_Row FROM file_DB WHERE fileID = ?";
      for (let i = 0; i < fileIDs.length; i++) {
        row = await conn.query(sql, [fileIDs[i]]);  console.log('row = ' + row + '\nid from get row = ' + row[0].Start_Row);
        array[i] = row[0].Start_Row; console.log('arr['+i+']= ' + row[0].Start_Row);
      }
      conn.release();
      return array;
    } catch (error) {
      console.log(error);
    }
  }
  async getType(fileIDs) {
    const pool = require("./connection_db");
    var array = Array(fileIDs.length);
    try {
      let conn = await pool.getConnection();
      let row;
      var sql = "SELECT type FROM file_DB WHERE fileID = ?";
      for (let i = 0; i < fileIDs.length; i++) {
        row = await conn.query(sql, [fileIDs[i]]);
        array[i] = row[0].Type;
      }
      conn.release();
      return array;
    } catch (error) {
      console.log(error);
    }
  }

  async getMap(fileID) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT map FROM file_DB WHERE fileID = ?";
      let row = await conn.query(sql, [fileID]);     
      conn.release();
      return row[0].map;
    } catch (error) {
      console.log(error);
    }
  }

  async getSecMap(fileID, pid) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT sec_map FROM sec_map WHERE fileID = ? and map_ID = ?";
      let row = await conn.query(sql, [fileID, pid]);     
      conn.release();
      return row[0].sec_map;
    } catch (error) {
      console.log(error);
    }
  }

  async getHead(fileID) {
    const pool = require("./connection_db");
    var idx = await this.getRowId([fileID]);
    idx = idx[0]; console.log('get head of fileID = ' + fileID +'with strow = ' + idx);
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT content FROM file_DB WHERE fileID = ?";
      let row = await conn.query(sql, [fileID]);  
      row = row[0].content.split('\n');console.log(row);
      conn.release();
      return row[idx-1];      
    } catch (error) {
      console.log(error);
    }
  }
  async getUniqueHead(fileID) {
    const pool = require("./connection_db");
    var idx = await this.getRowId([fileID]);
    idx = idx[0]; console.log('get uniquehead of fileID = ' + fileID +'with strow = ' + idx);
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT content FROM file_DB WHERE fileID = ?";
      let table = await conn.query(sql, [fileID]); console.log('opened = ' + table);
      conn.release();
      let result = []; 
      table = table[0].content.split('\n');
      for (let i = 0; i < table.length; i++) {
        table[i] = table[i].split(',');
      }
      for (let i = 0; i < table[idx-1].length; i++) {
        let container = [];
        for (let j = idx; j < table.length; j++) {
          if (container.includes(table[j][i])) {break;}
          else {
            container.push(table[j][i]);
            if (j == table.length - 1) {result.push(table[idx-1][i]);}
          }
        }
      }
      return result;      
    } catch (error) {
      console.log(error);
    }
  }

  async getJsonHead(fileID, cnt) {
    const pool = require("./connection_db");
    var idx = await this.getRowId([fileID]);
    idx = idx[0];
    var temp;
    let arr = [[],[]]
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT content FROM file_DB WHERE fileID = ?";
      temp = await conn.query(sql, [fileID]);  
      console.log('temp ====' + temp[0].content);
      let row = JSON.parse(temp[0].content);
      conn.release();
      if (cnt == 2) {
        arr[0]=row.columns;
        arr[1]=row.xmlTags;
        return arr;
      }
      else {return row.columns;}
    } catch (error) {
      console.log(error);
    }
  }

  async getSrcsID(fnames) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      let result = new Array();
      var sql = "SELECT fileID FROM file_DB WHERE fileName= ?";
      for (let i = 0; i < fnames.length; i++) {
        let row = await conn.query(sql, [fnames[i]]);
        result.push(row[0].fileID);
      }     
      conn.release();
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  async getIsMap(pid) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT isMapped FROM file_DB WHERE fileID = ?";      
      let res = await conn.query(sql, [pid]);  
      conn.release();
      return res[0].isMapped;
    } catch (error) {
      console.log(error);
    }
  }
  async deleteFile(fileID) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql = "DELETE FROM file_DB WHERE fileID = ?";
      await conn.query(sql, [fileID]);
      console.log("delete success");
      conn.release();
    } catch (error) {
      console.log(error);
    }
  }
  async copySecMap(srcs, jid, orgid) {
    const pool = require("./connection_db");
    let conn = await pool.getConnection();
    let sql = "Select sec_map, isMapped from sec_map where map_ID = ? and fileID = ?";
    let sql2 = "INSERT INTO sec_map (fileID, map_ID, sec_map, isMapped) Values (?, ?, ?, ?)";
    let mapResult;
    let finResult;
    let ctah;
    srcs = srcs.split(',');
    for (let i = 0; i < srcs.length; i++) {
      mapResult = await conn.query(sql, [orgid, srcs[i]]);
      finResult = mapResult[0].isMapped;
      mapResult = mapResult[0].sec_map;
      ctah = await conn.query(sql2, [srcs[i], jid, mapResult, finResult]);
    }
    conn.release();
    return 'copy done';
  } 

  async saveJson(js, uid, uname, fid, fname, isnew) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql;
      var row;
      var time = new Date().getTime().toString();
      var resBody = { file_id: "zzz", file_name: fname};
      if (isnew == 1) {
        sql = "SELECT * from file_DB Where fileID = ?";
        let allInfo = await conn.query(sql, [fid]);
        sql = "INSERT INTO file_DB (fileName, USER_ID, USER_NAME, Start_Row, map, " +
        "content, cores_xml_id, upload_time, type, sourceCsvs, source, size, lastModified, isMapped, isBuilt, url, description, updated)" +
        "VALUES (?, ?, ?, ?, ?, ?, ? ,?, ? ,? ,? ,? ,? ,?, ?, ?, ?, ?)";
        row = await conn.query(sql, [fname, uid, uname, allInfo[0].Start_Row, allInfo[0].map, allInfo[0].content, allInfo[0].cores_xml_id, time, allInfo[0].type,
          allInfo[0].sourceCsvs, allInfo[0].source, allInfo[0].size, time, allInfo[0].isMapped, allInfo[0].isBuilt, allInfo[0].url, allInfo[0].description, allInfo[0].updated]);
        sql = "SELECT sourceCsvs from file_DB where fileID = ?";
        row = await conn.query(sql, [fid]);
        let orgIdx = row[0].sourceCsvs;
        sql = "Select fileID from file_DB where lastModified = ? and USER_ID = ?";
        row = await conn.query(sql, [time, uid]);
        let nfid = row[0].fileID
        let qryStr = `INSERT INTO source_csvs (project_id, csv_name) VALUES (?,?)`
        for (let i = 0; i < orgIdx.length; i++) {
          let qryRes = await conn.query(qryStr, [fid, orgIdx[i]]);
        }     
        let ttttmp = await this.copySecMap(orgIdx, nfid, fid);
      } else {
        sql = "UPDATE file_DB SET content = ?, fileName = ?, lastModified = ? where fileID = ?";
        let asd = await conn.query(sql, [js, fname, new Date().getTime().toString(), fid]);
      }
      resBody["file_id"] = fid;
      conn.release();
      return resBody;
    } catch (error) {
      console.log(error);
    }
  }
  async simplesaveJson(js, fid) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql = "UPDATE file_DB SET content = ?, lastModified = ? where fileID = ?" 
      let asd = await conn.query(sql, [js, new Date().getTime().toString(), fid]);
      conn.release();
      return 'done';
    } catch (error) {
      console.log(error);
    }
  }

  async setBuilt(pid) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
     
      let sql = "UPDATE file_DB SET isBuilt = ?, lastModified = ? where fileID = ?";
      let res = await conn.query(sql, [true, new Date().getTime().toString(), pid]);
      conn.release();
      return 'is_built_set';
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = tableFunc;
