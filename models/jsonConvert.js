var fs = require('fs');
let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');


tableFunc = new tableFunc();
cleaner = new cleaner();

class jsonConverter {

    toJson (arr) { 
        let js = {
           "columns" : arr[0],
           "xmlTags" : arr[1]
        }
        for (let i = 2; i < arr.length; i++) {
            js["file" + (i-1)] = arr[i];
        }
        return js;       
    }

    to2D (fid) { 
        var js = tableFunc.openFile(fid);
        let arr = new Array();
        for(var k in js) {arr.push(js[k]);}
        return arr;       
    }
               
}


module.exports = jsonConverter;
