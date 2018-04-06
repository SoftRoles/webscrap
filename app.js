var express = require('express')
var bodyParser = require("body-parser")
var cors = require("cors")

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static(__dirname + "/test"))
app.listen(3003, function () {
  console.log("Service running on http://127.0.0.1:3003")
})

app.get('/webshot', function (req, res) {
  (async () => {
    console.log(req.query.url)
    const browser = await puppeteer.launch();
    var filename = "tmp/" + Date.now() + 'example.png'
    // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(6000000);
    await page.goto(req.query.url);
    await page.screenshot({ path: __dirname + "/" + filename, fullPage: true });
    await browser.close()
    await res.sendFile(__dirname + "/" + filename)
  })();
});

