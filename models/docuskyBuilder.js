const axios = require('axios');
const qs = require('qs');

// input values:
//   username: the username of the TWDH Platform, same as that of T-DocuSky
//   dbtitle: the name of the database to be created
//   xmlstring: the DocuXML file in string format
//
// return value:
//   the URL of the docusky database just created

const docuskyBuilder = async (username, dbtitle, xmlstring) => {
  await axios
    .post(
      'https://maxwell.csie.ntu.edu.tw/DocuSky/webApi/uploadTWDHXmlFileToBuildDB.php',
      qs.stringify({
        username,
        dbtitle,
        xmlstring,
      })
    )
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error.response.data);
      return '';
    });

    return `https://maxwell.csie.ntu.edu.tw/DocuSky/webApi/webpage-search-3in1.php?target=USER&db=${dbtitle}&corpus=${dbtitle}`;
};

module.exports = {
  docuskyBuilder,
};
