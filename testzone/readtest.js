var h = require('../models/hashLib');
var fs = require('fs');

h = new h();
  
let map = h.getHashMap('20230419123456789');
console.log(map);

h.appendHash('fuckyou.csv', '151', '20230419123456789');
h.deleteHash('333', '20230419123456789');

console.log(fs.readFileSync('../rawfiles/20230419123456789/hash.txt', 'utf-8'));