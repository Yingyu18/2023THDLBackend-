var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');


var indexRouter = require('./routes/index');
var convertRouter = require('./edit/convertTo');
var userRouter = require('./routes/user_route');
var fileRouter = require('./routes/file_route');
//var trou = require('./testzone/test');
// Express Initialization
const cors = require('cors');
const app = express();
// CORS allow all
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', userRouter);
app.use('/file', fileRouter);
//app.use('/dbtest', dbRouter);
//app.use('/test', trou);
app.use('/edit/convertTo', convertRouter);
app.get('/healthcheck', (req, res)=>{
	res.send('OK');	
})
//app.get('/test', test)




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.post('/upload', (req, res) => {
//   const results = [];
//   fs.createReadStream(req.files)
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       console.log(results);
//       // Process the results array here
//       // Convert the CSV data to text format
//       // Store it in the database
//       // Send response or handle errors
//     });
// });

app.post('/login', (req, res) => {
  //console.log(req);
  // const options = {
  //   hostname: 'docusky.org.tw', // TO-DO: Need to edit 
  //   path: '/DocuSky/WebApi/userLoginJson.php',
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // };

  // const data = {
  //   dsUname: req.body.username,  // 假设通过查询字符串传递用户名
  //   dsPword: req.body.password,  // 假设通过查询字符串传递密码
  // };

  // const request = https.request(options, (response) => {
  //   console.log(`statusCode: ${response.statusCode}`);
  //   console.log('Res:', response.headers['set-cookie'][0]);
  //   console.log("response:", response);
  //   let ssid_string = response.headers['set-cookie'][0].replace('DocuSky_SID=', '').split(';')[0];

  //   response.on('data', (chunk) => {
  //     console.log("this is chunk", chunk);
  //   });
  //   response.on('end', () => {
  //     console.log('end', ssid_string);
  //     res.status(200).json({'DocuSky_SSID': ssid_string}).end();
  //   });
  // });
  
  // request.on('error', (error) => {
  //   console.error(error);
  // });
  // request.write(JSON.stringify(data));
  // request.end();
  const options = {
    hostname: 'maxwell.csie.ntu.edu.tw', // TO-DO: Need to edit
    path: `/DocuSky/webApi/userLoginJson.php?dsUname=${req.body.dsUname}&dsPword=${req.body.dsPword}`,
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
      console.log("JSON.parse(chunk): ", jsonData)
      data += jsonData.message.split('=')[1];
    });
    response.on('end', () => {
      res.status(200).json({ DocuSky_SID: data }).end();
    });
  });
  request.on('error', (error) => {
    console.error(error);
  });
  request.end();

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.listen(3001,() => console.log('Server is running on port 3001'));
module.exports = app;
