# Solana Token Scanner

A minimal, clean interface to check the price of any Solana token using its contract address.

## Features

- **Real-time Pricing**: Fetches live data from DexScreener API.
- **Solana Only**: Filters specifically for pairs on the Solana blockchain.
- **Smart Liquidity**: Automatically selects the most liquid pair for accurate pricing.
- **Clean UI**: Premium, distraction-free design inspired by modern developer tools.

## Development

Since this is a static application, you can serve it with any static file server.

```bash
# Using python
python3 -m http.server 8080

# Using serve
npx serve .
```

The app will be available at `http://localhost:8080`.

## Configuration

The application uses `https://api.dexscreener.com` which is a public API. No API key is required for basic usage.