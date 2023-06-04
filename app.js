var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');


var indexRouter = require('./routes/index');
var editRouter = require('./routes/edit_route');
var mapRouter = require('./routes/map_route');
var docuRouter = require('./routes/docu_route');
//var convertRouter = require('./edit/convertTo');
var userRouter = require('./routes/user_route');
var fileRouter = require('./routes/file_route');
var projectRouter = require('./routes/project_route')
//var trou = require('./testzone/test');
// Express Initialization
const cors = require('cors');
const app = express();
app.use(cors());
// CORS allow all


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb' }));
app.use(bodyParser.json({ limit: '1024mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1024mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/auth', userRouter);
app.use('/api/file', fileRouter);
app.use('/api/files', fileRouter);
app.use('/api/projects', projectRouter);
app.use('/api/edit', editRouter);
app.use('/api/map', mapRouter);
app.use('/api/docu', docuRouter);
app.use('/images', express.static('avatar'));

//app.use('/edit/convertTo', convertRouter);
app.get('/healthcheck', (req, res)=>{
	res.send('OK');	
})
//app.use('/dbtest', dbRouter);
//app.use('/test', trou);





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
app.listen(3002,() => console.log('Server is running on port 3002'));
module.exports = app;
