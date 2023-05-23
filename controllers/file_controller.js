const File = require('../models/file_model');
var fs = require('fs');

const uploadFile = async (req, res) =>{
    const {userId} = req.user
    var {name, uploader, type, size, lastModified, source} = req.body;
    console.log(req.body)
    const { format } = req.params;
    const content = req.file.buffer.toString('utf8');
    if(!name || !uploader){
        return res.status(400).send({message:"Bad request"})
    }
    //TODO: cleaner
    //console.log(content)
    let data = {
        userId: userId,
        filename: name,
        uploader: uploader,
        type: type,
        size: size,
        lastModified: lastModified,
        source: source,
        content: content
    }
    //stroe contents into database
    const result = await File.uploadFile(data);
    if(result.error){
        return res.status(500).send({message: "internal server error"})
    }
    console.log("insert file ID: ", result.insertId)
    res.status(200).json({ 
        id: result.insertId.toString(),
        created: new Date(),
        filedata: name,
        name: name,
        uploader: uploader,
        type: type,
        size: size,
        lastModified: lastModified,
        source: source,
        url: ''
     });
}

const deleteFile = async (req, res) => {

    //console.log(req)
    const filesId = req.params.id
    //console.log(req.body)
    ///console.log(filesId[0])
    // update database
    const result = await File.deleteFile(filesId);
    if(result.error){
        return res.status(500).send(
            {
                "code": 500,
                "message": "Internal server error",
                "data": {}
            }
        )
    }
    res.status(200).json({ message: 'File delete frmo database successfully' });
}


//TODO: complete it
const downloadFile = async (req, res) => {
    // get content from database
    const filesId = req.body
    let text = await File.getContent(filesId);
   //create file
    fs.appendFile('./temp_files/mynewfile1.csv', text, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });

    // fs.unlink('./temp_files/mynewfile1.csv', function (err) {
    //     if (err) throw err;
    //     console.log('File deleted!');
    // });
    const blob = new Blob([text], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    return res.status(200).send({url})
}

const getCsv = async (req, res) => {
    let csvs = await File.getCsv(req);
    if(csvs.error){
        return res.status(500).send({message:"internal server error"})
    }
    const data = [];
    for (let i = 0; i < csvs.length; i++) {
        const { fileID, upload_time, fileName, type, size, lastModified, source, url} = csvs[i];
        const uploader = csvs[i].USER_NAME;
        data.push({ fileID, upload_time, fileName, uploader, type, size, lastModified, source, url });
    }
    let response = {"items": data}
    res.status(200).send(response)
}

module.exports = {
    uploadFile,
    deleteFile,
    downloadFile,
    getCsv
};
