# WealthGrow – frontend

React 19 + TypeScript + Vite client for the WealthGrow paper-trading app (bachelor thesis). Talks to the Spring Boot API in `../Stock-app-BE`.

## Run

```bash
npm install
cp .env.example .env.local   # then edit if your API is not on localhost:8080
npm run dev
```

### Demo mode (no backend needed)

Set `VITE_MOCK_API=true` in `.env.local`. The app then runs against an in-browser mock of the API
(`src/mocks/mockApi.ts`) with seeded prices, a demo portfolio and persistent state in `localStorage`.
Login is prefilled with `demo@wealthgrow.app` / `demo1234`. Useful for the thesis presentation and for UI work.

## Scripts

| Command           | What it does                           |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Vite dev server with HMR               |
| `npm run build`   | Type-check (`tsc -b`) and production build |
| `npm run lint`    | ESLint (React hooks + React Compiler rules) |
| `npm run preview` | Serve the production build locally     |

## Structure

```
src/
  lib/            http client (auth header, 401 handling, error parsing), auth/session helpers,
                  number/date formatting, theme + toast providers, realtime (STOMP) hook
  Components/UI/  design primitives: Button, Modal (focus trap, Esc), Field, AmountInput,
                  Change (signed +arrow), Sparkline, Skeleton, EmptyState, Avatar
  Components/     Navbar (with search), Footer, Charts (lightweight-charts + ranges.ts),
                  Trade/OrderTicket + StockList, Portfolio/Allocation (stacked bar + holdings),
                  Transactions/ActivityList (grouped by day), PopUp/* (mobile buy/sell, add funds, withdraw, activity)
  Pages/          Auth (shared layout), Login, SignUp, ForgotPassword, LandingPage (dashboard),
                  Wallet (portfolio), Profile
  Services/       thin API wrappers + response interfaces
  styles/         design tokens (light/dark) consumed by every component
  mocks/          in-browser mock API for demo mode
```

## Routes

`/dashboard`, `/portfolio`, `/profile` (authenticated), `/Login`, `/SignUp`, `/ForgotPassword`.
Old paths (`/LandingPage`, `/Wallet`, `/Profile`) redirect to the new ones.

## Design notes

* Tokens live in `src/styles/tokens.css`; dark mode is `html[data-theme="dark"]`, chosen from the
  profile page or the navbar toggle, defaulting to the OS preference.
* Market colours: green = up, red = down, always paired with an arrow and a sign so direction never
  relies on colour alone. Prices use tabular numerals (`.num`).
* One typeface (Instrument Sans). Flat surfaces separated by hairlines; the order ticket is the only boxed element.
  Primary buttons are black pills (white in dark mode); vivid green/orange is reserved for Buy/Sell and chart lines.
* Company logos come from Google's favicon service with a coloured monogram fallback (`TickerLogo`).
