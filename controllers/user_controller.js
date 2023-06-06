require('dotenv').config();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user_model');
const bcrypt = require('bcrypt');
const https = require('https');

const {TOKEN_EXPIRE, TOKEN_SECRET, IMAGE_URL } = process.env; 

const signUp = async (req, res) => {
    let {username, email, password, country, institution, title, researchTopics} = req.body;
    const researchTopic = researchTopics;

    if(!username || !email || !password || !country || !institution || !title || !researchTopic) {
        return res.status(400).send({error:'Request Error: incomplete user information'});
        
    }
    if (!validator.isEmail(email)) {
        return res.status(400).send({
            code:400,
            message:'Request Error: Invalid email format'});
        
    }
    let data = {
        username : username,
        email : email,
        country : country,
        institution : institution,
        title : title,
        researchTopic : researchTopic,
        password : password
    }
    const result = await User.signUp(data);
    if (result.error) {
        return res.status(402).send({
            code: 402,
            message: result.error});
    }
    const user = result.user;
    if (!user) {
        return res.status(500).send({
            code: 500,
            message: 'Database Query Error'});

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
        const ACTION_URL = `https://twdh.vercel.app/auth/${auth_token}`
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
                id: user.id.toString(),
                username: user.name,
                email: user.email,
                verified: false,
                avatar: "",
                country: user.country,
                institution: user.institution,
                title: user.title,
                researchTopics: user.researchTopic,
                sid: ""
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
        const ACTION_URL = `https://twdh.vercel.app/pwreset/${auth_token}`
        const mailOptions = {
            from: process.env.GMAIL_ACCOUNT,
            to: email,
            subject: '台灣史料數位人文平台 點擊連結重設密碼',
            html: `<p>您好，</p></p><p>點擊下列連結，重設您的密碼。：</p><p><a class="btn" href="${ACTION_URL}" target="_blank" rel="noopener">重設密碼</a></p><p><i>如果您並未要求重設密碼，您可以忽略此郵件。</i></p>
            <p>
              感謝您，<br/>
              {APP_NAME} 團隊敬上
            </p>`
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
        const result = await User.login(identity, password);
        return result
    } catch (error) {
        return {error};
    }
};


const login = async (req, res) => {
    const data = req.body;
    let result = await loginQuery(data.identity, data.password);
    if (result.error) {
        console.log(result.error)
        return res.status(result.error).send({message:"not authorized"});
        
    }
    const user = result.user;
    if (!user) {
        res.status(500).send({
            code: 500,
            message: 'Internal Server Error'});
        return;
    } 

    //login Docusky 
    result = await loginDocuSky(user.EMAIL, user.PASSWORD)

    res.status(200).send({
            token: user.ACCESS_TOKEN,
            record: {
                id: user.USER_ID.toString(),
                username: user.USER_NAME,
                email: user.EMAIL,
                verified: true,
                avatar: user.avatar,
                country: user.COUNTRY,
                institution: user.INSTITUTION,
                title: user.TITLE,
                researchTopics: user.RESEARCH_TOPIC,
                sid: result.DocuSky_SID
            }
    });
};
const authRefresh = async (req, res) => {
    console.log(req.user.email)
    const accessToken = jwt.sign({
        name: req.user.name,
        email: req.user.email,
        userId: req.user.userId.toString(),
    }, TOKEN_SECRET, {expiresIn: TOKEN_EXPIRE});
    let user = await User.getUserDetail(req.user.email)
    
    result = await loginDocuSky(user.EMAIL, user.PASSWORD)
    console.log(result)
    res.status(200).send({
        token: accessToken,
        "record": {
            "id": req.user.userId.toString(),
            "username": req.user.name,
            "verified": "true",
            "email": req.user.email,
            "avatar": user.avatar,
            "country": user.COUNTRY,
            "institution": user.INSTITUTION,
            "researchTopics": user.RESEARCH_TOPIC,
            "title": user.TITLE,
            "sid": result.DocuSky_SID
          }
    });
}

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
    let email
    //const email = req.body.email
    jwt.verify(token, TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(400).send({
                code: 400,
                message: "invalid token"})
        }
        if(decoded.exp < Date.now()/1000){
            res.status(400).send({
                code: 400,
                message: "token expired"})
        }
        email = decoded.email
    });
    const result = await User.signupAuth(email);
    if (result.error) {
        res.status(500).send({
            code: 500,
            message: result.error});
        return;
    }
    res.status(200).send("Success")
};
const getUserInfo = async (req, res) => {
    const id = req.user.userId
    const user = await User.getUserDetail(id)
    res.status(200).send({
        "token": "",
        "record":{
            "id": user.USER_ID.toString(),
            "email": user.EMAIL,
            "username": user.USER_NAME,
            "country": user.COUNTRY,
            "institution": user.INSTITUTION,
            "title": user.TITLE,
            "researchTopics":user.RESEARCH_TOPIC
        }
    })
};
const updateUserInfo = async (req, res) => {
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
            "researchTopics":user.RESEARCH_TOPIC,
            "avatar": user.avatar,
            "verified": user.STATUS
        })
    }
};

const updatePassword = async (req, res) => {
    const token = req.body.token
    let email
    //const email = req.body.email
    jwt.verify(token, TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(400).send({
                code: 400,
                message: "invalid token"})
        }
        email = decoded.email
    });
    const {password} = req.body
    if(!password || !email){
        res.status(400).send("Require user email and old password and new password")
    }

    // let user = await User.getUserDetail(email)
    // if(!bcrypt.compareSync(oldPassword, user.PASSWORD)){
    //     res.status(400).send({
    //     code: 400,
    //     message: "Invalid Password"})
    // }
    req.body.password = password
    req.user = {email:email}
    const result = await User.updateUserInfo(req)
    if (!result) {
        res.status(500).send({
            code: 500,
            message: "Internal server error"
        });
        return;
    }
    res.status(200).send({
        code: 200,
        message: "Success"})

};



module.exports = {
    signUp,
    signupAuth,
    login,
    authRefresh,
    loginDocuSky,
    forgetPassword,
    getUserInfo,
    updatePassword,
    updateUserInfo
};