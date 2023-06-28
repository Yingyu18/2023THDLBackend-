require('dotenv').config();
const pool = require("./connection_db")
const Cleaner = require("./cleaners");
const cleaner = new Cleaner();
const {FILE_URL} = process.env;

const defaultMap =  {
    "入藏登錄號" : "來源系統", "卷名" : "書卷名", "檔案系列" : "(類目階層)", "題名摘要" : "題名", "卷件開始日期" : "起始時間", "卷件結束日期" : "結束時間", "數位典藏號" : "唯一編碼",
    "data_type" : "檔案類型", "title" : "題名", "date_from" : "起始時間", "date_stop" : "結束時間",
    "資料集" : "檔案類型", "瀏覽階層" : "(類目階層)", "內容摘要" : "題名", "日期描述" : "起始時間", "典藏號" : "唯一編碼",
    "資料類型" : "檔案類型", "書目名稱" : "書卷名", "類別階層" : "(類目階層)", "日期起" : "起始時間", "日期迄" : "結束時間", "典藏序號" : "唯一編碼"
}

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
            if (content.length < 7) {
                sourceNo = 4;
                source = '自定義資料檔案'
            }
            else if(content[4] === '臺' || content[3] === '臺' || content[5] === '臺'){
                sourceNo = 2;
                source = '國史館臺灣文獻館'
            }
            else if(content[4] === '檔' || content[3] === '檔' || content[5] === '檔'){ 
                sourceNo = 0;
                source = '國史館檔案史料文物'
            }
            else if(content[1] === '地' || content[0] === '地' || content[2] === '地'){
                sourceNo = 1
                source = '地方議會議事錄總庫'
            }
            else if(content[1] === '臺' || content[0] === '臺' || content[2] === '臺'){
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
        var needShift = 0;
        if (table[start-1][0] == 'no' || table[start-1][0] == 'o' || table[start-1][0] == '') {
            needShift = 1;
        }
        let mapCont = '';
        for(let i=0; i<table.length; i++){
            if (needShift == 1 && i >= start - 1) {table[i].shift();}
            if (i == start-1) {
                for (let j = 0; j < table[start-1].length; j++) {
                    console.log('mcont == ' + table[start-1][j] + 'and mpcont == ;;' + mapCont + ';;');
                    if (defaultMap[table[start-1][j]]) {mapCont += mapCont.length > 0 ? ',' + defaultMap[table[start-1][j]] : defaultMap[table[start-1][j]];}
                    else {mapCont += ',';}
                }
            }
            table[i] = table[i].join(',');            
        }
        //console.log(table[table.length-1])
        table = table.join('\n')
        //console.log("after merge , : ",table)
        // insert Into database
        let qryStr = 'INSERT INTO file_db (fileName, USER_ID, USER_NAME, Start_Row, content, map, upload_time, size, source, lastModified, isMapped, url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        const result = await conn.query(qryStr, [filename, userId, uploader, start, table, mapCont, new Date().getTime().toString(), size, sourceNo, lastModified, 0, `${FILE_URL}/${userId}/${filename}`])
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
        console.log(result)
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
            var qryStr = `UPDATE file_db SET updated=?, fileName = ? WHERE fileID=? AND USER_ID=?`
            await conn.query(qryStr, [new Date().getTime().toString(), name, parseInt(id), userId]);
            var qryStr = `UPDATE file_db SET updated=?, url=? WHERE fileID=? AND USER_ID=?`
            await conn.query(qryStr, [new Date().getTime().toString(), `${FILE_URL}/${userId}/${name}`, parseInt(id), userId]);
        }
        if(start != undefined){
            var qryStr = `UPDATE file_db SET updated=?, Start_Row = ? WHERE fileID=? AND USER_ID=?`
            await conn.query(qryStr, [new Date().getTime().toString(), start, parseInt(id), userId]);
        }
        // if(req.url != undefined){
        //     let qryStr = `UPDATE file_db SET updated=?, url=? WHERE fileID=? AND USER_ID=?`
        //     var results = await conn.query(qryStr, [new Date().getTime().toString(), `${FILE_URL}/${userId}/${id}`, parseInt(id), userId]);
        // }
        return 0
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