const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

async function createPDF(htmlData, data) {
  const template = Handlebars.compile(htmlData);
  let certificate = template(data);
  const browser = await puppeteer.launch({
    headless: true,
    //comment to use default
    executablePath: '/usr/bin/chromium-browser',
    args: [
      "--no-sandbox",
      "--disable-gpu",
    ]
  });
  const page = await browser.newPage();
  await page.evaluateHandle('document.fonts.ready');
  await page.setContent(certificate, {
    waitUntil: 'domcontentloaded'
  });
  const pdfBuffer = await page.pdf({
    format: 'A4'
  });

  // close the browser
  await browser.close();

  return pdfBuffer
}

module.exports = {
  createPDF
}