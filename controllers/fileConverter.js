const csvConvert = require('../models/csvConvert');
const jsonConvert = require('../models/jsonConvert');
const xmlConvert = require('../models/xmlConvert');
const fs = require('fs');
const hashControl = require('../models/hashLib')

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
