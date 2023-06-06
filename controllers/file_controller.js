    require('dotenv').config();
const File = require('../models/file_model');
var fs = require('fs');
const {FILE_URL} = process.env;

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
    fs.appendFile(`./temp_files/${userId.toString()}/${result.insertId.toString()}`, content, function (err) {
        if (err) throw err;
        console.log('Saved into file system');
    });
    if(result.error){
        return res.status(500).send({message: "internal server error"})
    }
    req.url = 1
    req.body = {}
    req.params = {id:result.insertId}
    let cons = await File.updateFile(req)
    if(cons.error){
        return res.status(500).send({message: "internal server error"})
    }
    result  = await File.getCsv(result.insertId)
    res.status(200).json({ 
        id: result.fileID.toString(),
        created: new Date().getTime(),
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
    const filesId = req.params.id
    fs.unlink(`./temp_files/${req.user.userId.toString()}/${filesId}`, function (err) {
        if (err) throw err;
        console.log('File deleted!');
    });
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
    const {id} = req.params
    const {userId} = req.user
    let text = await File.getContent(id);
    const directoryPath = `./temp_files/${req.user.userId.toString()}`;
    fs.mkdir(directoryPath, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating directory:', err);
  } else {
    console.log('Directory created successfully');
  }
});
   //create file
    fs.appendFile(`./temp_files/${userId.toString()}/${id.toString()}`, text, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });

    // fs.unlink('./temp_files/mynewfile1.csv', function (err) {
    //     if (err) throw err;
    //     console.log('File deleted!');
    // });
    return res.status(200).send({url:`${FILE_URL}/${userId.toString()}/${id.toString()}`})
}

const getCsv = async (req, res) => {
    let csvs = await File.getCsvs(req); console.log('123456 = ' + csvs);
    if(csvs.error){
        return res.status(500).send({message:"internal server error"})
    }
    const data = [];
    for (let i = 0; i < csvs.length; i++) {
        let { fileID, upload_time, fileName, type, size, lastModified, source, url} = csvs[i];
        upload_time = upload_time.toString()
        lastModified = lastModified.toString()
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
    let {id} = req.params
    let result = await File.updateFile(req)
    if(result.error){
        return res.status(500).send({message:"internal server error"})
    }
    result = await File.getCsv(id)
    let source = result.source
    if(source === '0'){source = '國史館檔案史料文物'}
    else if(source === '1'){source = '地方議會議事錄總庫';}
    else if(source === '2'){source = '國史館臺灣文獻館';}
    else if(source === '3'){source = '臺灣省議會史料總庫';}
    else if(source === '4'){source = '自定義資料檔案';} 
    res.status(200).send({
        "fileID": id,
        "upload_time": result.upload_time,
        "name": result.fileName,
        "uploader": result.USER_NAME,
        "type": "csv",
        "size": result.size,
        "lastModified": result.lastModified,
        "source": source,
        "url": result.url,
        message:`update file name to ${name} success`,
        updated: new Date().getTime()
})

}

module.exports = {
    uploadFile,
    deleteFile,
    downloadFile,
    getCsv,
    updateFile
};
