var fs = require('fs');
let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');
let jsConv = require('./json_model');
const pool = require('./connection_db');

jsConv = new jsConv();
tableFunc = new tableFunc();
cleaner = new cleaner();

class csvConverter {

    async to2dArray (jid, sidx, type, maps) {
        let Sysmap = {
            0: ["AHCMS" ,'國史館檔案史料文物查詢系統'],
            2 : ["AHTWH", '國史館臺灣文獻館典藏管理系統'],
            3 : ["NDAP", '臺灣省議會史料總庫'],
            1 : ["tlcda", '地方議會議事錄']
        }

        let temp = await tableFunc.openForProject(jid);
        let contents = temp[0]; 
        let types = temp[1];
        let results = type == 1 ? [['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
        '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
        '相關組織', '關鍵詞', '摘要/全文'], ['filename', 'doc_source', 'metadata/doc_source', 'metadata/doc_source.href', 'title', 'doctype',
        'compilation_name', 'metatags/categoryABC', 'time_orig_str', 'year_for_grouping', 'timeseq_not_before', 'timeseq_not_after', 'metatags/PersonName',
         'metatags/PlaceName', 'metatags/Organization', 'metatags/Keywords', 'doc_content']] : await tableFunc.getJsonHead(jid, 2);      
        let extra = results[0].length;
        let lines = 2;
        for (let k = 0; k < contents.length; k++) {
            let table = await cleaner.rawTable(contents[k]);
            table = await cleaner.arrangeFormat(types[k], table, sidx[k]);             
            let corres = new Array (table[sidx[k]-1].length);
            
            for (let i = 0; i < maps[k].length; i++) {
                if (maps[k][i] == 'no') {corres[i] = -1;}
                else if (maps[k][i] == '' || results[0].indexOf(maps[k][i]) == -1) {
                    corres[i] = extra;
                    if (maps[k][i] == '') {results[0].push(table[sidx[k]-1][i]);}
                    else {results[0].push(maps[k][i]);}
                    results[1].push('metadata/請替自訂欄位設定英文字');
                    extra++;
                } else {corres[i] = results[0].indexOf(maps[k][i]);}
            }  
            for (let i = sidx[k]; i < table.length; i++) {
                results.push(new Array(extra).fill(''));
                if (types[k] == 0) {
                    results[lines][0] = 'AHCMS-';
                    results[lines][1] = '國史館檔案史料文物查詢系統';
                    results[lines][2] = 'AHCMS';
                } else if (types[k] == 1) {
                    results[lines][0] = 'tlcda-';
                    results[lines][1] = '地方議會議事錄';
                    results[lines][2] = 'tlcda';
                } else if (types[k] == 2) {
                    results[lines][0] = 'AHTWH-';
                    results[lines][1] = '國史館臺灣文獻館典藏管理系統';
                    results[lines][2] = 'AHTWH';
                } else if (types[k] == 3) {
                    results[lines][0] = 'NDAP-';
                    results[lines][1] = '臺灣省議會史料總庫';
                    results[lines][2] = 'NDAP';
                }

                for (let j = 0; j < table[i].length; j++) { console.log("i + j = " + lines +'/'+ corres[j]+ "org ----------- is = " + results[lines][corres[j]] + ' ttttttt--------- is = ' + table[i][j]);
                    if (corres[j] < 0 || table[i][j] == null) {continue;}
                    else if (types[k] == 3 && corres[j] == 10) {
                        results[lines][8] = table[i][j].substring(22);
                        results[lines][10] = table[i][j].substring(0, 10);
                        results[lines][11] = table[i][j].substring(11, 21);
                    } else if (corres[j] == 10) {
                        results[lines][8] = table[i][j]; console.log('line ' + lines + ' 起始時間 = ' + table[i][j]);
                    } else if (corres[j] == 11) {
                        results[lines][10] = table[i][j].substring(0, 10); console.log('line ' + lines + ' 結束時間 = ' + table[i][j]);
                        results[lines][11] = table[i][j].substring(11);
                    } else if (corres[j] == 0) {
                        results[lines][corres[j]] += table[i][j];
                    } else if (results[lines][corres[j]] == null || results[lines][corres[j]] == '') {
                        results[lines][corres[j]] = table[i][j];
                    } else {
                        results[lines][corres[j]] += ';' + table[i][j];               
                    }
                }
                lines++;
            } 
        }
        for (let i = 2; i < results.length; i++) {
            if (results[i].length < results[0].length) {
                results[i] = results[i].concat(new Array(results[0].length - results[i].length).fill(''));
            }
        }
        if (type == 2) {results = await this.mergeToJson(results, jid)}
        return results;
    }

    async mergeToJson (cont, jid) {
        var js = await jsConv.to2D([jid]);
        var len = js.length;
        js[0] = cont[0];
        js[1] = cont[1];
        for (let i = 2; i < len; i++) {
            if (js[i].length < js[0].length) {
                js[i].concat(new Array(js[0].length - js[i].length).fill(''));
            }
        }
        console.log('JSLEN = ' + len + '-----CONT len = ' + cont.length);
        for (let i = js.length; i < cont.length - js.length; i++) {js.push(cont[i]);}
        return js;
    }
    
    async firstMapCheck(fid) {
        let map = await tableFunc.getMap(fid);
        if (map == null) {return false;}
        else if (map.includes(',,') || map === '') {return false;} 
        else {return true;}
    }
    async secondMapCheck(fid, pid) {
        let map = await tableFunc.getSecMap(fid, pid);
        if (map == null) {return false;}
        else if (map.includes(',,') || map === '') {return false;}
        else {return true;}
    }

    async allMappedCheck(idxs, type, pid) {
        let conn = await pool.getConnection();
        let sql = "SELECT isMapped from file_DB WHERE fileID = ?";
        if (type == 2) {sql = "SELECT isMapped from sec_map WHERE fileID = ? and map_ID = ?"}
        let rs; 
        for (let i = 0; i < idxs.length; i++) {
            console.log('checking file idx ' + idxs[i]);
            if (type == 1) {rs = await conn.query(sql, [idxs[i]]);}
            else {rs = await conn.query(sql, [idxs[i], pid]);}
            if (rs[0].isMapped == null || rs[0].isMapped == 0) {
                console.log('WTH?????????????');
                conn.release();
                return false;
            }
        }
        conn.release();
        console.log('trruuuuuuuuuuuuue!');
        return true;
    }
}

module.exports = csvConverter;