const pool = require("./connection_db")


const uploadFile = async(data) => {
    const conn = await pool.getConnection()
    try{
        const {filename, start, content, userId, uploader, type, size, lastModified, source} = data
        //console.log(data)
        let qryStr = 'INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, upload_time, type, size, source, lastModified) VALUES (?,?,?,?,?,?,?,?,?)'
        const result = conn.query(qryStr, [filename, userId, uploader, start, content, new Date(), type, size, source, lastModified])
        return result
    } catch (error){
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
    let userId = req.query.userId;
    console.log(req.query)
    const conn = await pool.getConnection()
    try{
        let qryStr = `SELECT * FROM file_db WHERE USER_ID = ? AND type = ?`
        var results = await conn.query(qryStr, [userId, "csv"])
        console.log("result", results)
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