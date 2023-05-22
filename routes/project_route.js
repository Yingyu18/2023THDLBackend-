var express = require('express');
const { route } = require('.');
const app = require('../app');
var router = express.Router();

const {
    authentication
  } = require('../util/util')

  const {
    uploadFile,
    getProject,
    updateProject
  } = require('../controllers/project_controller');

router.post('/create', authentication, uploadFile)
router.get('/getProjects', authentication, getProject)
router.patch('/updateProject/:id', authentication, updateProject)


module.exports = router;