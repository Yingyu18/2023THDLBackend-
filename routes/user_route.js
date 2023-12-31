var express = require('express');
var fs = require('fs')
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
  destination: (req, file, cb) => {
    const directory = `./avatar/${req.user.userId.toString()}`;
    // Check if the directory exists
    if (!fs.existsSync(directory)) {
      // Create the directory if it doesn't exist
      fs.mkdirSync(directory, { recursive: true });
    }
    const path = `avatar/${req.user.userId.toString()}`
    cb(null, path);
  },
    //cb(null, `avatar/${req.user.userId}`)
  filename: (req, file, cb) => {
    const uniqueFileName = Math.floor(Math.random() * 10000).toString();
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
router.patch('/updateUserInfo/:id', authentication, uploadAvatar.single('avatar') , updateUserInfo)
router.get('/getUserInfo', authentication, getUserInfo)


module.exports = router;
