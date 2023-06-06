require('dotenv').config();
const bcrypt = require('bcrypt');
var sha256 = require('js-sha256');
const pool = require('./connection_db');
const jwt = require('jsonwebtoken');
const salt = parseInt(process.env.BCRYPT_SALT);
const {TOKEN_EXPIRE, TOKEN_SECRET, IMAGE_URL} = process.env; // 30 days by seconds

const signUp = async (data) => {
    let {username, email, password, country, institution, title, researchTopic} = data;
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
    // insert data into docusky user_profile
        const docuskyUser = await conn.query('SELECT * FROM docusky.user_profile WHERE USERNAME = ? FOR UPDATE', [data.email]);
        if (docuskyUser.length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }
        
        console.log(sha256(password))
        password = bcrypt.hashSync(password, salt)

        const loginAt = new Date();
        let queryStr = `INSERT INTO docusky.user_profile (USERNAME, ALT_KEY_VAL, INIT_PASSWORD, INIT_PASSWORD_ENCODED, PASSWORD_ENCODED, TIME_CREATED, STATUS, EXPIRATION_TIME) VALUES (?,?,?,?,?,?,?,?)`;
        let values = [email, email, password, sha256(password), sha256(password), loginAt, "READY", "2030-12-31 00:00:00.000"];
        let result = await conn.query(queryStr, values);
        let id = result.insertId;
        
    //inser data into thdlbacktest
        const emails = await conn.query('SELECT EMAIL FROM user_profile WHERE EMAIL = ? FOR UPDATE', [email]);
        if (emails.length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }
        let user = {
            username: username,
            password: password,
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
        
        queryStr = `INSERT INTO user_profile (USER_NAME, PASSWORD, EMAIL, INSTITUTION, RESEARCH_TOPIC,COUNTRY, TIME_CREATED, TITLE, ACCESS_EXPIRED, AUTH_TOKEN, STATUS, DOCUSKY_ID)
         VALUES  (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        values = [username, password, email, institution, researchTopic, country, loginAt, title, TOKEN_EXPIRE, accessToken, "disabled", id];
        //console.log(values)
        result = await conn.query(queryStr, values);
        user.id = result.insertId;
        //console.log(result)

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
            if(users.length<1){
                return {error: 400};    
            }
        }

        const user = users[0]
        if(user.STATUS=='disabled'){
            return {error: 402};
        }
        if (!bcrypt.compareSync(password, user.PASSWORD)){
            await conn.query('COMMIT');
            return {error: 401};
        }

        const loginAt = new Date();
        const accessToken = jwt.sign({
            name: user.USER_NAME,
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
        const {username, password, country, institution, title, researchTopic, avatar} = req.body;
        const {userId} =  req.user
        console.log("body: ",req.file.filename)
        const {email} = req.user;
        if(req.file.fieldname==='avatar'){
            //let result = await pool.query(`SELECT FROM user_profile SET avatar = '${IMAGE_URL}/${req.file.filename}' WHERE EMAIL = '${email}'`);
             result = await pool.query(`UPDATE user_profile SET avatar = '${IMAGE_URL}/${userId.toString()}/${req.file.filename}' WHERE EMAIL = '${email}'`);
        }
        if (username){
            const result = await pool.query(`UPDATE user_profile SET USER_NAME = '${username}' WHERE EMAIL = '${email}'`);
        }
        if (password){
            let bcPassword = bcrypt.hashSync(password, salt);
            let result = await pool.query(`UPDATE user_profile SET PASSWORD = '${bcPassword}' WHERE EMAIL = '${email}'`);
            let queryStr = `UPDATE docusky.user_profile SET INIT_PASSWORD=?, INIT_PASSWORD_ENCODED=?, PASSWORD_ENCODED=? WHERE USERNAME=?`;
            let values = [bcPassword, sha256(bcPassword), sha256(bcPassword), email];
            result = await pool.query(queryStr, values);
        }
        if (country){
            const result = await pool.query(`UPDATE user_profile SET COUNTRY = '${country}' WHERE EMAIL = '${email}'`);
            console.log(email)
            console.log("edit country result: ", result)
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