var express = require('express');
var router = express.Router();



function dispatch (type, ids) {
    if (type == 'ct') {
        const action = require('../models/csvConvert');
        return action(ids);
    } else {
        return 'dumbdumb';
    }
}

module.exports = dispatch;
