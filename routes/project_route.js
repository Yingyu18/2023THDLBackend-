var express = require('express');
var router = express.Router();

const {
    authentication
  } = require('../util/util')

  const {
    uploadFile,
    getProjects,
    getProject,
    updateProject,
    deleteProject
  } = require('../controllers/project_controller');

  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: 'project_image/',
    filename: (req, file, cb) => {
      const uniqueFileName = req.user.userId;
      cb(null, uniqueFileName);
    },
  });
  const uploadImage = multer({storage});


router.delete('/delete/:id', authentication, deleteProject)
router.post('/create', authentication, uploadFile)
router.get('/getProjects', authentication, getProjects)
router.get('/getProject/:id', authentication, getProject)
router.patch('/updateProject/:id', authentication, uploadImage.single('avatar'), updateProject)


module.exports = router;