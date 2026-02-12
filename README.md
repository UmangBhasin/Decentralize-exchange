# Exchange UI

Crypto UI featuring a market dashboard, advanced trading interface, and wallet system.

## Features

- Market dashboard with CoinGecko data, search, filters, and watchlist
- Trading screen with TradingView chart, timeframe switch, indicators, order book, and buy/sell panel
- Wallet view with balances, token list, and transaction history

## Routes

- `/` Market dashboard
- `/trade` Trading interface
- `/wallet` Wallet system

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment variables

Create a `.env.local` file with your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Data Sources

- CoinGecko public market data
- TradingView widget (client-side)
- Binance public API (order book, trades, and ticker)

## Notes

- Order book, trade history, and wallet data are placeholders for now.
- Wallet data is placeholder for now.
