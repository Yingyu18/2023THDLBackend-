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

router.post('/first', authentication, firstMapping); 
router.post('/second', authentication, secondMapping);
router.post('/savemap', authentication, saveMapping);
module.exports = router;
