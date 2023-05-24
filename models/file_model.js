const pool = require("./connection_db")
const Cleaner = require("./cleaners");
const cleaner = new Cleaner();

const uploadFile = async(data) => {
    const conn = await pool.getConnection()
    try{
        let {filename, content, userId, uploader, size, lastModified, source} = data
 
            if(source === '國史館檔案史料文物'){ source = 0;}
            if(source === '地方議會議事錄總庫'){source = 1;}
            if(source === '國史館臺灣文獻館'){source = 2;}
            if(source === '臺灣省議會史料總庫'){source = 3;}
            if(source ==='自定義資料檔案'){source = 4;} 
        //set start row
        let start = 4; //其他
        if(source === 1){ start=5 } //地方議會
        else if(source === 4){ start=1 } // 自定義
        //clean csv
        var table = []
        var rows = content.split('\n')
        for(let i=0; i<rows.length; i++){
            table[i] = rows[i].split(',')
        }
        console.log(table)
        if(source != 4){
            table = cleaner.csvClean(table, start-1)
        }
        if(source == 3 || source == 2){
            for(let i=3; i<table.length; i++){
                for(let j=1; j<table[i].length; j++){
                    console.log("table[]: ", table[i])
                    table[i][j] = table[i][j].substring(1, table[i][j].length);
                    console.log("table:",table[i][j])
                }
            }
        }
        console.log("after clean: ", table)
        for(let i=0; i<table.length; i++){
            table[i] = table[i].join(',');
        }
        console.log("after merge word ", table)
        table = table.join('\n')
        console.log("after merge row",table)

        // insert Into database
        let qryStr = 'INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, upload_time, size, source, lastModified) VALUES (?,?,?,?,?,?,?,?,?)'
        const result = await conn.query(qryStr, [filename, userId, uploader, start, table, new Date().getTime().toString(), size, source, lastModified])
        return result

    } catch (error){
        console.log({error:error})
        return {error}
    } finally {
        await conn.release();
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
    } finally {
        await conn.release();
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
    } finally {
        await conn.release();
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
    } finally {
        await conn.release();
    }
}

module.exports = {
    uploadFile,
    deleteFile,
    getContent,
    getCsv
}