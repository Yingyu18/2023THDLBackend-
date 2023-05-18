var fs = require('fs');
let cleaner = require('../models/cleaners');
let tableFunc = require('../models/tableFunc');
const mapModel = require('../models/map_model');
const pool = require('./connection_db');
const jsConv = require('./jsonConvert');


tableFunc = new tableFunc();
cleaner = new cleaner();

class csvConverter {

    core = [['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
    '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
    '相關組織', '關鍵詞', '摘要/全文'], ['filename', 'doc_source', 'metadata/doc_source', 'metadata/doc_source.href', 'title', 'doctype',
    'compilation_name', 'metatags/category (A/B/C)', 'time_orig_str', 'year_for_grouping', 'timeseq_not_before', 'timeseq_not_after', 'metatags/PersonName',
     'metatags/PlaceName', 'metatags/Organization', 'metatags/Keywords', 'doc_content']];

    map = {
        '唯一編碼' : 0,
        '來源系統' : 1,
        '來源系統縮寫' : 2, 
        '文件原系統頁面URL' : 3, 
        '題名' : 4, 
        '檔案類型': 5,
        '書卷名': 6, 
        '(類目階層)': 7, 
        '原始時間記錄': 8, 
        '西元年': 9, 
        '起始時間': 10, 
        '結束時間': 11, 
        '相關人員': 12, 
        '相關地點': 13, 
        '相關組織': 14, 
        '關鍵詞': 15, 
        '摘要/全文': 16 
    }

    needMapCheck(ids, idx) {
        var arr = new Array();
        for (let i = 0; i < ids.length; i++) {
            rs = tableFunc.getMap(ids[i]).split(",");
            if (mapModel.getColInfo(ids[i], idx[i]).length != rs.length()) {
                arr.push(ids[i]);
            }            
        }
        return arr;        
    }
    async secMapCheck(id, jid, idx) {
        const conn = await pool.getConnection();
        var sql = "select sec_map from sec_map where fileID = ? and json_ID = ?";
        var res = await conn.query(sql, id, jid);
        if (res[0].sec_map == null || res[0].sec_map.split(",").length != tableFunc.getColInfo(id, idx).length) {
            return tableFunc.getColInfo(id, idx);
        } 
        else {return 0;}
    }

    to2dArray (contents, idx, types) { 
        let results = this.core;        
        let extra = 17;
        let lines = 2;
        contents.forEach(function(ele, index, ids) { 
            let table = cleaner.rawTable(contents[index]);
            table = cleaner.cleanFuckingDogShitPieceOfTrashOfUselessFuckersFuckingCSV(table, idx[index]-1);
            table = cleaner.arrangeFormat(types[index], table, idx[index]);             
            let corres = new Array (table[idx[index]-1].length);
            for (let i = 0; i < table[idx[index]-1].length; i++) {
                let tempmap = this.map;
                if (table[idx[index]-1][i] == 'no') {corres[i] = -1;}
                else if (tempmap[table[idx[index]-1][i]] == null) {
                    tempmap[table[idx[index]-1][i]] = extra;
                    corres[i] = extra;
                    results[0].push(table[idx[index]-1][i]);
                    results[1].push('metadata/'+table[idx[index]-1][i]);
                    extra++;
                } else {corres[i] = tempmap[table[idx[index]-1][i]];}
            }            
            for (let i = idx[index]-1; i < table.length; i++) {
                results.push(new Array(extra).fill(''));
                for (let j = 0; j < table[i].length; j++) {
                    if (corres[j] < 0) {continue;}
                    else if (results[lines][corres[j]] == null) {
                        results[lines][corres[j]] = table[i][j];
                    } else {
                        results[lines][corres[j]] = ';' + table[i][j];               
                    }
                }
                if (types[idx] < 4) {results[lines][8] = table[i][0];}
                lines++;
            } 
        })
        for (let i = 2; i < results.length; i++) {
            if (results[i].length < results[0].length) {
                results[i].push(new Array(results[0].length - results[i].length).fill(''));
            }
        }
        return results;
    }

    mergeToJson (cont, jid, tp, idx) {
        var js = jsConv.to2d([jid]);
        let tempmap = {}
        cont = cleaner.rawTable(cont);
        cont = cleaner.cleanFuckingDogShitPieceOfTrashOfUselessFuckersFuckingCSV(cont, idx-1);
        cont = cleaner.arrangeFormat(tp, cont, idx);             
        let corres = new Array (cont[idx-1].length);
        let extra = js[0].length;
        let lines = js.length;
        for (let i = 0; i < js[0].length; i++) {
            tempmap[js[0][i]] = i;
        }
        for (let i = 0; i < cont[idx-1].length; i++) {
            if (tempmap[cont[idx-1][i]] == null) {
                tempmap[cont[idx-1][i]] = extra;
                corres[i] = extra;
                js[0].push(cont[idx-1][i]);
                js[1].push('metadata/' + cont[idx-1][i]);
                extra++;
            }
        }
        for (let i = idx-1; i < cont.length; i++) {
            js.push(new Array(extra).fill(''));
            for (let j = 0; j < cont[i].length; j++) {
                if (js[lines][j] == null) {js[lines][j] = cont[i][j];}
                else {js[lines][j] += ";" + cont[i][j];}
            }
            lines++;
        }
        for (let i = 2; i < js.length; i++) {
            if (js[i].length < js[0].length) {
                js[i].push(new Array(js[0].length - js[i].length).fill(''));
            }
        }
        return js;
    }
}

module.exports = csvConverter;