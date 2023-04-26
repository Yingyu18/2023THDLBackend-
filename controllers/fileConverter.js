let csvConvert = require('../models/csvConvert');
let jsonConvert = require('../models/jsonConvert');
let xmlConvert = require('../models/xmlConvert');
const fs = require('fs');
let hashControl = require('../models/hashLib')

hashControl = new hashControl();
csvConvert = new csvConvert();

module.exports = class handler {
    csv(ids) {
        return csvConvert.to2dArray(ids);
    }
    json(ids) {
        jsonConvert(ids);
    }
    xml(ids) {
        xmlConvert(ids);
    }
}
