import { chromium } from 'playwright';

let browser;
let context;

async function launchBrowser() {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
}

async function closeBrowser() {
    await context.close();
    await browser.close();
}

async function createPage() {
    const page = await context.newPage();
    return page;
}

export { launchBrowser, closeBrowser, createPage };