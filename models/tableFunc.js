class tableFunc {
  async insertFile(uid, uname, fileName, content, type) {
    const pool = require("./connection_db");
    console.log("insert file for user: " + uid);
    try {
      let conn = await pool.getConnection();
      if (ft == "son") {
        ft = "j" + ft;
      }
      var sql =
        "INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, upload_time, type, lastModified) VALUES (?,?,?,?,?,?,?,?)";
      var time = Date.now();
      await conn.query(sql, [
        fileName,
        uid,
        uname,
        -1,
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
      row = row[0].sourceCsvs;
      sql = "SELECT content, source FROM file_DB where fileName = ?"
      for (let i = 0; i < row.length; i++) {
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
        row = await conn.query(sql, [fileIDs[i]]);
        array[i] = row[0].Start_Row;
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
      var sql = "SELECT Type FROM file_DB WHERE fileID = ?";
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
      row = await conn.query(sql, [fileID]);     
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
      var sql = "SELECT sec_map FROM sec_map WHERE fileID = ? and pid = ?";
      row = await conn.query(sql, [fileID, pid]);     
      conn.release();
      return row[0].sec_map;
    } catch (error) {
      console.log(error);
    }
  }

  async getHead(fileID) {
    const pool = require("./connection_db");
    var idx = this.getRowId([fileID]);
    idx = idx[0];
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT content FROM file_DB WHERE fileID = ?";
      row = await conn.query(sql, [fileID]);  
      row = row[0].content.split('\n');
      conn.release();
      return row[idx-1];      
    } catch (error) {
      console.log(error);
    }
  }

  async getJsonHead(fileID, cnt) {
    const pool = require("./connection_db");
    var idx = this.getRowId([fileID]);
    idx = idx[0];
    var temp;
    try {
      let conn = await pool.getConnection();
      var sql = "SELECT content FROM file_DB WHERE fileID = ?";
      temp = await conn.query(sql, [fileID]);  
      row = temp[0].content["columns"];
      if (cnt == 2) {row.push(temp[0].content["xmlTags"]);}
      conn.release();
      return row;      
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
        row = await conn.query(sql, [fnames[i]]);
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
      var sql = "SELECT is_mapped FROM file_DB WHERE fileID = ?";      
      let res = await conn.query(sql, [pid]);  
      conn.release();
      return res[0].is_mapped;
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

  async saveJson(js, uid, uname, fid, fname) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql;
      var row;
      var resBody = { file_id: "zzz", file_name: fname};
      if (fid == -1) {
        this.insertFile(uid, uname, fname, js, 'json')
        sql = "Select file_id from file_DB where fileName = ? and USER_ID = ?";
        row = await conn.query(sql, [fileName, uid]);
        fid = row[0].file_id;
      } else {
        sql = "UPDATE file_DB SET content = ?, fileName = ? where fileID = ?";
        await conn.query(sql, [js, fname, fid]);
      }
      resBody["file_id"] = fid;
      conn.release();
      return resBody;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = tableFunc;
