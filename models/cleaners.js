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
        if (time == '') {return '0000-00-00';}
        time = time.replaceAll('/', '-');
        if (time[6] == '-') {time = time.substring(0, 5) + '0' + time.substring(5);}
        if (time.lenght < 10 || time[9] == ' ') {time = time.substring(0, 8) + '0' + time.substring(8);}
        if (type == 3) {
            if (time[19] != '-') {time = time.substring(0, 18) + '0' + time.substring(18);}
            if (time.length != 23) {time = time.substring(0, 22) + '0' + time[21];}
        }
        return time;
    }
    
    clean(type, table) {
        let curRow = type == 0 ? 4 : 3 ;
        let start = -1;
        let end = -1;
        for (let j = 1; j < table[curRow].length; j++) {
           if (table[curRow][j] == '卷件開始日期' || table[curRow][j] == 'date_from' || table[curRow][j] == '日期描述' || table[curRow][j] == '日期起') {
                start = j;                
                if ((type == 3) || (start > 0 && end > 0)) {break;}
           }
           if (table[curRow][j] == '卷件結束日期' || table[curRow][j] == 'date_stop' || table[curRow][j] == '日期迄') {
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
                if (j == start || j == end) {table[curRow][j] = this.timeFormat(type, table[curRow][j]);}
                table[curRow][j] = this.sanitize(table[curRow][j]);
            }
            curRow++;
        }
        return table;      
    }

    rawTable (path) {
        console.log('called');
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

module.exports = cleaner;