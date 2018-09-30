var express = require('express');
var assert = require('assert');
var request = require("request")

var passport = require('passport');
var connectEnsureLogin = require('connect-ensure-login')

var session = require('express-session');
var mongodbSessionStore = require('connect-mongodb-session')(session);

var mongodb;
var mongoClient = require("mongodb").MongoClient
var mongodbUrl = "mongodb://127.0.0.1:27017"
mongoClient.connect(mongodbUrl, { poolSize: 10 }, function (err, client) {
  assert.equal(null, err);
  mongodb = client;
});

// Create a new Express application.
var app = express();

var store = new mongodbSessionStore({
  uri: mongodbUrl,
  databaseName: 'auth',
  collection: 'sessions'
});

// Catch errors
store.on('error', function (error) {
  assert.ifError(error);
  assert.ok(false);
});

app.use(require('express-session')({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));

app.use(require('morgan')('tiny'));
app.use(require('body-parser').json())
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require("cors")())
app.use("/webscrap/bower_components", express.static(__dirname + "/public/bower_components"))

passport.serializeUser(function (user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function (username, cb) {
  mongodb.db("auth").collection("users").findOne({ username: username }, function (err, user) {
    if (err) return cb(err)
    if (!user) { return cb(null, false); }
    return cb(null, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/webscrap', require('connect-ensure-login').ensureLoggedIn({ redirectTo: "/login?source=webscrap" }), function (req, res) {
  if (req.user.username == "admin") res.sendFile(__dirname + '/public/index.html')
  else { req.logout(); res.send(403); }
});

//=============================================================================
// webscrap
//=============================================================================

//-----------------------------------------------------------------------------
// webscrap : title
//-----------------------------------------------------------------------------
var cheerio = require("cheerio")
var request = require("request")
app.get('/webscrap/api/title', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  if (req.query.url) {
    request(req.query.url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);
        const webpageTitle = $("title").text();
        const metaDescription = $('meta[name=description]').attr("content");
        const webpage = {
          title: webpageTitle,
          meta: metaDescription
        }
        res.send(webpage);
      }
    });
  }
});


app.listen(3003, function () {
  console.log("Service running on http://127.0.0.1:3003")
})

