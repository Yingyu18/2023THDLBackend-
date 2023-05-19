
const {
    docuskyChecker,
  } = require('../models/docuskyChecker');

const {
    docuskyBuilder,
  } = require('../models/docuskyBuilder');

const docuCheck = async (req, res) =>{ 
    var email = req.body.email;
    var dbname = req.body.dbname;
    let result =  docuskyChecker(email, dbname);
    
    if (result == true) {res.status(200).json({ message: 'docu DB builded successfully' });}
    else {res.status(400).json({ message: 'docu DB not yet'});}
}

module.exports = {
    docuCheck,
};
