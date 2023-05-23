var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')



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

router.post('/projectMapping', bodyParser.json(), authentication, projectMapping); 
router.post('/fileMapping', bodyParser.json(), authentication, fileMapping);
router.post('/savemap', bodyParser.json(), authentication, savemap);
router.post('/getmap', bodyParser.json(), authentication, getmap);
module.exports = router;
