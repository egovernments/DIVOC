const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const { ConfigurationService } = require('./configuration_service');
const {HELPERS} = require('../../configs/constants');
const configurationService = new ConfigurationService();

let browser;
const initBrowser = async () => {
  browser = await puppeteer.launch({
    headless: true,
    //comment to use default
    executablePath: '/usr/bin/chromium-browser',
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--single-process",
      "--no-first-run",
    ]
  });
}

async function createPDF(htmlData, data) {
  if (browser === undefined || !browser.isConnected()) await initBrowser();
  const template = Handlebars.compile(htmlData);

  const helperFunctions = new Function(await configurationService.getHelperFunctions(HELPERS.CERTIFICATE_HELPER_FUNCTIONS))();
  
  let certificate = template(data, {helpers: helperFunctions});

  const page = await browser.newPage();
  await page.evaluateHandle('document.fonts.ready');
  await page.setContent(certificate, {
    waitUntil: 'domcontentloaded'
  });
  const pdfBuffer = await page.pdf({
    format: 'A4'
  });
  // close the page
  await page.close();

  return pdfBuffer
}

module.exports = {
  createPDF
}
