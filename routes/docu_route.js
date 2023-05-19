var express = require('express');
const { route } = require('.');
const app = require('../app');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*const {
    authentication
  } = require('../util/util')*/

const {
    docuCheck,
 } = require('../controllers/docu_controller');




router.get('/check', docuCheck)


module.exports = router;
