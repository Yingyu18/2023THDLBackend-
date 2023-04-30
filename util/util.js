const User = require('../server/models/user_model');
const {TOKEN_SECRET} = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // util from native nodejs library



const authentication = async (req, res, next) => {
        let accessToken = req.get('Authorization');
        if (!accessToken) {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }

        accessToken = accessToken.replace('Bearer ', '');
        if (accessToken == 'null') {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }

        try {
            const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
            req.user = user;
                let userDetail = await User.getUserDetail(user.email);
                if (!userDetail) {
                    res.status(400).send({error: 'Account not exist'});
                } else {
                    next();
                }
        } catch(err) {
            res.status(401).send(err);
            return;
        }
};


module.exports = {
    authentication
};