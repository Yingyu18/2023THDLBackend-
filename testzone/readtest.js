var fs = require('fs');

const results = [];
let data = fs.readFileSync('test.csv', 'utf-8');


data.split('\n').forEach(line => {
    let row = line.toString().split(',');
    row.forEach(function(ele, index, row) {
        row[index] = row[index].slice(1, -1);
    })
    results.push(row);
})
    


console.log(results[3][2]);