const File = require('../models/file_model');
var fs = require('fs');

const uploadFile = async (req, res) =>{
    console.log("test")
    const {userId} = req.user
    var {name, uploader, type, size, lastModified} = req.body;
    const content = req.file.buffer.toString('utf8');
    //console.log(content)
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
        content: content
    }
    //stroe contents into database
    let result = await File.uploadFile(data);
    if(result.error){
        return res.status(500).send({message: "internal server error"})
    }
    console.log(result)
    console.log("insert file ID: ", result.insertId)
    result  = await File.getCsv(result.insertId)
    res.status(200).json({ 
        id: result.fileID.toString(),
        created: new Date(),
        filedata: name,
        name: name,
        uploader: uploader,
        type: type,
        size: size,
        lastModified: lastModified,
        source: result.source,
        url: result.url
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
    let csvs = await File.getCsvs(req); console.log('123456 = ' + csvs);
    if(csvs.error){
        return res.status(500).send({message:"internal server error"})
    }
    const data = [];
    for (let i = 0; i < csvs.length; i++) {
        let { fileID, upload_time, fileName, type, size, lastModified, source, url} = csvs[i];
        const uploader = csvs[i].USER_NAME;
        if(source === '0'){source = '國史館檔案史料文物'}
        else if(source === '1'){source = '地方議會議事錄總庫';}
        else if(source === '2'){source = '國史館臺灣文獻館';}
        else if(source === '3'){source = '臺灣省議會史料總庫';}
        else if(source === '4'){source = '自定義資料檔案';} 
        else source = "不明來源"
        data.push({ fileID, upload_time, fileName, uploader, type, size, lastModified, source, url });
    }
    let response = {"items": data}
    res.status(200).send(response)
}

const updateFile = async (req, res) => {
    let {name} = req.body
    let result = await File.updateFile(req)
    if(result.error){
        return res.status(500).send({message:"internal server error"})
    }
    res.status(200).send({message:`update file name to ${name} success`})

}

module.exports = {
    uploadFile,
    deleteFile,
    downloadFile,
    getCsv,
    updateFile
};
