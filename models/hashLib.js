var fs = require('fs');
class hashControl  {
    getHashMap (uid) {
        var map = new Map();
        let data =  fs.readFileSync('../rawfiles/' + uid + '/hash.txt', 'utf-8');
        data.split('\r\n').forEach(line => {
            map.set(line.substring(0, 3), line.substring(4));
        })
        return map;
    }

    appendHash (filename, id, uid) {
        fs.appendFile('../rawfiles/' + uid + '/hash.txt', '\r\n' + id + ':' + filename, (err) => {
            if (err) throw err;
            console.log('write!');
        });
    }

    deleteHash (id, uid) {
        let data =  fs.readFileSync('../rawfiles/' + uid + '/hash.txt', 'utf-8');
        let idx = -1;
        let arr = data.toString().split('\r\n');
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].substring(0, 3) == id) {
                idx = i;
                break;
            }
        }
        arr.splice(idx, 1);
        arr = arr.join('\r\n');
        fs.writeFile('../rawfiles/' + uid + '/hash.txt', arr, (err) => {
            if (err) throw err;
            console.log('delete!');
        });
    }
}

module.exports = hashControl;