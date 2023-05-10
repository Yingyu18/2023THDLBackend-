require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./connection_db');
const jwt = require('jsonwebtoken');
const { lutimes } = require('fs');
const salt = parseInt(process.env.BCRYPT_SALT);
const {TOKEN_EXPIRE, TOKEN_SECRET} = process.env; // 30 days by seconds


const signUp = async (data) => {
    console.log(data)
    let {username, email, password, country, institution, title, researchTopic} = data;
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const emails = await conn.query('SELECT EMAIL FROM user_profile WHERE EMAIL = ? FOR UPDATE', [email]);
        if (emails.length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }

        const loginAt = new Date();
        password = bcrypt.hashSync(password, salt)
        let user = {
            username: username,
            password: bcrypt.hashSync(password, salt),
            email: email,
            institution: institution,
            researchTopic: researchTopic,
            country: country,
            time_created: loginAt,
            title: title,
            status: 'disabled',
            access_expired: TOKEN_EXPIRE,
        };
        // ("${name}", "${password}")
        const accessToken = jwt.sign({
            username: username,
            email: email,
            //userId: user.id.toString()
        }, TOKEN_SECRET);
        user.access_token = accessToken;
        const queryStr = `INSERT INTO user_profile (USER_NAME, PASSWORD, EMAIL, INSTITUTION, RESEARCH_TOPIC,COUNTRY, TIME_CREATED, TITLE, ACCESS_EXPIRED, AUTH_TOKEN, STATUS)
         VALUES  (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let values = [username, password, email, institution, researchTopic, country, loginAt, title, TOKEN_EXPIRE, accessToken, "disabled"];

        const result = await conn.query(queryStr, values);
        user.id = result.insertId;
        console.log(result)

        await conn.query('COMMIT');
        return {user};
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const login = async (identity, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        let users = await conn.query('SELECT * FROM user_profile WHERE EMAIL = ?', [identity]);
        if(users.length<1){
            users = await conn.query('SELECT * FROM user_profile WHERE USER_NAME = ?', [identity]);
        }
        const user = users[0]
        if (!bcrypt.compareSync(password, user.PASSWORD)){
            await conn.query('COMMIT');
            return {error: 'Password is wrong'};
        }

        const loginAt = new Date();
        const accessToken = jwt.sign({
            name: user.NAME,
            email: user.EMAIL,
            userId: user.USER_ID.toString(),
        }, TOKEN_SECRET, {expiresIn: TOKEN_EXPIRE});
        const queryStr = 'UPDATE user_profile SET ACCESS_TOKEN = ?, ACCESS_EXPIRED = ?, TIME_CREATED = ? WHERE USER_ID = ?';
        await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.USER_ID]);

        await conn.query('COMMIT');

        user.ACCESS_TOKEN = accessToken;
        user.TIME_CREATED = loginAt;
        user.ACCESS_EXPIRED = TOKEN_EXPIRE;

        console.log("user: ", user)
        return {user};
    } catch (error) {
        consolr.log(error)
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const signupAuth = async(email) => {
    const conn = await pool.getConnection();
    const queryStr = 'UPDATE user_profile SET STATUS = ? WHERE EMAIL = ?';
    try{
        await conn.query(queryStr, ["verified", email]);
        return ("ok")
    } catch(error){
        return {error}
    } finally {
        await conn.release()
    }
}

const getUserDetail = async (identity) => {
    try {    
            let users = await pool.query(`SELECT * FROM user_profile WHERE EMAIL = '${identity}'`);
            //console.log(users)
            if(users.length<1){
                console.log(identity)
                users = await pool.query(`SELECT * FROM user_profile WHERE USER_ID = ${identity}`);
            }
            //console.log(users[0])
            return users[0];
    } catch (e) {
        return e;
    }
};

const updateUserInfo = async (req) => {
    try {
        const {username, email, password, country, institution, title, researchTopic} = req.body;
        if (username){
            const result = await pool.query(`UPDATE user_profile SET USER_NAME = '${username}' WHERE EMAIL = '${email}'`);
        }
        if (password){
            let cryptPassword = bcrypt.hashSync(password, salt);
            const result = await pool.query(`UPDATE user_profile SET PASSWORD = '${cryptPassword}' WHERE EMAIL = '${email}'`);
            console.log("result: ", result)
        }
        if (country){
            const result = await pool.query(`UPDATE user_profile SET COUNTRY = '${country}' WHERE EMAIL = '${email}'`);
        }
        if (institution){
            const result = await pool.query(`UPDATE user_profile SET INSTITUTION = '${institution}' WHERE EMAIL = '${email}'`);
        }
        if (title){
            const result = await pool.query(`UPDATE user_profile SET TITLE = '${title}' WHERE EMAIL = '${email}'`);
        }
        if (researchTopic){
            const result = await pool.query(`UPDATE user_profile SET RESEARCH_TOPIC = '${researchTopic}' WHERE EMAIL = '${email}'`);
        }
        const user = await pool.query(`SELECT * FROM user_profile WHERE EMAIL = '${email}'`);
        return user[0];
    } catch (e) {
        console.log(e)
        return null;
    }
};

module.exports = {
    signUp,
    signupAuth,
    login,
    getUserDetail,
    updateUserInfo
};