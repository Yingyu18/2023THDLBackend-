var express = require('express');
var router = express.Router();
function recover(table) {
    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
            if (table[i][j] == null) {continue;}
            table[i][j] = table[i][j].replaceAll('&amp', '&');
            table[i][j] = table[i][j].replaceAll('&lt', '<');
            table[i][j] = table[i][j].replaceAll('&gt', '>');
            table[i][j] = table[i][j].replaceAll('&quot', '"');
            table[i][j] = table[i][j].replaceAll('&#x27', "'");
            table[i][j] = table[i][j].replaceAll('&#x2f', '/');
        }
    }
    return table;
}

let handler = require('../controllers/fileConverter');
handler = new handler();
router.get('/', function(req, res, next) {
    var ids = ['20230419123456789101000001', '20230419123456789101000002', '20230419123456789101000003', '20230419123456789101000004'];
    var content = recover(handler.csv(ids));
    res.render('2darray', { table: content });
    //res.send(content);
    
});

module.exports = router;