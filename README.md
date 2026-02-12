# Exchange UI

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-ffca28?logo=firebase&logoColor=black)

Crypto UI featuring a market dashboard, advanced trading interface, and wallet system.

## Features

- Market dashboard with CoinGecko data, search, filters, and watchlist
- Trading screen with TradingView chart, timeframe switch, indicator picker, order book, and buy/sell panel
- AI trade bot panel (signal + explanation) with auto-trade toggle and API stub
- Running trades with PnL, partial close buttons (25/50/75/100%)
- Wallet view with balances, token list, profit booking, and recent orders
- Positions page with PnL, cost basis, and CSV export
- Deposit flow UI (INR/USDT + UPI/Bank/Card/PayPal)
- Auth/profile settings (Firebase email/password)

## Routes

- `/` Market dashboard
- `/trade` Trading interface
- `/wallet` Wallet system
- `/positions` Positions and PnL
- `/deposit` Deposit funds
- `/profile` Profile settings
- `/auth/login` Login
- `/auth/signup` Sign up

## Development

```bash
npm install
npm run dev
```

See `requirements.txt` for setup notes.

## Build

```bash
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

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

- Order execution is simulated (client-side).
- AI bot API is a stub at `/api/ai/bot` and ready for your custom model.
