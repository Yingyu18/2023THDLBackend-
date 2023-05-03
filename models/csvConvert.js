var fs = require('fs');
let cleaner = require('../models/cleaners');
let tableFunc = require('../models/tableFunc');


tableFunc = new tableFunc();
cleaner = new cleaner();

class csvConverter {

    to2dArray (contents) { 

        let results = [['唯一編碼', '來源系統', '來源系統縮寫', '文件原系統頁面URL', '題名', '檔案類型',
        '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
        '相關組織', '關鍵詞', '摘要/全文']];
        let extra = 16;
        let lines = 0;
        
        contents.forEach(function(ele, index, ids) {        
            let table = cleaner.rawTable(cleaner.recover(contents[index]));                      
            if (table[0][0].substring(1, 5) == '國史館檔') {  
                table = cleaner.clean(1, table);
                let corres = [-1];
                let curRow = 3;
                let success = 0;                         
                for (let j = 1; j < table[curRow].length; j++) {
                    let hd = table[curRow][j];
                    switch (hd) {
                        case '入藏登錄號':
                            corres.push(1);
                            success++;
                            break; 
                        case '卷名':
                            corres.push(6);
                            success++;
                            break; 
                        case '檔案系列':
                            corres.push(7);
                            success++;
                            break; 
                        case '題名摘要':
                            corres.push(4);
                            success++;
                            break; 
                        case '卷件開始日期':
                            corres.push(10);
                            success++;
                            break;
                        case '卷件結束日期':
                            corres.push(11);
                            success++;
                            break;
                        case '數位典藏號':
                            corres.push(0);
                            success++;
                            break;
                        case '':
                            corres.push(-1);
                            break;
                        default:
                            corres.push(extra);
                            results[0].push(hd);
                            extra++;
                    }
                }
                if (success != 7) {
                    return '錯誤: 缺乏核心欄位';
                }
                curRow++;
                while (curRow < table.length) {
                    if (table[curRow].length != table[3].length) {
                        curRow++;
                        continue;
                    }
                    lines++;
                    results.push(Array(extra+1).fill(''));
                    for (let i = 1; i < table[curRow].length; i++) {
                        if (corres[i] == -1) {continue;}
                        results[lines][corres[i]] = table[curRow][i];
                    }
                    results[lines][0] = 'AHCMS-' + results[lines][0];
                    results[lines][1] = '國史館檔案史料文物查詢系統';
                    results[lines][2] = 'AHCMS';
                    results[lines][9] = results[lines][10].substring(0, 4);
                    curRow++;
                }       
            }

            else if (table[0][0].substring(1, 5) == '國史館臺') {
                table = cleaner.clean(2, table);
                console.log(table);
                let corres = [-1];
                let curRow = 3;
                let success = 0;                         
                for (let j = 1; j < table[curRow].length; j++) {
                    let hd = table[curRow][j];
                    switch (hd) {
                        case 'data_type':
                            corres.push(5);
                            success++;
                            break; 
                        case '數位典藏號':
                            corres.push(0);
                            success++;
                            break; 
                        case 'title':
                            corres.push(4);
                            success++;
                            break; 
                        case '檔案系列':
                            corres.push(7);
                            success++;
                            break; 
                        case 'date_from':
                            corres.push(10);
                            success++;
                            break;
                        case 'date_stop':
                            corres.push(11);
                            success++;
                            break;
                        case '':
                            corres.push(-1);
                            break;
                        default:
                            corres.push(extra);
                            results[0].push(hd);
                            extra++;
                    }
                }
                if (success != 6) {
                    return '錯誤: 缺乏核心欄位';
                }
                curRow++;
                while (curRow < table.length) {
                    if (table[curRow].length != table[3].length) {
                        curRow++;
                        continue;
                    }
                    lines++;
                    results.push(Array(extra+1).fill(''));
                    for (let i = 1; i < table[curRow].length; i++) {
                        if (corres[i] == -1) {continue;}
                        results[lines][corres[i]] = table[curRow][i];
                    }
                    results[lines][0] = 'AHTWH-' + results[lines][0];
                    results[lines][1] = '國史館臺灣文獻館典藏管理系統';
                    results[lines][2] = 'AHTWH';
                    results[lines][9] = results[lines][10].substring(0, 4);
                    curRow++;
                }
            }
            else if (table[0][0].substring(1, 3) == '臺灣') {
                table = cleaner.clean(3, table);                
                let corres = [-1];
                let curRow = 3;
                let success = 0;                         
                for (let j = 1; j < table[curRow].length; j++) {
                    let hd = table[curRow][j];
                    switch (hd) {
                        case '資料集':
                            corres.push(5);
                            success++;
                            break; 
                        case '典藏號':
                            corres.push(0);
                            success++;
                            break; 
                        case '瀏覽階層':
                            corres.push(7);
                            success++;
                            break; 
                        case '日期描述':
                            corres.push(10);
                            success++;
                            break; 
                        case '內容摘要':
                            corres.push(4);
                            success++;
                            break;
                        case '':
                            corres.push(-1);
                            break;
                        default:
                            corres.push(extra);
                            results[0].push(hd);
                            extra++;
                    }
                }
                if (success != 5) {
                    return '錯誤: 缺乏核心欄位';
                }
                curRow++;
                while (curRow < table.length) {
                    if (table[curRow].length != table[3].length) {
                        curRow++;
                        continue;
                    }
                    lines++;
                    results.push(Array(extra+1).fill(''));
                    for (let i = 1; i < table[curRow].length; i++) {
                        if (corres[i] == -1) {continue;}
                        else if (corres[i] == 10) {
                            results[lines][corres[i]] = table[curRow][i].substring(0, 10);
                            results[lines][11] = table[curRow][i].substring(13);
                        }
                        else {results[lines][corres[i]] = table[curRow][i];}
                    }
                    results[lines][0] = 'NDAP-' + results[lines][0];
                    results[lines][1] = '臺灣省議會史料總庫';
                    results[lines][2] = 'NDAP';
                    results[lines][9] = results[lines][10].substring(0, 4);
                    curRow++;
                }
            }
            else if (table[0][0].substring(1, 3) == '地方') {
                table = cleaner.clean(0, table);
                let corres = [-1];
                let curRow = 4;
                let success = 0;                         
                for (let j = 1; j < table[curRow].length; j++) {
                    let hd = table[curRow][j];
                    switch (hd) {
                        case '典藏序號':
                            corres.push(0);
                            success++;
                            break; 
                        case '資料類型':
                            corres.push(5);
                            success++;
                            break; 
                        case '書目名稱':
                            corres.push(6);
                            success++;
                            break; 
                        case '類別階層':
                            corres.push(7);
                            success++;
                            break; 
                        case '日期起':
                            corres.push(10);
                            success++;
                            break;
                        case '日期迄':
                            corres.push(11);
                            success++;
                            break;
                        case '內容摘要':
                            corres.push(4);
                            success++;
                            break;
                        case '會議主席':
                            corres.push(12);
                            success++;
                            break;
                        case '提案議員':
                            corres.push(12);
                            success++;
                            break;
                        case '相關議員':
                            corres.push(12);
                            success++;
                            break;
                        case '請願人':
                            corres.push(12);
                            success++;
                            break;
                        case '機關':
                            corres.push(14);
                            success++;
                            break;
                        case '相關機關':
                            corres.push(14);
                            success++;
                            break;
                        case '請願機關':
                            corres.push(14);
                            success++;
                            break;
                        case '':
                            corres.push(-1);
                            break;
                        default:
                            corres.push(extra);
                            results[0].push(hd);
                            extra++;
                    }
                }
                if (success != 14) {
                    return '錯誤: 缺乏核心欄位';
                }
                curRow++;
                while (curRow < table.length) {
                    if (table[curRow].length != table[4].length) {
                        curRow++;
                        continue;
                    }
                    lines++;
                    results.push(Array(extra+1).fill(''));
                    for (let i = 1; i < table[curRow].length; i++) {
                        if (corres[i] == -1) {continue;}
                        else if ((corres[i] == 12 || corres[i] == 14) && results[lines][corres[i]].length >= 1 && table[curRow][i].length != 0) {                           
                            results[lines][corres[i]] += '、' + table[curRow][i]; 
                        }
                        else if (table[curRow][i].length != 0) {results[lines][corres[i]] = table[curRow][i];}
                    }
                    results[lines][0] = 'tlcda-' + results[lines][0];
                    results[lines][1] = '地方議會議事錄';
                    results[lines][2] = 'tlcda';
                    results[lines][9] = results[lines][10].substring(0, 4);
                    curRow++;
                }
            }

            
        })
        for (let i = 1; i < results.length; i++) {
            if (results[i].length < results[0].length) {
                results[i] = results[i].concat(Array(results[0].length-results[i].length).fill(''));
            }
        }
        return results;         
    }
}


module.exports = csvConverter;
