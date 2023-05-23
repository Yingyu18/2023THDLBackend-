
const {
    docuskyChecker,
  } = require('../models/docuskyChecker');

let tableFunc = require('../models/tableFunc');
let jModel = require('../models/json_model');

tableFunc = new tableFunc();
jModel = new jModel();

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
    docuCheck,
    back2Edit
};
