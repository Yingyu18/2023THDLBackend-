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

    timeFormat(type, time) {
        if (time == '' || time == null) {return '0000-00-00';}
        time = time.replaceAll('/', '-');
        if (time[6] == '-') {time = time.substring(0, 5) + '0' + time.substring(5);}
        if (time.lenght < 10 || time[9] == ' ') {time = time.substring(0, 8) + '0' + time.substring(8);}
        if (type == 3) {
            if (time[19] == '-') {time = time.substring(0, 18) + '0' + time.substring(18);}
            if (time.length != 23) {time = time.substring(0, 22) + '0' + time[22];}
        }
        return time;
    }
    
    clean(type, table) {
        let curRow = type == 0 ? 4 : 3 ;
        let start = -1;
        let end = -1;
        for (let j = 1; j < table[curRow].length; j++) {
           if (table[curRow][j] == '卷件開始日期' || table[curRow][j] == '"date_from' || table[curRow][j] == '"日期描述' || table[curRow][j] == '日期起') {
                start = j;                
                if ((type == 3) || (start > 0 && end > 0)) {break;}
           }
           if (table[curRow][j] == '卷件結束日期' || table[curRow][j] == '"date_stop' || table[curRow][j] == '日期迄') {
                end = j;                
                if (start > 0 && end > 0) {break;}
            }
        }
        if (type >= 2) {
            for (let j = 1; j < table[curRow].length; j++) {            
                table[curRow][j] = table[curRow][j].substring(1);
            }
        }
        curRow++;
        while (curRow < table.length) {
            for (let j = 1; j < table[curRow].length; j++) {
                if (type >= 2) {
                    table[curRow][j] = table[curRow][j].substring(1);
                }                                
                if (j == start) {
                    table[curRow][0] = table[curRow][j];
                    table[curRow][j] = this.timeFormat(type, table[curRow][j]);
                }
                if (j == end) {
                    if (table[curRow][0].length > 1) {table[curRow][0] += ';' + table[curRow][j];}
                    table[curRow][j] = this.timeFormat(type, table[curRow][j]);
                }
            }
            curRow++;
        }
        return table;      
    }

    rawTable (data) {        
        data = data.split('\n');
        var result = Array(data.length);  
        var sli = 0;
        if (data[4][0].substring(0, 1) == '"') {sli = 1;}        
        for (let i = 0; i < data.length; i++) {
            let row = data[i].split(',');
            if (sli != 0 && i >= 3) {
                row.forEach(function(ele, index, row) {
                    row[index] = row[index].slice(sli, -sli);
                });
            }
            result[i] = row;
        }    
        return result;    
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