let csvConvert = require('../models/csvConvert');
let jsonConvert = require('../models/jsonConvert');
let XMLConvert = require('../models/xmlConvert');
const fs = require('fs');
let tableFunc = require('../models/tableFunc');

tableFunc = new tableFunc();
csvConvert = new csvConvert();
jsonConvert = new jsonConvert();
XMLConvert = new XMLConvert();

module.exports = class handler {
    async csv(ids) {
        let contents = await tableFunc.openFile(ids);
        let map = await tableFunc.getRowInfo(ids);
        let idx = await tableFunc.getRowId(ids);
        return csvConvert.to2dArray(contents, map, idx);
    }
    json(arr) {
        return jsonConvert.toJson(arr);
    }
    jsonArr(uid, id) {
        return jsonConvert.to2D(uid, id);
    }
    xml(js, corpus_name) {
        XMLConvert.toXML(js, corpus_name);
    }
}
