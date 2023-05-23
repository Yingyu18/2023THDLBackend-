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
    toDocu,
    docuCheck,
    back2Edit
 } = require('../controllers/docu_controller');



router.post('/toDocu', toDocu);
router.post('/check', docuCheck);
router.post('/back2Edit', back2Edit);


module.exports = router;
