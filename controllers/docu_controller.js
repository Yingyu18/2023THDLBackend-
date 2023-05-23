
const {
    docuskyChecker,
  } = require('../models/docuskyChecker');

const {
    docuskyBuilder,
  } = require('../models/docuskyBuilder')

const tableFunc = require('../models/tableFunc');
const jModel = require('../models/json_model');

const toDocu = async (req, res) =>{ 
    var pid = req.body.project_id;
    var dbtitle = req.body.dbtitle;
    let result = await docuskyChecker(email, dbtitle);
    
    if (result == true) {res.status(200).json({ message: 'docu DB builded successfully' });}
    else {res.status(400).json({ message: 'docu DB not yet'});}
}

const docuCheck = async (req, res) =>{ 
    var email = req.user.email;
    var dbtitle = req.body.dbtitle;
    let result = await docuskyChecker(email, dbtitle);
    var mes = result ? 'docu DB builded successfully' : 'docu DB is still been builded';
    
    res.status(200).json({
       "done" : result,
       "message": mes
    });    
}

const back2Edit = async (req, res) =>{ 
  var uid = req.user.userID;
  var xml_id = req.body.DocuXML_id; 
  var jid = tableFunc.open2DbyXML(xml_id);
  res.status(200).send(jModel.to2D(jid));    
}

module.exports = {
    toDocu,
    docuCheck,
    back2Edit
};
