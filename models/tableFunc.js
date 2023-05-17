class tableFunc {
  async insertFile(uid, uname, fileName, content, row) {
    const pool = require("./connection_db");
    console.log("insert file for user: " + uid);
    try {
      let conn = await pool.getConnection();
      if (ft == "son") {
        ft = "j" + ft;
      }
      var sql =
        "INSERT INTO file_DB (fileName, USER_ID, USER_NAME, Start_Row, map, content, cores_xml_id, upload_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      await conn.query(sql, [
        fileName,
        uid,
        uname,
        row,
        "",
        content,
        -1,
        Date.now(),
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
      var sql = "SELECT content FROM file_DB WHERE fileID = ?";
      for (let i = 0; i < fileIDs.length; i++) {
        row = await conn.query(sql, fileIDs[i]);
        array[i] = row[0].content;
      }
      conn.release();
      return array;
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
        row = await conn.query(sql, fileIDs[i]);
        array[i] = row[0].Start_Row;
      }
      conn.release();
      return array;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteFile(fileID) {
    const pool = require("./connection_db");
    try {
      let conn = await pool.getConnection();
      var sql = "DELETE FROM file_DB WHERE fileID = ?";
      await conn.query(sql, fileID);
      console.log("delete success");
      conn.release();
    } catch (error) {
      console.log(error);
    }
  }

  async queryName(id) {
    const pool = require("./connection_db");
    try {
      let row;
      let conn = await pool.getConnection();
      var sql = "Select fileName from file_DB where fileID = ?";
      row = await conn.query(sql, id);
      conn.release();
      return row[0].file_name;
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
      var resBody = { file_id: "zzz", file_name: fname };
      if (fid == "") {
        sql =
          "INSERT INTO file_DB (fileName, USER_ID, USER_NAME, Start_Row, map, content, cores_xml_id, upload_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        await conn.query(sql, [
          fileName,
          uid,
          uname,
          1,
          "",
          content,
          -1,
          Date.now(),
        ]);
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
