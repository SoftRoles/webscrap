//=============================================================================
// http server
//=============================================================================
const express = require('express');
const argparse = require('argparse').ArgumentParser
const cheerio = require("cheerio")
const request = require("request")

//-------------------------------------
// arguments
//-------------------------------------
const argParser = new argparse({
  addHelp: true,
  description: 'Filesystem service'
})
argParser.addArgument(['-p', '--port'], { help: 'Listening port', defaultValue: '3003' })
const args = argParser.parseArgs()

//=============================================================================
// http server
//=============================================================================
const app = express();

//-------------------------------------
// common middlewares
//-------------------------------------
app.use(require('@softroles/authorize-local-user')())
app.use(require('morgan')('tiny'));
app.use(require('body-parser').json())
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require("cors")())

//=============================================================================
// api v1
//=============================================================================

//-----------------------------------------------------------------------------
// title
//-----------------------------------------------------------------------------
app.get('/webscrap/api/v1/title', function (req, res) {
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


//=============================================================================
// start service
//=============================================================================
app.listen(Number(args.port), function () {
  console.log(`Service running on http://127.0.0.1:${args.port}`)
})
