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
        if (type >= 4) {return table;}
        let curRow = idx-1;
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
        curRow++;
        if (type == 3) {
            while (curRow < table.length) {
                if (table[curRow][start] == null) {
                    curRow++;
                    continue;
                }
                let org = table[curRow][start];
                let temp = table[curRow][start].substring(13, 23);
                temp = await this.timeFormat(3, temp);                       
                table[curRow][start] = await this.timeFormat(table[curRow][start].substring(0, 10)) + '&' + temp + '&' + org;
                curRow++;
            }
        }
         else {
            while (curRow < table.length) {
                if (table[curRow][start] == null) {
                    curRow++;
                    continue;
                } 
                let st =  table[curRow][start];
                let ed = table[curRow][end]; 
                table[curRow][start] = st + '~' + ed;
                st = st.replaceAll('/', '-'); console.log('re st = ' + st);
                ed = ed.replaceAll('/', '-');console.log('re en = ' + ed);
                st = await this.timeFormat(st);console.log('tf st = ' + st);
                ed = await this.timeFormat(ed);console.log('tf en = ' + ed);
                table[curRow][end] = st + '&' + ed;
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
        return data.slice(0, data.length-1);
        
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