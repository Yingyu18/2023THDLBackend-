var fs = require('fs');
const hashControl = require('../models/hashLib')

hashControl = new hashControl();




class csvConverter {
    to2dArray (ids) {
        
        let results = [['唯一編碼', '來源系統', '來源系統縮寫',	'文件原系統頁面URL', '題名', '檔案類型',
        '書卷名', '(類目階層)', '原始時間記錄', '西元年', '起始時間', '結束時間', '相關人員', '相關地點', 
        '相關組織', '關鍵詞', '摘要/全文']];
        ids.forEach(function(ele, index, ids) {
            let userID = ids[index].substring(0, 17);
            let hashTable = hashControl.getHashMap(userID);
            let format = ids[index].substring(17, 20);
            let table = rawTable('../rawfiles/' + userID + '/' + format + '/' + hashTable.get(ids[index]))
            if (table[0][0].substring(0, 4) == '國史館檔') {}
            else if (table[0][0].substring(0, 4) == '國史館臺') {}
            else if (table[0][0].substring(0, 2) == '臺灣') {}
            else if (table[0][0].substring(0, 2) == '地方') {}
            
        })
        
    }

    rawTable (path) {
        const results = [];
        let data = fs.readFileSync(path, 'utf-8');
        data.split('\n').forEach(line => {
            let row = line.toString().split(',');
            row.forEach(function(ele, index, row) {
                row[index] = row[index].slice(1, -1);
            })
            results.push(row);
        })
        return results;    
    }
}


module.exports = csvConverter;
