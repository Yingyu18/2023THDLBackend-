var express = require('express');
var router = express.Router();



const {
    authentication
  } = require('../util/util')

const {
    projectMapping,
    fileMapping,
    savemap,
    getmap
  } = require('../controllers/map_controller');

router.get('/', function(req, res, next) {
    res.send('file router respond');
});

router.post('/projectMapping', authentication, projectMapping); 
router.post('/fileMapping', authentication, fileMapping);
router.post('/savemap', authentication, savemap);
router.post('/getmap', authentication, getmap);
module.exports = router;
