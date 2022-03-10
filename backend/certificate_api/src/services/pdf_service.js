const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const { ConfigurationService } = require('./configuration_service');
const {HELPERS} = require('../../configs/constants');
const configurationService = new ConfigurationService();

async function createPDF(htmlData, data) {
  const template = Handlebars.compile(htmlData);

  const helperFunctions = new Function(await configurationService.addHelpers(HELPERS.CERTIFICATE_HELPER_FUNCTIONS))();
  
  let certificate = template(data, {helpers: helperFunctions});

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
