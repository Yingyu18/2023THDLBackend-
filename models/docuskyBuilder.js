const axios = require('axios');
const qs = require('qs');

// input values:
//   email: the email of the TWDH Platform, a.k.a the username of T-DocuSky
//   dbtitle: the name of the database to be created
//   xmlstring: the DocuXML file in string format
//
// return value:
//   true: successfully uploaded
//   false: upload error

const docuskyBuilder = async (email, dbtitle, xmlstring) => {
  await axios
    .post(
      'https://maxwell.csie.ntu.edu.tw/DocuSky/webApi/uploadTWDHXmlFileToBuildDB.php',
      qs.stringify({
        username: email,
        dbtitle: dbtitle,
        xmlstring: xmlstring,
      })
    )
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error.response.data);
      return false;
    });

    return true;
};

module.exports = {
  docuskyBuilder,
};
