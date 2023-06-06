const pool = require("./connection_db")


const uploadFile = async(req) => {
    const conn = await pool.getConnection();
    try {
        const {sourceCsvs, name, is_mapped, owner, is_built, description} = req.body
        const {userId} = req.user
        let qryStr = `INSERT INTO file_db (content, type, Start_Row, upload_time, updated, fileName, USER_NAME, USER_ID, sourceCsvs, description)
         VALUES (?,?,?,?,?,?,?,?,?,?)`
        //console.log(`${sourceCsvs}`)
        let result = await conn.query(qryStr, ["", "json", 1, new Date().getTime().toString(), new Date().getTime().toString(), name, owner, userId, `${sourceCsvs}`, description])
        const project_id = result.insertId;

        // insert into sourceCsvs
        for(let i=0; i<sourceCsvs.length; i++){
            qryStr = `INSERT INTO source_csvs (project_id, csv_id) VALUES (?,?)`
            result = await conn.query(qryStr, [project_id, sourceCsvs[i]])
        }
        return project_id
    } catch (error){
        console.log({error:error})
        return {error}
    } finally {
        await conn.release();
    }
}

//get projects
const getFile = async(req) => {
    let userId = req.user.userId;
    console.log(req.query)
    const conn = await pool.getConnection()
    try{
        let qryStr = `SELECT * FROM file_db WHERE USER_ID = ? AND type = ?`
        var results = await conn.query(qryStr, [userId, "json"])
        //console.log("result", results)
        return results
    } catch (error){
        console.log(error)
        return {error}
    } finally {
        await conn.release();
    }
}
const getProject = async(req) => {
    let id = req.params.id
    const conn = await pool.getConnection()
    try{
        let qryStr = `SELECT * FROM file_db WHERE fileID = ?`
        var results = await conn.query(qryStr, [id])
        //console.log("result", results)
        return results[0]
    } catch (error){
        console.log(error)
        return {error:error}
    } finally {
        await conn.release();
    }
}

const getSourceCsvs = async(projectId) =>{
     const conn = await pool.getConnection()
     try{
        let qryStr = `SELECT * FROM source_csvs WHERE  project_id = ? `
        let results = await conn.query(qryStr, [projectId])
        //console.log(results)
        return results
     } catch (error){
        console.log({error:error})
     } finally {
        await conn.release();
    }
}

const updateProject = async(req) => {
    const conn = await pool.getConnection()
    const projectId = req.params.id
    try{
        const {name, map, xml_id, source, size, url, upload_time, updated, is_mapped, owner, is_built, content, sourceCsvs, description} = req.body
        if(name != undefined){
            const result = await conn.query('UPDATE file_db SET fileName=? WHERE fileID=?',[name, projectId])
        }
        // //Start_Row
        // if(start != undefined){
        //     const result = await conn.query('UPDATE file_db SET Start_Row=? WHERE fileID=?',[start, projectId])
        // }
        //map
        if(map != undefined){
            const result = await conn.query('UPDATE file_db SET map=? WHERE fileID=?',[map, projectId])
        }
        //cores_xml_id
        if(xml_id != undefined){
            const result = await conn.query('UPDATE file_db SET cores_xml_id=? WHERE fileID=?',[xml_id, projectId])
        }
        //source
        if(source != undefined){
            const result = await conn.query('UPDATE file_db SET source=? WHERE fileID=?',[source, projectId])
        }
        //size 
        if(size != undefined){
            const result = await conn.query('UPDATE file_db SET size=? WHERE fileID=?',[size, projectId])
        }
        //url
        if(url != undefined){
            const result = await conn.query('UPDATE file_db SET url=? WHERE fileID=?',[url, projectId])
        }
        //upload_time
        if(upload_time != undefined){
            const result = await conn.query('UPDATE file_db SET upload_time=? WHERE fileID=?',[upload_time, projectId])
        }
        //updated
        if(updated != undefined){
            const result = await conn.query('UPDATE file_db SET lastModified=? WHERE fileID=?',[updated, projectId])
        }
        if(is_mapped != undefined){
            const result = await conn.query('UPDATE file_db SET isMapped=? WHERE fileID=?',[is_mapped, projectId])
        }
        if(owner != undefined){
            const result = await conn.query('UPDATE file_db SET USER_NAME=? WHERE fileID=?',[owner, projectId])
        }
        if(is_built != undefined){
            const result = await conn.query('UPDATE file_db SET isBuilt=? WHERE fileID=?',[is_built, projectId])
        }
        if(content != undefined){
            const result = await conn.query('UPDATE file_db SET content=? WHERE fileID=?',[content, projectId])
        }
        if(sourceCsvs != undefined){
            let result = await conn.query('UPDATE file_db SET sourceCsvs=? WHERE fileID=?',[`${sourceCsvs}`, projectId])
            result = await conn.query('UPDATE file_db SET isMapped=? WHERE fileID=?', [0, projectId])
        }
        if(description != undefined){
            let result = await conn.query('UPDATE file_db SET description=? WHERE fileID=?',[description, projectId])
        }
        await conn.query('UPDATE file_db SET updated=? WHERE fileID=?',[new Date().getTime().toString(), projectId])
        

        const results = await conn.query(`SELECT * FROM file_db WHERE fileID = ?`, [projectId]);
        return results[0];
    } catch (error){
        console.log({error:error})
        return {error}
    } finally {
        await conn.release();
    }
}

const updateCsvs = async (req) => {
    const conn = await pool.getConnection()
    const projectId = req.params.id
    try{
        const {sourceCsvs} = req.body
        const result = await conn.query(`DELETE FROM source_csvs WHERE project_id = ?`, [projectId])
        for(let i=0; i<sourceCsvs.length; i++){
            const result = await conn.query(`INSERT INTO source_csvs (project_id, csv_id) VALUES (?,?)`, [projectId, sourceCsvs[i]])
        }
        // TODO : return data 
        return 1
    }  catch (error){
        return{error}
    } finally {
        await conn.release();
    }
}

const deleteProject = async (req) => {
    const conn = await pool.getConnection()
    const projectId = req.params.id
    try{
        let result = await conn.query(`DELETE FROM file_db WHERE fileID = ?`, [projectId])
        result = await conn.query(`DELETE FROM source_csvs WHERE project_id = ?`, [projectId])
        return result
    }  catch (error){
        console.log({error:error})
        return {error}
    } finally {
        await conn.release();
    }
}

module.exports = {
    uploadFile,
    getFile,
    getSourceCsvs,
    updateProject,
    updateCsvs,
    deleteProject,
    getProject
}