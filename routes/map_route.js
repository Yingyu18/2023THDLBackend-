var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')



const {
    authentication
  } = require('../util/util')

const {
    projectMapping,
    selectMapping,
    savemap,
    getmap,
    savePreSet,
    delPreSet,
    retrieveMapped,
    changeRow
  } = require('../controllers/map_controller');

router.get('/', function(req, res, next) {
    res.send('file router respond');
});

router.post('/projectMapping', bodyParser.json(), authentication, projectMapping);
router.post('/selectMapping', bodyParser.json(), authentication, selectMapping);
router.post('/savemap', bodyParser.json(), authentication, savemap);
router.post('/savePreSet', bodyParser.json(), authentication, savePreSet);
router.post('/deletePreSet', bodyParser.json(), authentication, delPreSet);
router.post('/getmap', bodyParser.json(), authentication, getmap);
router.post('/retrieveMapped', bodyParser.json(), authentication, retrieveMapped);
router.post('/changeRow', bodyParser.json(), authentication, changeRow);
module.exports = router;
