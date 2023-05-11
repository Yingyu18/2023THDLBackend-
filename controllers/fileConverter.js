let csvConvert = require('../models/csvConvert');
let jsonConvert = require('../models/jsonConvert');
let xmlConvert = require('../models/(xxx)xmlConvert');
const fs = require('fs');
let tableFunc = require('../models/tableFunc');

tableFunc = new tableFunc();
csvConvert = new csvConvert();
jsonConvert = new jsonConvert();

module.exports = class handler {
    async csv(uid, ids) {
        let contents = await tableFunc.openFile(uid, ids);
        return csvConvert.to2dArray(contents);
    }
    json(arr) {
        return jsonConvert.toJson(arr);
    }
    jsonArr(uid, id) {
        return jsonConvert.to2D(uid, id);
    }
    xml(ids) {
        xmlConvert(ids);
    }
}
