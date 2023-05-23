var express = require('express');
const { route } = require('.');
const app = require('../app');
const multer = require('multer');
var router = express.Router();
const upload = multer();



const {
    authentication
  } = require('../util/util')

const {
    uploadFile,
    deleteFile,
    downloadFile,
    getFile,
    getCsv
  } = require('../controllers/file_controller');

router.get('/', function(req, res, next) {
    res.send('file router respond');
});

//create file
router.post('/upload/:format(csv|json|xml)', authentication, upload.single('file'), uploadFile); 
router.post('/create', authentication, upload.single('file'), uploadFile)

//delete file
router.post('/delete', authentication, deleteFile);
router.delete('/delete/:id', authentication, deleteFile)
//download file
router.post('/download/:format(csv|json|xml)', authentication, downloadFile)

//get file information
router.get('/getCsvs', authentication, getCsv)

module.exports = router;

