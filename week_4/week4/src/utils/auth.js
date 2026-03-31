import { SETTINGS } from '../config/settings.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function login(page) {
    const { username, password, key } = SETTINGS.credentials;

    // Selektory wprost z HTML formularza
    await page.waitForSelector('input[name="login"]');
    
    await sleep(1000)
    await page.fill('input[name="login"]', username);
    await sleep(1000)
    await page.fill('input[name="password"]', password);
    await sleep(1000)
    await page.fill('input[name="access_key"]', key);

       // Kliknij i czekaj jednocześnie
       await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('button[type="submit"]')
    ]);

    console.log('✅ Zalogowano pomyślnie');
}

export { login };