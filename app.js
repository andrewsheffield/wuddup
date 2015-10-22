var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var lessMiddleware = require('less-middleware');
var passport = require('passport');
var passportLocal = require('passport-local');
var expressSession = require('express-session');
var passportHttp = require('passport-http');
var passportRM = require('passport-remember-me');
var bcrypt = require('bcrypt');
var flash = require('connect-flash');
var crypto = require('crypto');


var routes = require('./routes/index');

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

//require MongoDB with Mongoose
var mongoose = require('mongoose');

var app = express();

//Get all models in models folder
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession( {
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false 
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));


//Start MongoDB Connection
mongoose.connect('mongodb://ajsheffield:Midgees1@ds053438.mongolab.com:53438/heroku_app34579795');
console.log("DB connection to Mongo started");

function verifyCred(username, password, done) {

  //lower case the username on entry...makes it none case sensitive.
  username = username.toLowerCase();

  mongoose.model('users').findOne({ 'username': username }, function(err, user) {

    if (user) {
      mongoose.model('auth').findOne({ user: user.id }, function(err, auth) {
        if (bcrypt.compareSync(password, auth.password)) {
          user.loginDates.push(Date.now());
          user.save();
          return done(null, user);
        }
      });
    } else {
      return done(null, false, { message: 'Incorrect username or password.' });
    }

  });
  
}

passport.use(new passportLocal.Strategy(verifyCred));

passport.use(new passportHttp.BasicStrategy(verifyCred));

passport.use(new passportRM.Strategy(
  function(token, done) {
    var tokenArr = token.split(" ");
    var username = tokenArr[0];
    var tokenHash = tokenArr[1];

    mongoose.model('users').findOne({ 'username': username }, function (err, user) {
      if (user) {
        mongoose.model('auth').findOne({ 'user': user._id } , function (err, auth) {
          if (auth) {
            bcrypt.compare(auth.rmToken, tokenHash, function(err, res) {
              if (err) {
                return done(err);
              } else {
                return done(null, user);
              }
            });
          } else {
            return done(null, false);
          }
        });
      } else {
        return done(null, false);
      }
    });

  },
  function(user, done) {
    mongoose.model('users').findOne( { 'username': user.username }, function(err, user) {
      mongoose.model('auth').findOne( { 'user': user._id }, function (err, auth) {
        auth.rmToken = crypto.randomBytes(16).toString('hex');
        bcrypt.hash(user.rmToken, 10, function(err, hash) {
          user.save(function(err, user) {
            if (err) {
              return done(err);
            } else {
              return done(null, user.username + " " + hash);
            }
          });
        });
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  //query db
  mongoose.model('users').findOne({ _id: id}, function(err, user) {
    done(null, user);
  });
  
})

//Get all routers in routes folder
fs.readdirSync(__dirname + '/routes').forEach(function(filename) {
  if (~filename.indexOf('.js')) {
    var aRoute = require(__dirname + '/routes/' + filename);
    var filenameFront = filename.substring(0, filename.indexOf('.js'));
    app.use('/' + filenameFront, aRoute);
  }
});

//Get all routers in API v1.0.0
fs.readdirSync(__dirname + '/routes/api-v1.0.0').forEach(function(filename) {
  if (~filename.indexOf('.js')) {
    var aRoute = require(__dirname + '/routes/api-v1.0.0/' + filename);
    var filenameFront = filename.substring(0, filename.indexOf('.js'));
    app.use('/api-v1.0.0/' + filenameFront, aRoute);
  }
});

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


//########################### error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}



// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
