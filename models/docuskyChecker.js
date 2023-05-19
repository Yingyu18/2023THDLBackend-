const axios = require('axios');
const qs = require('qs');

// input values:
//   email: the email of the TWDH Platform, a.k.a the username of T-DocuSky
//   dbtitle: the name of the database to be created
//
// return value:
//   true: successfully created
//   false: not created yet

const docuskyChecker = async (email, dbtitle) => {
  let status = false;
  await axios
    .post(
      'https://maxwell.csie.ntu.edu.tw/DocuSky/webApi/getTWDHDbListJson.php',
      qs.stringify({
        ownerUsername: email
      })
    )
    .then((response) => {
      let dbList = response.data.message;
      dbList.forEach(element => {
        if (element.db === dbtitle && element.dbStatus === '0') {
          status = true;
        }
      });
    })
    .catch((error) => {
      console.error(error.response);
      return status;
    });

    return status;
};

module.exports = {
  docuskyChecker,
};
