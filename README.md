# Real Time Bi-directional Currency Converter

A lightweight, browser-based currency converter. Choose a source and target currency, then enter an amount in either field to see the conversion.

## Features

- **Real-time conversion:** The result updates as you type or change a currency selection.
- **Bidirectional input:** Enter an amount in either currency field; the other field is calculated automatically.
- **Rate caching:** Exchange rates are cached in memory by base currency for the current page session. Repeated conversions using the same base currency reuse the cached rates instead of making another API request.
- **Request deduplication:** Concurrent requests for the same base currency share one in-flight request.
- **Currency flags:** The selected currencies are shown with their country or region flags.
- **Input validation:** Invalid or negative amounts and unavailable rates are reported in the relevant field.

## Run locally

No build step is required. Open `index.html` in a browser, or serve the project directory with any static web server. An internet connection is needed to load exchange rates and flag images.

## Data sources

- Exchange rates: [ExchangeRate-API](https://www.exchangerate-api.com/)
- Flag images: [FlagsAPI](https://flagsapi.com/)

The rate cache is in memory only and is cleared when the page is reloaded. Rates are not periodically refreshed during a page session.
