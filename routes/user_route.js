var express = require('express');
const { route } = require('.');
const app = require('../app');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


const {
  authentication
} = require('../util/util')

const {
  signUp,
  signupAuth,
  login,
  getUserInfo,
  updatePassword,
  updateUserInfo
} = require('../controllers/user_controller');





router.post('/signup', signUp)
router.post('/login', login)
router.post('/signupAuth', signupAuth)
router.post('/updatePassword', authentication, updatePassword)
router.post('/updateUserInfo', authentication, updateUserInfo)
router.get('/getUserInfo', authentication, getUserInfo )


module.exports = router;
