const Project = require('../models/project_model');

const uploadFile = async (req, res)=> {
    if (!req.body.sourceCsvs || !req.body.name || !req.body.owner) {
        return res.status(400).send({message:"Bad request"})
    }
    const result = await Project.uploadFile(req)
    if(result.error){
        return res.status(500).send({message:"internal server error"})
    }
    req.body.id = result.toString()
    res.status(200).send(req.body)
}

const getProject = async (req, res) => {
    const userId = req.user.userId
    let projects = await Project.getFile(req)
    if(projects.error){
        return res.status(500).send({message:"internal server error"})
    }
    const data = [];
    for (let i = 0; i < projects.length; i++) {
        const { fileID, upload_time, fileName, lastModified, isMapped, isBuild} = projects[i]
        const owner = projects[i].USER_NAME
        const csvs = await Project.getSourceCsvs(fileID)
        if(csvs.error){
            return res.status(500).send({message:"internal server error"})
        }
        data.push({ fileID, upload_time, lastModified, csvs, fileName, isMapped, owner, isBuild })
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
    res.status(200)
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