const csvConvert = require('../../server/models/csvConvert');
const jsonConvert = require('../../server/models/jsonConvert');
const xmlConvert = require('../../server/models/xmlConvert');
const fs = require('fs');
const hashControl = require('../../server/models/hashLib')

hashControl = new hashControl();

module.exports = class handler {
    csv(ids) {
        csvConvert.to2dArray(ids);
    }
    json(ids) {
        jsonConvert(ids);
    }
    xml(ids) {
        xmlConvert(ids);
    }
}
