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
        let idx = await tableFunc.getRowId(ids);
        let types = await tableFunc.getType(ids);
        let arr = csvConvert.needMapCheck(ids, idx);
        if (arr.length > 0) {
            return {
                "needMap" : 1, 
                "array" : arr
            }
        } else {
            return {
                "needMap" : 0, 
                "array": csvConvert.to2dArray(contents, idx, types)
            }
        }
    }
    json(arr) {
        return jsonConvert.toJson(arr);
    }
    jsonArr(id) {
        return jsonConvert.to2D(id);
    }
    xml(js, corpus_name) {
        XMLConvert.toXML(js, corpus_name);
    }

    async append(id, jid, jhead) {
        let content = await tableFunc.openFile([id]);
        let idx = await tableFunc.getRowId([id]);
        let arr = csvConvert.secMapCheck(id, jid, idx[0]);
        let types = await tableFunc.getType([id]);
        if (arr != 0) { 
            return {
                "needMap" : 1, 
                "array" : arr,
                "json_id": jid,
                "json_head": jhead
            }
        } else {
            return {
                "needMap" : 0, 
                "array" :  csvConvert.mergeToJson(content[0], jid, types[0], idx[0]),
                "json_id": jid,
                "json_head": jhead
            }
        }
    }
}
