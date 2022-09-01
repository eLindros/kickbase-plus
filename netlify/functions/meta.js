const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
require('dotenv').config({ path: `.env.local` })

exports.handler = async function(event, context) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath,
    headless: true,
  });

const page = await browser.newPage();

//await page.goto('https://kickbaseplus.netlify.app/#/sell');
await page.goto('http://localhost:8888/#/sell');

const title = await page.title();

// await page.focus('#usernameInput');
// await page.keyboard.type('ronny.klein@me.com');

// await page.focus('#passwordInput');
// await page.keyboard.type('drachen1');


const responseLogin = await page.content();

  
await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'Ok',
        page: {
            title
        },
        response: {
            responseLogin
        }
      })
    };
  }