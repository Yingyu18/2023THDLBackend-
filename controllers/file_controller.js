const File = require('../models/file_model');

const uploadFile = async (req, res) =>{
    var {filename, start} = req.body;
    const { format } = req.params;
    const content = req.file.buffer.toString('utf8');
    console.log(content)
    //TODO: stroe contents into database
    res.status(200).json({ message: 'File content store into database successfully' });
}

const deleteFile = async (req, res) => {
    const filesId = req.body
    console.log(req.body)
    console.log(filesId[0])
    //TODO: update database
    res.status(200).send("ok") 
}

module.exports = {
    uploadFile,
    deleteFile
};
