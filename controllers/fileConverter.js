const  {
    docuskyBuilder,
  } = require('../models/docuskyBuilder');
let jsonConvert = require('../models/json_model');
let XMLConvert = require('../models/xmlConvert');
const fs = require('fs');
let tableFunc = require('../models/tableFunc');

tableFunc = new tableFunc();
jsonConvert = new jsonConvert();
XMLConvert = new XMLConvert();

module.exports = class handler {
    async tojson(arr) {
        return await jsonConvert.toJson(arr);
    }

    async buildXml(js, corpus_name, pid, uid, email) {
        var xml = XMLConvert.toXML(js, corpus_name);
        let res = XMLConvert.saveXML(xml, pid, uid, corpus_name); 
        var bres = docuskyBuilder(email, corpus_name, xml)
        if (bres) {tableFunc.setBuilt(pid);}
        return {
            "canBeBuild" : bres,
            "xml_id": res
        };
        
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
