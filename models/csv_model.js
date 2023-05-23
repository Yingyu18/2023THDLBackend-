var fs = require('fs');
let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');
let jsConv = require('./json_model');

jsConv = new jsConv();
tableFunc = new tableFunc();
cleaner = new cleaner();

class csvConverter {

    core = [['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
    '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
    '相關組織', '關鍵詞', '摘要/全文'], ['filename', 'doc_source', 'metadata/doc_source', 'metadata/doc_source.href', 'title', 'doctype',
    'compilation_name', 'metatags/categoryABC', 'time_orig_str', 'year_for_grouping', 'timeseq_not_before', 'timeseq_not_after', 'metatags/PersonName',
     'metatags/PlaceName', 'metatags/Organization', 'metatags/Keywords', 'doc_content']];

    to2dArray (jid, sidx, type) {
        let temp = tableFunc.openForProject(jid); 
        let contents = temp[0]; 
        let types = temp[1];
        let results = type == 1 ? this.core : tableFunc.openJsonHead(jid, 2);        
        let extra = results[0].length;
        let lines = 2;
        contents.forEach(function(ele, index, ids) { 
            let table = cleaner.rawTable(contents[index]);
            if (type == 1) {table = cleaner.arrangeFormat(types[index], table, sidx[index]);}             
            let corres = new Array (table[idx[index]-1].length);
            for (let i = 0; i < table[idx[index]-1].length; i++) {
                if (table[idx[index]-1][i] == 'no') {corres[i] = -1;}
                else if (results.indexOf(table[idx[index]-1][i]) == -1) {
                    corres[i] = extra;
                    results[0].push(table[idx[index]-1][i]);
                    results[1].push('metadata/'+table[idx[index]-1][i]);
                    extra++;
                } else {corres[i] = results.indexOf(table[idx[index]-1][i]);}
            }            
            for (let i = idx[index]-1; i < table.length; i++) {
                results.push(new Array(extra).fill(''));
                for (let j = 0; j < table[i].length; j++) {
                    if (corres[j] < 0) {continue;}
                    else if (results[lines][corres[j]] == null || results[lines][corres[j]] == '') {
                        results[lines][corres[j]] = table[i][j];
                    } else {
                        results[lines][corres[j]] += ';' + table[i][j];               
                    }
                }
                if (type == 1) {results[lines][8] = table[i][0];}
                lines++;
            } 
        })
        for (let i = 2; i < results.length; i++) {
            if (results[i].length < results[0].length) {
                results[i].push(new Array(results[0].length - results[i].length).fill(''));
            }
        }
        if (type == 2) {result = mergeToJson(result, jid)}
        return results;
    }

    mergeToJson (cont, jid) {
        var js = jsConv.to2d([jid]);
        var len = js.length;
        js[0] = cont[0];
        js[1] = cont[1];
        for (let i = 2; i < len; i++) {
            if (js[i].length < js[0].length) {
                js[i].push(new Array(js[0].length - js[i].length).fill(''));
            }
        }
        for (let i = 2; i < cont.length; i++) {js.push(cont[i]);}
        return js;
    }
    
    async firstMapCheck(fid) {
        let map = tableFunc.getMap(fid);
        if (map == null || map.includes(',,') || map === '') {
            return false;
        } else {return true;}
    }
    async secondMapCheck(fid, pid) {
        let map = tableFunc.getSecMap(fid, pid);
        if (map == null || map.includes(',,') || map === '') {
            return false;
        } else {return true;}
    }
}

module.exports = csvConverter;