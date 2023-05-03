let csvConvert = require('../models/csvConvert');
let jsonConvert = require('../models/jsonConvert');
let xmlConvert = require('../models/xmlConvert');
const fs = require('fs');
let tableFunc = require('../models/tableFunc');

tableFunc = new tableFunc();
csvConvert = new csvConvert();

module.exports = class handler {
    async csv(uid, ids) {
        let contents = await tableFunc.openFile(uid, ids);
        return csvConvert.to2dArray(contents);
    }
    json(ids) {
        jsonConvert(ids);
    }
    xml(ids) {
        xmlConvert(ids);
    }
}
