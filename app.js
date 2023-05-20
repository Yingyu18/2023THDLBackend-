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
app.use('/api/auth', userRouter);
app.use('/api/file', fileRouter);
app.use('/api/files', fileRouter);
app.use('/edit/convertTo', convertRouter);
app.get('/healthcheck', (req, res)=>{
	res.send('OK');	
})
//app.use('/dbtest', dbRouter);
//app.use('/test', trou)

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.listen(3001,() => console.log('Server is running on port 3001'));
module.exports = app;
