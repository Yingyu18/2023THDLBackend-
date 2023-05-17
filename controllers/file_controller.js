const File = require('../models/file_model');

const uploadFile = async (req, res) =>{
    const {userId} = req.user
    var {filename, start} = req.body;
    const { format } = req.params;
    const content = req.file.buffer.toString('utf8');
    console.log(content)
    let data = {
        userId: userId,
        filename: filename,
        start: start,
        content: content
    }
    //TODO: stroe contents into database
    const result = await File.uploadFile(data);
    if(result.error){
        return res.status(500).send({message: "internal server error"})
    }
    res.status(200).json({ message: 'File content store into database successfully' });
}

const deleteFile = async (req, res) => {
    const filesId = req.body
    console.log(req.body)
    console.log(filesId[0])
    //TODO: update database
    const result = await File.deleteFile(filesId);
    console.log(result)
    if(result.error){
        return res.status(500).send({message: "internal server error"})
    }
    console.log("test")
    res.status(200).json({ message: 'File delete frmo database successfully' });
}

module.exports = {
    uploadFile,
    deleteFile
};
