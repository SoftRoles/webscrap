const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 1768 });
  await page.goto('http://haberturk.com');
  await setTimeout(function(){console.log("Here")}, 10000)
  await page.screenshot({ path: 'example2.png' }, {
    networkIdleTimeout: 50000,
    waitUntil: 'networkidle',
    timeout: 3000000
  });

  await browser.close();
})();