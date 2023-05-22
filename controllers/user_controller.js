require('dotenv').config();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user_model');
const bcrypt = require('bcrypt');
const https = require('https');
const {TOKEN_SECRET} = process.env;

const signUp = async (req, res) => {
    let {username, email, password, country, institution, title, researchTopics} = req.body;
    const researchTopic = researchTopics;
    if(!username || !email || !password || !country || !institution || !title || !researchTopic) {
        res.status(400).send({error:'Request Error: incomplete user information'});
        return;
    }
    if (!validator.isEmail(email)) {
        res.status(400).send({error:'Request Error: Invalid email format'});
        return;
    }
    let data = {
        username : validator.escape(username),
        email : validator.escape(email),
        country : validator.escape(country),
        institution : validator.escape(institution),
        title : validator.escape(title),
        researchTopic : validator.escape(researchTopic),
        password : password
    }
    const result = await User.signUp(data);
    if (result.error) {
        res.status(402).send({error: result.error});
        return;
    }
    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }
    //寄驗證信
    //建立SMTP傳輸器
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_ACCOUNT,
            pass: process.env.GMAIL_PASS
        }
        });
        // 設置郵件選項
        const auth_token = user.access_token
        const ACTION_URL = `http://localhost:3000/auth/{auth_token}`
        const mailOptions = {
            from: process.env.GMAIL_ACCOUNT,
            to: email,
            subject: '台灣史料數位人文平台 驗證新註冊帳號',
            html: `<p>您好，</p><p>感謝您加入台灣史料數位人文平台。</p><p>點擊下列連結，驗證您的註冊信：</p><p><a class="btn" href="${ACTION_URL}" target="_blank" rel="noopener">馬上驗證</a></p><p>謝謝您，<br/>台灣史料數位人文平台 團隊敬上</p>`
        };
        //使用傳輸器發送郵件
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.send(error);
        } else {
            console.log('郵件發送成功：' + info.response);
            res.send('發送成功')
        }
        });

    res.status(200).send({
            data: {
                id: user.id.toString(),
                username: user.name,
                email: user.email,
                country: user.country,
                institution: user.institution,
                title: user.title,
                researchTopics: user.researchTopic
                // status: 'disabled',
            }
        }
    );
};

const forgetPassword = async (req, res) =>{
    const {email} = req.body;
    // 建立一個SMTP傳輸器
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_ACCOUNT,
            pass: process.env.GMAIL_PASS
        }
        });
        // 設置郵件選項
        const auth_token = jwt.sign({
            email: email,
            //userId: user.id.toString()
        }, TOKEN_SECRET);
        const ACTION_URL = `http://localhost:3000/auth/forget/${auth_token}`
        const mailOptions = {
            from: process.env.GMAIL_ACCOUNT,
            to: email,
            subject: '台灣史料數位人文平台 點擊連結重設密碼',
            html: `<p>您好，</p></p><p>點擊下列連結，重設您的密碼。：</p><p><a class="btn" href="${ACTION_URL}" target="_blank" rel="noopener">重設密碼</a></p><p>謝謝您，<br/>台灣史料數位人文平台 團隊敬上</p>`
        };
        //使用傳輸器發送郵件
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.send(error);
        } else {
            console.log('郵件發送成功：' + info.response);
            res.send('發送成功')
        }
        });
    res.status(200).send("sueccess")
};

const loginQuery = async (identity, password) => {
    if(!identity || !password){
        return {error: 'Request Error: email and password are required.', status: 400};
    }
    try {
        return await User.login(identity, password);
    } catch (error) {
        return {error};
    }
};


const login = async (req, res) => {
    const data = req.body;
    let result = await loginQuery(data.identity, data.password);
    if (result.error) {
        const status_code = result.status ? result.status : 401;
        res.status(status_code).send(result.error);
        return;
    }
    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Internal Server Error'});
        return;
    } 
    //login Docusky 
    result = await loginDocuSky(user.EMAIL, user.PASSWORD)


    res.status(200).send({
       // data: {
            token: user.ACCESS_TOKEN,
            sid: result.DocuSky_SID,
            data: {
                id: user.USER_ID.toString(),
                username: user.USER_NAME,
                email: user.EMAIL,
                country: user.COUNTRY,
                institution: user.INSTITUTION,
                title: user.TITLE,
                researchTopics: user.RESEARCH_TOPIC
            }
       // }
    });
};
const loginDocuSky = async (dsUname, dsPword) => {
    return new Promise((resolve, reject) => {
    const options = {
        hostname: 'maxwell.csie.ntu.edu.tw', // TO-DO: Need to edit
        path: `/DocuSky/webApi/userLoginJson.php?dsUname=${dsUname}&dsPword=${dsPword}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          //console.log(chunk)
          const jsonData = JSON.parse(chunk)
          data += jsonData.message.split('=')[1];
        });
        response.on('end', () => {
          const sid = { DocuSky_SID: data };
          resolve(sid)
        });
      });
      request.on('error', (error) => {
        reject(error);
      });
      request.end();
    })
};

const signupAuth = async(req, res) =>{
    const token = req.body.token
    const email = req.body.email
    jwt.verify(token, TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(400).send("invalid token")
        }
        if(decoded.exp < Date.now()/1000){
            res.status(400).send("token expired")
        }
    });
    const result = await User.signupAuth(email);
    if (result.error) {
        res.status(500).send({error: result.error});
        return;
    }
    res.status(200).send("Success")
};
const getUserInfo = async (req, res) => {
    const id = req.query.id
    const user = await User.getUserDetail(id)
    res.status(200).send({
        "id": user.USER_ID.toString(),
        "email": user.EMAIL,
        "username": user.USER_NAME,
        "country": user.COUNTRY,
        "institution": user.INSTITUTION,
        "title": user.TITLE,
        "researchTopic":user.RESEARCH_TOPIC

    })
};
const updateUserInfo = async (req, res) => {
    console.log("if authentication pass user: ", req.user);
    if(!req.user.email){
        res.status(400).send("Required user email")
    }
    const user = await User.updateUserInfo(req)
    if(!user){
        res.status(500).send("Internal server error")
    }else {
        res.status(200).send({
            "id": user.USER_ID.toString(),
            "email": user.EMAIL,
            "username": user.USER_NAME,
            "country": user.COUNTRY,
            "institution": user.INSTITUTION,
            "title": user.TITLE,
            "researchTopic":user.RESEARCH_TOPIC
        })
    }
};

const updatePassword = async (req, res) => {
    const {email, oldPassword, newPassword} = req.body
    if(!email || !oldPassword || !newPassword){
        res.status(400).send("Require user email and old password and new password")
    }

    let user = await User.getUserDetail(email)
    if(!bcrypt.compareSync(oldPassword, user.PASSWORD)){
        res.status(400).send("Invalid password")
    }
    req.body.password = newPassword
    const result = await User.updateUserInfo(req)
    if (!result) {
        res.status(500).send("Internal server error");
        return;
    }
    res.status(200).send("Success")

};



module.exports = {
    signUp,
    signupAuth,
    login,
    loginDocuSky,
    forgetPassword,
    getUserInfo,
    updatePassword,
    updateUserInfo
};