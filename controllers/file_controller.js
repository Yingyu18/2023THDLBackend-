const File = require('../models/file_model');
var fs = require('fs');

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
    //stroe contents into database
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
    return res.status(200)
}

module.exports = {
    uploadFile,
    deleteFile,
    downloadFile
};
