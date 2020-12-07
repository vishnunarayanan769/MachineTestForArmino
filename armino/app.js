var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//Partials
var HBS=require('express-handlebars')
var fileUpload=require('express-fileupload')
//Routing
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin')

var app = express();
var db=require('./databaseConfig/connection')
var session = require('express-session')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//Using Partials START
app.engine('hbs', HBS({extname:'hbs', defaultLayout:'layout', layoutsDir: __dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}));
//Using Partials END
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(fileUpload());

//Database connection status
db.connect((err)=>{
  if(err)
    console.log('Connection error'+err)
  else
    console.log('Connection established')
})
app.use(session({secret:'Key',cookie:{maxAge:6000000000}}))
app.use('/', usersRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
