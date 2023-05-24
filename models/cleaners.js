var fs = require('fs');

class cleaner {
    sanitize(str) {
        const map = {
            '&': '&amp',
            '<': '&lt',
            '>': '&gt',
            '"': '&quot',
            "'": '&#x27',
            '/': '&#x2f',
        };
        const reg = /[$<>"'/]/ig;
        return str.replace(reg, (match)=>(map[match]));
    }

   async timeFormat(type, time) {        
        if (time == '' || time == null) {return '0000-00-00';}
        if (time[6] == '-') {time = time.substring(0, 5) + '0' + time.substring(5);}
        if (time.lenght < 10 || time[9] == ' ') {time = time.substring(0, 8) + '0' + time.substring(8);}
        if (type == 3) {
            if (time[19] == '-') {time = time.substring(0, 18) + '0' + time.substring(18);}
            if (time.length != 23) {time = time.substring(0, 22) + '0' + time[22];}
        }
        return time;
    }

// idx = start row - 1
//content.split('\n').split(',')

    csvClean(table, idx) {
        var Equal = table[idx][0].substring(0, 1) == '=' ? 1 : 0;
        var DBLquotes = table[idx][0].substring(0, 1) == '"' ||  table[idx][0].substring(1, 2) == '"' ? 1 : 0;
        for (let i = idx; i < table.length; i++) {  
           // console.log("table cleaning:", table[i])    
            for (let j = 0; j < table[i].length; j++) {
                table[i][j] = table[i][j].substring(Equal+DBLquotes, table[i][j].length - DBLquotes);
            }
        }
        return table;
    }
    
    async arrangeFormat(type, table, idx) {
        let map = {
            0: ["AHCMS" ,'國史館檔案史料文物查詢系統'],
            1 : ["AHTWH", '國史館臺灣文獻館典藏管理系統'],
            2 : ["NDAP", '臺灣省議會史料總庫'],
            3 : ["tlcda", '地方議會議事錄']
        }
        if (type >= 4) {return table;}
        let curRow = idx-1;
        let start = -1;
        let end = -1;
        console.log('tb len = ' + table.length + ',  cur = ' + curRow + 'tb == ' + table);
        for (let j = 1; j < table[curRow].length; j++) {
           if (table[curRow][j] == '卷件開始日期' || table[curRow][j] == 'date_from' || table[curRow][j] == '日期描述' || table[curRow][j] == '日期起') {
                start = j;                
                if ((type == 3) || (start > 0 && end > 0)) {break;}
           }
           if (table[curRow][j] == '卷件結束日期' || table[curRow][j] == 'date_stop' || table[curRow][j] == '日期迄') {
                end = j;                
                if (start > 0 && end > 0) {break;}
            }
            if (table[curRow][j] == '唯一編碼') {
                for (let i = curRow + 1; i < table.length; i++) {
                    table[i][j] = map[types][0] + '-' + table[i][j];
                }
            }
            if (table[curRow][j] == '來源系統') {
                for (let i = curRow + 1; i < table.length; i++) {
                    table[i][j] = map[types][1];
                }
            }
            if (table[curRow][j] == '來源系統縮寫') {
                for (let i = curRow + 1; i < table.length; i++) {
                    table[i][j] = map[types][0];
                }
            }
        }
        curRow++;
        if (type == 3) {
            while (curRow < table.length) {           
                table[curRow][0] = table[curRow][start];
                table[curRow][start] = await this.timeFormat(type, table[curRow][start].substring(0, 10));           
                table[curRow][end] = await this.timeFormat(type, table[curRow][start].substring(13, 23));
                curRow++;
            }
        }
         else {
            while (curRow < table.length) {   
                console.log('st = ' + table[curRow][start] + 'et = ' + table[curRow][end]);        
                table[curRow][0] = table[curRow][start];
                table[curRow][start] = String(table[curRow][start]).replaceAll('/', '-');
                table[curRow][start] = await this.timeFormat(type, table[curRow][start]);           
                table[curRow][0] += '~' + table[curRow][end];
                table[curRow][end] = String(table[curRow][end]).replaceAll('/', '-');
                table[curRow][end] = await this.timeFormat(type, table[curRow][end]);
                curRow++;
            }
        }
        return table;      
    }

    async rawTable (data) {        
        data = data.split('\n');  
        for (let i = 0; i < data.length; i++) {
            data[i] = data[i].split(',');
        }
        if (data[data.length-1] == '') {return data.slice(0, data.length-2);}
        else {return data;} 
    }

    recover(str) {        
        str = str.replaceAll('&amp', '&');
        str = str.replaceAll('&lt', '<');
        str = str.replaceAll('&gt', '>',);
        str = str.replaceAll('&quot', '"');
        str = str.replaceAll('&#x27', "'");
        str = str.replaceAll('&#x2f', '/');
        return str;
    }
}

module.exports = cleaner;