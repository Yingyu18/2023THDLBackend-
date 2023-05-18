var express = require('express');
var router = express.Router();



const {
    authentication
  } = require('../util/util')

const {
    firstMapping,
    secondMapping,
    saveMapping
  } = require('../controllers/map_controller');

router.get('/', function(req, res, next) {
    res.send('file router respond');
});

router.post('/map/first', authentication, firstMapping); 
router.post('/map/second', authentication, secondMapping);
router.post('/map/save', authentication, saveMapping);
module.exports = router;
