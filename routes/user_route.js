var express = require('express');
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
  authRefresh,
  forgetPassword,
  getUserInfo,
  updatePassword,
  updateUserInfo
} = require('../controllers/user_controller');


const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'avatar/',
  filename: (req, file, cb) => {
    const uniqueFileName = req.user.userId;
    cb(null, uniqueFileName);
  },
});
const uploadAvatar = multer({storage});

router.post('/signup', signUp)
router.post('/login', login)
router.post('/signupAuth', signupAuth)
router.post('/authRefresh', authentication, authRefresh)
router.post('/forgetPassword', forgetPassword)
router.post('/updatePassword', updatePassword)
router.patch('/updateUserInfo:/id', authentication, uploadAvatar.single('avatar') , updateUserInfo)
router.get('/getUserInfo', authentication, getUserInfo)


module.exports = router;
