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

   async timeFormat(time) { 
        if (time == '' || time == null) {return '0000-00-00';}
        if (time.lenght < 5) {time += '-00-00';}
        if (time[6] == '-') {time = time.substring(0, 5) + '0' + time.substring(5);}
        if (time.length < 10 || time[9] == ' ') {time = time.substring(0, 8) + '0' + time.substring(8);}
        return time;
    }

// idx = start row - 1
//content.split('\n').split(',')

    csvClean(table, idx) {
        var Equal = table[idx][1].substring(0, 1) == '=' ? 1 : 0;
        var DBLquotes = table[idx][1].substring(0, 1) == '"' ||  table[idx][1].substring(1, 2) == '"' ? 1 : 0;
        for (let i = idx; i < table.length; i++) {  
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
                let sorg = org.replaceAll('/', '-');
                if (org.length == 23) {
                    let temp = sorg.substring(13, 23);
                    temp = await this.timeFormat(temp);                       
                    table[curRow][start] = await this.timeFormat(sorg.substring(0, 10)) + '&' + temp + '&' + org;
                } else if (org.length == 10) {                 
                    table[curRow][start] = '0000-00-00&0000-00-00&0000-00-00';
                } else {
                    let temp = sorg.split(' ');
                    console.log('teeeemp  = ' + temp);
                    let st = await this.timeFormat(temp[0]);      
                    let ed = await this.timeFormat(temp[2]);                     
                    table[curRow][start] = st + '&' + ed + '&' + org;
                    console.log('tstres  = ' + table[curRow][start]);
                }
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
                st = st.replaceAll('/', '-'); 
                ed = ed.replaceAll('/', '-'); 
                st = await this.timeFormat(st);
                ed = await this.timeFormat(ed);
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