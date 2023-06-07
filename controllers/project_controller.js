const Project = require('../models/project_model');
const File = require('../models/file_model');
const MapModel = require("../models/map_model");
const JModel = require("../models/json_model");
const mapModel = new MapModel();
const jModel = new JModel();

const uploadFile = async (req, res)=> {
    //console.log("test", req.body)
    if (!req.body.sourceCsvs || !req.body.name || !req.body.owner) {
        return res.status(400).send({message:"Bad request"})
    }
    const result = await Project.uploadFile(req)
    if(result.error){
        return res.status(500).send({message:result.error})
    }
    const projectID = result
    //update sec_map table
    const {sourceCsvs} = req.body
    let isMapped = 1
    let lastMap = ''
    for(let i=0; i<sourceCsvs.length; i++){
        let id = sourceCsvs[i]
        let result = await File.getCsv(id)
        if(result.error){
            return res.status(500).send({message:"internal server error"})
        }
        //if complete second map, update sec_map
        lastMap = result.map
        // if(isSecMapped(result.map)){
        if(result.isMapped==1){
            let data = {
                csvID: id,
                projectID:projectID,
                map: result.map
            }
            result = await File.insertSecMap(data)
            if(result.error){
                console.log(result.error)
                return res.status(500).send({message:"internal server error"})
            }
        }
        else{
            console.log("isMapped = 0")
            isMapped = 0
        }
    }
    // update project isMapped to 1
    if(isMapped){
        req = {
            body:{
                is_mapped:1
            },
            params:{
                id:projectID
            }
        }
        const result = await Project.updateProject(req)
        if(result.error){
            return res.status(500).send({message:"update isMapped fail"})
        }
        const fid = sourceCsvs[sourceCsvs.length-1]
        const jid = projectID
        mapModel.saveMap(fid, jid, 1, 1, lastMap)
    }

    res.status(200).send({
        "fileID": result.toString(),
        "upload_time": new Date().getTime().toString(),
        "updated": new Date().getTime().toString(),
        "sourceCsvs":req.body.sourceCsvs,
        "name": req.body.name,
        "isMapped": isMapped,
        "owner": req.body.owner,
        "thumbnail": "",
        "description": req.body.description,
        "isBuilt": false,
      })
}

function isSecMapped(map){
    //console.log(map[0], map[map.length-1])
    if (map == null) {return 0;}
    else if(map == '' || map[0] == ',' ||  map[map.length-1] == ','){
        return 0
    }
    for(let i=0; i<map.length-1; i++){
        if(map[i] == ','&&map[i+1] == ',') {
            return 0
        }
    }
    return 1
}

const getProjects = async (req, res) => {
    const userId = req.user.userId
    let projects = await Project.getFile(req)
    if(projects.error){
        return res.status(500).send({message:"internal server error"})
    }
    const data = [];
    for (let i = 0; i < projects.length; i++) {
        //console.log(projects[i])
        let { fileID, upload_time, fileName, updated, isMapped, isBuilt, description, sourceCsvs} = projects[i]
        console.log(projects[i])
        if (isMapped == 0) { isMapped = await mapModel.checkProjectMappedOtherPlace(fileID)}
        if(isMapped == true){
            isMapped=0
        }else{
            isMapped=1
        }
        //return true if isMapped is still 0
        // else if (isMapped is changed to 1)
        upload_time = parseInt(upload_time)
        updated = parseInt(updated)
        let xml_id = projects[i].cores_xml_id
        const owner = projects[i].USER_NAME
        const thumbnail = ''
        const csvs = await Project.getSourceCsvs(fileID)
        if(csvs.error){
            return res.status(500).send({message:"internal server error"})
        }
        sourceCsvs = []
        for(let i=0; i<csvs.length; i++){
            sourceCsvs[i] = csvs[i].csv_id
        }
        if(isMapped){isMapped=true}else{isMapped=false}
        if(isBuilt){isBuilt=true}else{isBuilt=false}
        data.push({ fileID, upload_time, updated, description, sourceCsvs, fileName, isMapped, owner, thumbnail, isBuilt, description, xml_id })
    }
    let response = {"items": data}
    res.status(200).send(response)
}

const getProject = async (req, res) => {
    let project = await Project.getProject(req)
    if(project.error){
        return res.status(500).send({message:"internal server error"})
    }
    project.upload_time = parseInt(project.upload_time)
    project.updated = parseInt(project.updated)
    console.log(project)
    res.status(200).send(project)
}

const updateProject = async (req, res) => {
    let result;
    if(req.body.sourceCsvs){ 
        const pid = req.params.id;
        const {sourceCsvs} = req.body;
        const fid =  sourceCsvs[sourceCsvs.length-1];
        result = await jModel.insertNewCSV(fid, pid);
        result = await jModel.resetMapStatus(pid);
        result = await Project.updateCsvs(req)
        if(result.error){
            return res.status(500).send({message:"update source_csvs error"})
        }
    }
    result = await Project.updateProject(req)
    if(result.error){
        return res.status(500).send({message:"update file_db error"})
    }
    
    const csvs = await Project.getSourceCsvs(req.params.id);
    if(csvs.error){
        return res.status(500).send({message:"get csvs form source_csvs error"})
    }
    let sourceCsvs = []
    for(let i=0; i<csvs.length; i++){
        sourceCsvs[i] = csvs[i].csv_id;
    }
    res.status(200).send({
            "fileID": result.fileID,
            "uploaded_time": parseInt(result.upload_time),
            "updated": parseInt(result.updated),
            "sourceCsvs": sourceCsvs,
            "name": result.fileName,
            "isMapped": Boolean(result.isMapped),
            "owner": result.USER_NAME,
            "thumbnail": "",
            "isBuilt": Boolean(result.isBuild),
            "description": req.body.description,
            "xml_id": result.core_xml__id,
            "source": result.source,
            "size": result.size,
            "url": result.url,
            "map": result.map,
    })
}
const deleteProject = async (req, res) => {
    const result = await Project.deleteProject(req)      
    if(result.error){
        return res.status(500).send({message:"internal server error"})
    }
    res.status(200).send({message:"delete successfully"})

}

module.exports = {
    uploadFile,
    getProject,
    getProjects,
    updateProject,
    deleteProject
};