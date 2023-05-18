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
    downloadFile
  } = require('../controllers/file_controller');

router.get('/', function(req, res, next) {
    res.send('file router respond');
});

router.post('/upload/:format(csv|json|xml)', authentication, upload.single('file'), uploadFile); 
router.post('/delete', authentication, deleteFile);
router.post('/download/:format(csv|json|xml)', authentication, downloadFile)
module.exports = router;

