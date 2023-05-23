let csvConvert = require('../models/csvConvert');
let jsonConvert = require('../models/json_model');
let XMLConvert = require('../models/xmlConvert');
const fs = require('fs');
let tableFunc = require('../models/tableFunc');
const pool = require('../models/connection_db');

tableFunc = new tableFunc();
csvConvert = new csvConvert();
jsonConvert = new jsonConvert();
XMLConvert = new XMLConvert();

module.exports = class handler {
    async makeCsv(ids) {
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
    async tojson(arr) {
        return await jsonConvert.toJson(arr);
    }

    async buildXml(js, corpus_name, pid, uid) {
        var xml = XMLConvert.toXML(js, corpus_name);
        let res = XMLConvert.saveXML(xml, pid, uid, corpus_name); 
        return res;
    }
    async retrieve2D(pid) {
        const result = jsonConvert.to2D(pid);
        if (result.error) {return result.error;}
        if (jsonConvert.needMapCheck(pid)) {return result;}
        else {return {error: "plz finish mapping ur CSVs before editing."}}
    }
    async append(fid, pid) {
       let res = jsonConvert.insertNewCSV(fid, pid);
       if (res === 'success') {
         res = jsonConvert.resetMapStatus(pid);
         return res;
       }
       else {return {error: 'insert failed.'}}
    }
}
