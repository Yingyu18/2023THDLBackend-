var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer();
const bodyParser = require('body-parser')
const {
  saveJson,
} = require('../file/save');

const {
    authentication
  } = require('../util/util')

const {
    uploadFile,
    deleteFile,
    downloadFile,
    getFile,
    getCsv,
    updateFile
  } = require('../controllers/file_controller');

router.get('/', function(req, res, next) {
    res.send('file router respond');
});

//create file
router.post('/create', authentication, upload.single('file'), uploadFile)
router.patch('/updateCsv/:id', authentication, updateFile)

//delete file
router.delete('/delete/:id', authentication, deleteFile)

//download file
router.get('/download/:id', authentication, downloadFile)

//get file information
router.get('/getCsvs', authentication, getCsv)
router.post('/save', bodyParser.json(), authentication, saveJson);

module.exports = router;

