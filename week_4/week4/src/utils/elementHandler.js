async function clickElement(page, selector) {
    await page.waitForSelector(selector);
    await page.click(selector);
}

async function getText(page, selector) {
    await page.waitForSelector(selector);
    return await page.textContent(selector);
}

async function clickByText(page, text) {
    await page.getByText(text).click();
}

export { clickElement, getText };