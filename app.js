var express = require('express')
var bodyParser = require("body-parser")
var cors = require("cors")

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const unfluff = require('unfluff');
var fetchUrl = require("fetch").fetchUrl;

var MetaInspector = require('node-metainspector')

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static(__dirname + "/test"))
app.listen(3003, function () {
  console.log("Service running on http://127.0.0.1:3003")
})

function date_string() {
  var today = new Date()
  var year = today.getFullYear()
  var monthNumber = Number(today.getMonth()) + 1
  var month = ""
  if (monthNumber < 10) { month = "0" + String(monthNumber) }
  else { month = String(monthNumber) }
  var dayNumber = today.getDate()
  var day = ""
  if (dayNumber < 10) { day = "0" + String(dayNumber) }
  else { day = String(dayNumber) }
  return year + "-" + month + "-" + day
}

function validateAsPath(temp) {
  if (/[/><\n\t:\u0022|?*\\]/.test(temp)) {
    if (/[çğıöşüÇĞİÖŞÜ]/.test(temp)) {
      // temp = temp.replace(/[/]/, " veya ")
      // temp = temp.replace(/[>]/, " büyüktür ")
      // temp = temp.replace(/[<]/, " küçüktür ")
    }
    else {
      // temp = temp.replace(/[/]/, " or ")
      // temp = temp.replace(/[>]/, " bigger than ")
      // temp = temp.replace(/[<]/, " less than ")
    }
    temp = temp.replace(/[\n]/, " ")
    temp = temp.replace(/[\t]/, " ")
    // temp = temp.replace(/[\:]/,"")
    temp = temp.replace(/[\"]/, "\'")
    temp = temp.replace(/[|]/, ",")
    temp = temp.replace(/[?]/, "")
    temp = temp.replace(/[.]/, "dot")
    temp = temp.replace(/[\\]/, " ")
    temp = temp.replace("http://", "")
    temp = temp.replace(".", "dot")
  }
  return temp
}


app.get('/webshot', function (req, res) {
  (async () => {
    console.log(req.query.url)
    const browser = await puppeteer.launch();
    var filename = "tmp/" + date_string() + "_" + validateAsPath(req.query.url) + ".png"
    console.log(filename)
    // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(6000000);
    await page.goto(req.query.url);
    await page.screenshot({ path: __dirname + "/" + filename, fullPage: true });
    await browser.close()
    await res.sendFile(__dirname + "/" + filename)
  })();
});

app.get('/extract', function (req, res) {
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
