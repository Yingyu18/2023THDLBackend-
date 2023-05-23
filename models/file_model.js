const pool = require("./connection_db")


const uploadFile = async(data) => {
    const conn = await pool.getConnection()
    try{
        let {filename, content, userId, uploader, type, size, lastModified, source} = data
        //console.log(data)
            if(source === '國史館檔案史料文物'){ source = 0;}
            if(source === '地方議會議事錄總庫'){source = 1;}
            if(source === '國史館臺灣文獻館'){source = 2;}
            if(source === '臺灣省議會史料總庫'){source = 3;}
            if(source ==='自定義資料檔案'){source = 4;} 
        console.log("test", source)
        let qryStr = 'INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, upload_time, type, size, source, lastModified) VALUES (?,?,?,?,?,?,?,?,?,?)'
        const result = await conn.query(qryStr, [filename, userId, uploader, 1, content, new Date().getTime().toString(), type, size, source, lastModified])
        return result
    } catch (error){
        console.log({error:error})
        return {error}
    }
};


const deleteFile = async(filesId) => {
    const conn = await pool.getConnection() 
    try{
        // TODO 刪除 file
        for(let i=0; i<filesId.length; i++){
            qryStr = `DELETE FROM file_db WHERE fileID = ?`
            var result = await conn.query(qryStr, filesId[i])
            //console.log(result)
        }
        return result
    } catch (error){
        console.log(error)
        return {error}
    }
};

const getContent = async(fileId) => {
    const conn = await pool.getConnection()
    try{
        let qryStr = `SELECT content FROM file_db WHERE fileID = ?`
        var result = await conn.query(qryStr, [fileId])
        //console.log(result)
        return result[0].content
    } catch (error){
        console.log(error)
        return {error}
    }
}

const getCsv = async(req) => {
    let userId = req.user.userId;
    console.log(req.query)
    const conn = await pool.getConnection()
    try{
        let qryStr = `SELECT * FROM file_db WHERE USER_ID = ? AND type = ?`
        var results = await conn.query(qryStr, [userId, "csv"])
        return results
    } catch (error){
        console.log(error)
        return {error}
    }
}

module.exports = {
    uploadFile,
    deleteFile,
    getContent,
    getCsv
}