var express = require('express');
var assert = require('assert');
var request = require("request")

var passport = require('passport');
var passStrategyBearer = require('passport-http-bearer').Strategy;

var session = require('express-session');
var mongodbSessionStore = require('connect-mongodb-session')(session);

var mongoClient = require("mongodb").MongoClient
var mongodbUrl = "mongodb://127.0.0.1:27017"

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


//==================================================================================================
// Bearer Passport
//==================================================================================================
passport.use(new passStrategyBearer(function (token, cb) {
  mongoClient.connect(mongodbUrl + "/auth", function (err, db) {
    db.collection("users").findOne({ token: token }, function (err, user) {
      if (err) return cb(err)
      if (!user) { return cb(null, false); }
      return cb(null, user);
      db.close();
    });
  });
}));

passport.serializeUser(function (user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function (username, cb) {
  mongoClient.connect(mongodbUrl + "/auth", function (err, db) {
    db.collection("users").findOne({ username: username }, function (err, user) {
      if (err) return cb(err)
      if (!user) { return cb(null, false); }
      return cb(null, user);
      db.close();
    });
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
// webscrap : webshot
//-----------------------------------------------------------------------------
app.get('/webscrap/api/webshot', passport.authenticate('bearer', { session: false }), function (req, res) {
  (async () => {
    console.log(req.query.url)
    const browser = await puppeteer.launch();
    var filename = "tmp/" + date_string() + "_" + validateAsPath(req.query.url) + ".png"
    console.log(filename)
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(6000000);
    await page.goto(req.query.url);
    await page.screenshot({ path: __dirname + "/" + filename, fullPage: true });
    await browser.close()
    await res.sendFile(__dirname + "/" + filename)
  })();
});

app.get('/webscrap/api/title', passport.authenticate('bearer', { session: false }), function (req, res) {
  var client = new MetaInspector(req.query.url, { timeout: 5000 });
  client.on("fetch", function () {
    res.send({ url: req.query.url, title: client.title });
  });
  client.on("error", function (err) {
    fetchUrl(req.query.url, function (error, meta, body) {
      var data = unfluff(body)
      res.send({ url: req.query.url, title: data.title})
    });
  });
  client.fetch();
});


app.listen(3003, function () {
  console.log("Service running on http://127.0.0.1:3003")
})

