# Web Scraper Project

This project is a simple web scraper built using Playwright. It retrieves information from a specified website, interacts with elements on the page, and extracts IDs from URLs.

## Project Structure

```
week4
├── src
│   ├── scraper.js          # Main entry point for the web scraper
│   ├── browser.js          # Manages the Playwright browser instance
│   ├── utils
│   │   ├── urlParser.js    # Utility for extracting IDs from URLs
│   │   └── elementHandler.js # Utility for handling page elements
│   └── config
│       └── settings.js     # Configuration settings for the scraper
├── .env                     # Environment variables
├── package.json             # npm configuration file
└── README.md                # Project documentation
```

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory:
   ```
   cd week4
   ```
3. Install the required dependencies:
   ```
   npm install
   ```

## Configuration

Before running the scraper, ensure that you have set up the `.env` file with the necessary environment variables, including any API keys or configuration settings needed for the scraper.

## Usage

To run the web scraper, use the following command:
```
node src/scraper.js
```

## Functions

- **scraper.js**: Initializes the Playwright browser, navigates to the target website, retrieves information, clicks elements, and extracts IDs from URLs.
- **browser.js**: Manages the Playwright browser instance, providing functions to launch and close the browser, as well as to create new pages.
- **urlParser.js**: Contains the function `extractIdFromUrl(url)` to extract IDs from URLs using regular expressions.
- **elementHandler.js**: Provides functions for interacting with page elements, such as `clickElement(selector)` and `getText(selector)`.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.