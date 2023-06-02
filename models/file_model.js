const pool = require("./connection_db")
const Cleaner = require("./cleaners");
const cleaner = new Cleaner();

const uploadFile = async(data) => {
    const conn = await pool.getConnection()
    try{
        let {filename, content, userId, uploader, size, lastModified} = data
        let sourceNo, source
            // if(content[1] === '國史館檔案史料文物'){ source = 0;}
            // if(source === '地方議會議事錄總庫'){source = 1;}
            // if(source === '國史館臺灣文獻館'){source = 2;}
            // if(source === '臺灣省議會史料總庫'){source = 3;}
            // if(source ==='自定義資料檔案'){source = 4;} 
            console.log("content[1]= ", content[1])
            if(content[7] === '獻'){
                sourceNo = 2;
                source = '國史館臺灣文獻館'
            }
            else if(content[1] === '國'){ 
                sourceNo = 0;
                source = '國史館檔案史料文物'
            }
            else if(content[1] === '地'){
                sourceNo = 1
                source = '地方議會議事錄總庫'
            }
            else if(content[1] === '臺'){
                sourceNo = 3;
                source = '臺灣省議會史料總庫'
            }
            else {
                sourceNo = 4;
                source = '自定義資料檔案'
            } 

        //set start row
        let start = 4; //其他
        if(sourceNo === 1){ start=5 } //地方議會
        else if(sourceNo === 4){ start=1 } // 自定義
        
        //clean csv
        //console.log(content)
        var table = []
        var rows = content.split('\n')
        for(let i=0; i<rows.length; i++){
            table[i] = rows[i].split(',')
        }
        //console.log("ori , : ",table)
        if(sourceNo != 4){
            table = cleaner.csvClean(table, start-1)
        }
        //console.log("after clean , : ",table)
        //console.log("after remove comma: " ,table)
        if(sourceNo == 1){
            table[4][0] = 'no'
            for(let i=4; i<table.length; i++){
                table[i][25] = table[i][26]
                table[i].pop()
            }
        }
        //console.log(table)
        var needShift = table[start-1][0] == 'no'? 1 : 0;
        needShift = table[start-1][0] == 'o'? 1 : 0;
        for(let i=0; i<table.length; i++){
            //console.log(table[i])
            if (needShift == 1 && i >= start - 1) {table[i].shift();}
            table[i] = table[i].join(',');
        }
        //console.log(table[table.length-1])
        table = table.join('\n')
        //console.log("after merge , : ",table)
        // insert Into database
        let qryStr = 'INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, upload_time, size, source, lastModified, isMapped) VALUES (?,?,?,?,?,?,?,?,?,?)'
        const result = await conn.query(qryStr, [filename, userId, uploader, start, table, new Date().getTime().toString(), size, sourceNo, lastModified, 0])
        result.source = source
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

const getCsvs = async(req) => {
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

const getCsv = async(id) => {
    const conn = await pool.getConnection()
    try{
        let qryStr = `SELECT * FROM file_db WHERE fileID = ?`
        var results = await conn.query(qryStr, [id]);
        return results[0] 
    } catch (error){
        console.log(error)
        return {error}
    } finally {
        await conn.release();
    }
}
const insertSecMap = async(data) => {
    const conn = await pool.getConnection()
    const {csvID, projectID, map} = data
    try{
        let qryStr = `INSERT INTO sec_map (fileID, map_ID, sec_map, create_time, isMapped) VALUES (?,?,?,?,?)`
        var results = await conn.query(qryStr, [csvID, projectID, map, new Date(), 1])
        return results
    } catch (error){
        console.log(error)
        return {error}
    } finally {
        await conn.release();
    }
}
const updateFile = async(req) => {
    const conn = await pool.getConnection()
    const {id} = req.params
    const {userId} = req.user
    const {name,start} = req.body
    try{
        if(name!=undefined){
            let qryStr = `UPDATE file_db SET updated=?, fileName = ? WHERE fileID=? AND USER_ID=?`
            var results = await conn.query(qryStr, [new Date().getTime().toString(), name, parseInt(id), userId]);
        }
        if(start != undefined){
            let qryStr = `UPDATE file_db SET updated=?, Start_Row = ? WHERE fileID=? AND USER_ID=?`
            var results = await conn.query(qryStr, [new Date().getTime().toString(), start, parseInt(id), userId]);
        }
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
    getCsvs,
    getCsv,
    insertSecMap,
    updateFile
}