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

    async buildXml(js, corpus_name, pid, uid, email, uname) {
        var tags = await jsonConvert.getTg(pid);
        if (tags.error) {tags = '';}
        else {tags = tags.split(',');}
        var xml = await XMLConvert.toXML(js, corpus_name, tags);
        let res = await XMLConvert.saveXML(xml, pid, uid, corpus_name, uname); 
        var bres = await docuskyBuilder(email, corpus_name, xml)
        if (bres) {let temp = await tableFunc.setBuilt(pid);}
        return {
            "canBeBuild" : bres,
            "xml_id": res
        };
        
    }
    async retrieve2D(pid) {
        const result = await jsonConvert.to2D(pid);
        let ck = await jsonConvert.needMapCheck(pid);
        if (result.error) {return result.error;}
        if (ck) {return result;}
        else {return {error: "plz finish mapping ur CSVs before editing."}}
    }
    async append(fid, pid) {
       let res = await jsonConvert.insertNewCSV(fid, pid);       
       res = await jsonConvert.resetMapStatus(pid);
       return {'message': 'insert done.'}
    }

    async getTags(pid) {
        let results = await jsonConvert.getTg(pid);   
        return results;
     }
     
     async saveTags(pid, tag) {
        let results = await jsonConvert.saveTg(pid, tag);       
        return results;
     }
}
