import { launchBrowser, closeBrowser, createPage } from './browser.js';
import { extractIdFromUrl, extractPageFromUrl } from './utils/urlParser.js';
import { clickElement, getText } from './utils/elementHandler.js';
import { SETTINGS } from './config/settings.js';
import { login } from './utils/auth.js';

export async function scrap(tab, keyword) {
    await launchBrowser();
    const page = await createPage();

    try {
        await page.goto(SETTINGS.targetUrl);
        await login(page);
        await page.waitForLoadState('networkidle');

        console.log("Opening tab ", tab);
        await page.locator(`a.nav-link:has-text("${tab}")`).click();
        await page.waitForLoadState('networkidle');
        console.log("Tab opened ✅", tab);

        await page.getByText(keyword).first().click();
        console.log('✅ Clicking keyword...', keyword);

        await page.waitForLoadState('networkidle');

        await page.waitForSelector('.detail-content');
        const content = await getText(page, '.detail-content');
        const title = await getText(page, '.hero-title');
        const id = extractIdFromUrl(page.url());
        const pageSection = extractPageFromUrl(page.url()) || "incydenty";

        const result = {
            title,
            content,
            id,
            page: pageSection,
        };
        console.log('Scraping result:', result);
        return result;
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        //await closeBrowser();
    }
}