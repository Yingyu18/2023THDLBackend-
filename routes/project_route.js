var express = require('express');
const { route } = require('.');
const app = require('../app');
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


router.delete('/delete', authentication, deleteProject)
router.post('/create', authentication, uploadFile)
router.get('/getProjects', authentication, getProjects)
router.get('/getProject/:id', authentication, getProject)
router.patch('/updateProject/:id', authentication, updateProject)


module.exports = router;