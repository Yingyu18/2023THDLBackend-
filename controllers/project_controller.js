const Project = require('../models/project_model');

const uploadFile = async (req, res)=> {
    console.log("test", req.body)
    if (!req.body.sourceCsvs || !req.body.
        name || !req.body.owner) {
        return res.status(400).send({message:"Bad request"})
    }

    const result = await Project.uploadFile(req)
    if(result.error){
        return res.status(500).send({message:"internal server error"})
    }

    res.status(200).send({
        "fileID": result.toString(),
        "upload_time": new Date(),
        "updated": new Date(),
        "sourceCsvs":req.body.sourceCsvs,
        "name": req.body.name,
        "isMapped": false,
        "owner": req.body.owner,
        "thumbnail": "",
        "description": req.body.description,
        "isBuilt": false,
      })
}

const getProject = async (req, res) => {
    const userId = req.user.userId
    let projects = await Project.getFile(req)
    if(projects.error){
        return res.status(500).send({message:"internal server error"})
    }
    const data = [];
    for (let i = 0; i < projects.length; i++) {
        console.log(projects[i])
        let { fileID, upload_time, fileName, lastModified, isMapped, isBuilt, description, sourceCsvs} = projects[i]
        const owner = projects[i].USER_NAME
        const updated = lastModified
        const thumbnail = ''
        const csvs = await Project.getSourceCsvs(fileID)
        if(csvs.error){
            return res.status(500).send({message:"internal server error"})
        }
        // let sourceCsvs = []
        // for(let i=0; i<csvs.length; i++){
        //     sourceCsvs[i] = csvs[i].csv_name
        // }
        if(isMapped){isMapped=true}else{isMapped=false}
        if(isBuilt){isBuilt=true}else{isBuilt=false}
        data.push({ fileID, upload_time, updated, description, sourceCsvs, fileName, isMapped, owner, thumbnail, isBuilt, description })
    }
    let response = {"items": data}
    res.status(200).send(response)

}

const updateProject = async (req, res) => {
    if(req.body.sourceCsvs){
        const result = await Project.updateCsvs(req)
        if(result.error){
            return res.status(500).send({message:"internal server error"})
        }
    }
    let result = await Project.updateProject(req)
    if(result.error){
        return res.status(500).send({message:"internal server error"})
    }
    const csvs = await Project.getSourceCsvs(result.fileID)
    if(csvs.error){
        return res.status(500).send({message:"internal server error"})
    }
    let sourceCsvs = []
    for(let i=0; i<csvs.length; i++){
        sourceCsvs[i] = csvs[i].csv_name
    }
    res.status(200).send({
            "fileID": result.fileID,
            "uploaded_time": result.upload_time,
            "updated": result.lastModified,
            "sourceCsvs": sourceCsvs,
            "name": result.fileName,
            "isMapped": result.isMapped,
            "owner": result.USER_NAME,
            "thumbnail": "",
            "isBuilt": result.isBuild,
            "description": req.body.description
    })
}
const deleteProject = async (req, res) => {
    const result = await Project.deleteProject(req)        
    if(result.error){
        return res.status(500).send({message:"internal server error"})
    }
    res.status(200)

}

module.exports = {
    uploadFile,
    getProject,
    updateProject,
    deleteProject
};