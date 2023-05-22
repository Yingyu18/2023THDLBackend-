const pool = require("./connection_db")

const uploadFile = async(req) => {
    const conn = await pool.getConnection();
    try {
        const {sourceCsvs, name, is_mapped, owner, is_build} = req.body
        const {userId} = req.user
        let qryStr = `INSERT INTO file_db (content, type, Start_Row,upload_time, lastModified, fileName, isMapped, USER_NAME,USER_ID, isBuild)
         VALUES (?,?,?,?,?,?,?,?,?,?)`
        let result = await conn.query(qryStr, ["", "json", 1, new Date(),new Date(), name, is_mapped, owner, userId, is_build])
        const project_id = result.insertId;
        // insert into sourceCsvs
        for(let i=0; i<sourceCsvs.length; i++){
            qryStr = `INSERT INTO source_csvs (project_id, csv_name) VALUES (?,?)`
            result = await conn.query(qryStr, [project_id, sourceCsvs[i]])
        }
        return project_id
    } catch (error){
        console.log(error)
        return {error}
    }
}

const getFile = async(req) => {
    let userId = req.user.userId;
    console.log(req.query)
    const conn = await pool.getConnection()
    try{
        let qryStr = `SELECT * FROM file_db WHERE USER_ID = ? AND type = ?`
        var results = await conn.query(qryStr, [userId, "json"])
        console.log("result", results)
        return results
    } catch (error){
        console.log(error)
        return {error}
    }
}
const getSourceCsvs = async(projectId) =>{
     const conn = await pool.getConnection()
     try{
        let qryStr = `SELECT * FROM sourceCsvs WHERE  project_id = ? `
        let results = await conn.query(qryStr, [projectId])
        console.log(results)
        return results
     } catch (error){
        console.log({error:error})
     }
}

const updateProject = async(req) => {
    const conn = await pool.getConnection()
    const projectId = req.params.id
    try{
        const {name, is_mapped, owner, is_build, content} = req.body
        if(name){
            const result = await conn.query('UPDATE file_db SET fileName=? WHERE fileID=?',[name, projectId])
        }
        if(is_mapped){
            const result = await conn.query('UPDATE file_db SET isMapped=? WHERE fileID=?',[is_mapped, projectId])
        }
        if(owner){
            const result = await conn.query('UPDATE file_db SET USER_NAME=? WHERE fileID=?',[owner, projectId])
        }
        if(is_build){
            const result = await conn.query('UPDATE file_db SET isBuild=? WHERE fileID=?',[is_build, projectId])
        }
        if(content){
            const result = await conn.query('UPDATE file_db SET content=? WHERE fileID=?',[content, projectId])
        }
        const results = await conn.query(`SELECT * FROM file_db WHERE fileID = ?`, [projectId]);
        return results[0];
    } catch (error){
        console.log({error:error})
    }
}

const updateCsvs = async (req) => {
    const conn = await pool.getConnection()
    const projectId = req.params.id
    try{
        const {sourceCsvs} = req.body
        const result = await conn.query(`DELETE FROM source_csvs WHERE project_id = ?`, [projectId])
        for(let i=0; i<sourceCsvs.length; i++){
            const result = await conn.query(`INSERT INTO source_csvs (project_id, csv_name) VALUES (?,?)`, [projectId, sourceCsvs[i]])
        }
        // TODO : return data
    }  catch (error){
        console.log({error:error})
    }
}

const deleteProject = async (req) => {
    const conn = await pool.getConnection()
    const projectId = req.params.id
    try{
        const result = await conn.query(`DELETE FROM file_db WHERE fileID = ?`, [projectId])
        result = await conn.query(`DELETE FROM source_csvs WHERE project_id = ?`, [projectId])
    }  catch (error){
        console.log({error:error})
    }

}

module.exports = {
    uploadFile,
    getFile,
    getSourceCsvs,
    updateProject,
    updateCsvs,
    deleteProject
}