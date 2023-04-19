const csvConvert = require('../models/csvConvert');
const jsonConvert = require('../models/jsonConvert');
const xmlConvert = require('../models/xmlConvert');
var fs = require('fs');


module.exports = class handler {
    csv(ids) {csvConvert(ids);}
    json(ids) {jsonConvert(ids);}
    xml(ids) {xmlConvert(ids);}
}
