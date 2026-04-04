import {AI_DEVS_API_KEY, SCRAP_LOGIN, SCRAP_PASSWORD} from '../../../../config.js'

export const SETTINGS = {
    targetUrl: 'https://oko.ag3nts.org/', // Replace with the actual target URL
    credentials: {
        username: SCRAP_LOGIN, // Replace with actual username
        password: SCRAP_PASSWORD, // Replace with actual password
        key: AI_DEVS_API_KEY
    },
    browserOptions: {
        headless: true, // Set to false for debugging
        timeout: 30000, // Timeout for actions
    },
    elementSelectors: {
        exampleElement: '.section-title', // Replace with actual selectors
    },
};