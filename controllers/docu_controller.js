
const {
    docuskyChecker,
  } = require('../models/docuskyChecker');

let tableFunc = require('../models/tableFunc');
let jModel = require('../models/json_model');

tableFunc = new tableFunc();
jModel = new jModel();

const docuCheck = async (req, res) =>{ 
    var email = req.user.email;
    var dbtitle = req.body.dbtitle;console.log('email = '+ email + ' title = ' + dbtitle);
    let result = await docuskyChecker(email, dbtitle);
    var mes = result ? 'docu DB builded successfully' : 'docu DB is still been builded';
    
    res.status(200).json({
       "done" : result,
       "message": mes
    });    
}

const back2Edit = async (req, res) =>{ 
  var uid = req.user.userID;
  var xml_id = req.body.DocuXML_id; console.log('xid = ' + xml_id);
  var jid = await tableFunc.open2DbyXML(xml_id);
  var arr = await jModel.to2D(jid)
  res.status(200).send(arr);    
}

module.exports = {
    docuCheck,
    back2Edit
};
