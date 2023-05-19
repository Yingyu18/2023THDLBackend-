const pool = require("./connection_db")


const uploadFile = async(data) => {
    const conn = await pool.getConnection()
    try{
        const {filename, start, content, userId} = data
        let qryStr = 'INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, upload_time) VALUES (?,?,?,?,?,?)'
        const result = conn.query(qryStr, [filename, userId, "NULL", start, content, new Date()])
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

module.exports = {
    uploadFile,
    deleteFile,
    getContent
}