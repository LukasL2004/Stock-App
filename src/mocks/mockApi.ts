/**
 * In-browser mock of the Spring Boot API. Enabled with VITE_MOCK_API=true.
 * Lets the UI run (and be demoed) without MySQL, Mongo or the backend.
 * State persists in localStorage under "wg-mock".
 */
import { API_URL } from "../lib/http";

const SYMBOLS = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "NFLX"];
const BASE_PRICE: Record<string, number> = {
  AAPL: 231.4, TSLA: 348.9, GOOGL: 186.2, MSFT: 428.7, AMZN: 207.3, NVDA: 141.8, META: 598.5, NFLX: 912.6,
};

interface Position { symbol: string; averagePrice: number; amountOwned: number; shares: number; profit: number }
interface Audit { id: number; symbol: string; total: number; date: string; price: number; shares: number; action: "BUY" | "SELL" }
interface State {
  users: Record<string, { firstName: string; lastName: string; password: string; resetCode?: string }>;
  wallet: { balance: number; investment: number };
  positions: Position[];
  audit: Audit[];
  seq: number;
}

const KEY = "wg-mock";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** ~400 daily points per symbol, deterministic. */
const charts: Record<string, { time: number; value: number }[]> = {};
const latest: Record<string, { price: number; open: number; high: number; low: number }> = {};
(function buildCharts() {
  const now = new Date();
  now.setHours(16, 0, 0, 0);
  SYMBOLS.forEach((sym, i) => {
    const rnd = seeded(1000 + i * 7919);
    const pts: { time: number; value: number }[] = [];
    let v = BASE_PRICE[sym] * (0.62 + rnd() * 0.25);
    const drift = 0.0009 + rnd() * 0.0008;
    for (let d = 400; d >= 0; d--) {
      const t = new Date(now);
      t.setDate(now.getDate() - d);
      if (t.getDay() === 0 || t.getDay() === 6) continue;
      v = v * (1 + drift + (rnd() - 0.5) * 0.034);
      pts.push({ time: Math.floor(t.getTime() / 1000), value: Math.round(v * 100) / 100 });
    }
    const last = pts[pts.length - 1].value;
    const prev = pts[pts.length - 2].value;
    charts[sym] = pts;
    latest[sym] = { price: last, open: prev, high: Math.max(last, prev) * 1.006, low: Math.min(last, prev) * 0.994 };
  });
})();

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return seedState();
}

function seedState(): State {
  const d = (daysAgo: number) => {
    const t = new Date();
    t.setDate(t.getDate() - daysAgo);
    return t.toString();
  };
  const buys: Audit[] = [
    { id: 1, symbol: "AAPL", total: 1500, date: d(61), price: 214.1, shares: 1500 / 214.1, action: "BUY" },
    { id: 2, symbol: "NVDA", total: 1200, date: d(48), price: 127.3, shares: 1200 / 127.3, action: "BUY" },
    { id: 3, symbol: "MSFT", total: 900, date: d(40), price: 410.2, shares: 900 / 410.2, action: "BUY" },
    { id: 4, symbol: "TSLA", total: 600, date: d(22), price: 362.8, shares: 600 / 362.8, action: "BUY" },
    { id: 5, symbol: "AAPL", total: 500, date: d(12), price: 226.9, shares: 500 / 226.9, action: "BUY" },
    { id: 6, symbol: "TSLA", total: 200, date: d(5), price: 340.1, shares: 200 / 340.1, action: "SELL" },
  ];
  const positions: Position[] = [];
  const apply = (a: Audit) => {
    const p = positions.find((x) => x.symbol === a.symbol);
    if (a.action === "BUY") {
      if (p) {
        p.amountOwned += a.total;
        p.shares += a.shares;
        p.averagePrice = p.amountOwned / p.shares;
      } else positions.push({ symbol: a.symbol, averagePrice: a.price, amountOwned: a.total, shares: a.shares, profit: 0 });
    } else if (p) {
      p.amountOwned -= a.total;
      p.shares -= a.shares;
    }
  };
  buys.forEach(apply);
  return {
    users: { "demo@wealthgrow.app": { firstName: "Ana", lastName: "Popescu", password: "demo1234" } },
    wallet: { balance: 2350.75, investment: 7050.75 },
    positions,
    audit: buys,
    seq: 6,
  };
}

const state = load();
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

function recomputeProfit(p: Position) {
  p.profit = (latest[p.symbol].price - p.averagePrice) * p.shares;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
function text(data: string, status = 200) {
  return new Response(data, { status, headers: { "Content-Type": "text/plain" } });
}
function err(message: string, status: number) { return json({ message, status }, status); }

function fakeJwt(email: string) {
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=/g, "");
  return `${b64({ alg: "none" })}.${b64({ sub: email, exp: Math.floor(Date.now() / 1000) + 36000 })}.mock`;
}

let currentUser = "demo@wealthgrow.app";

async function handle(method: string, path: string, body: unknown): Promise<Response> {
  await new Promise((r) => setTimeout(r, 180 + Math.random() * 220));
  const b = (body ?? {}) as Record<string, unknown>;

  // Users
  if (path === "/api/users/login" && method === "POST") {
    const email = String(b.email ?? "").toLowerCase();
    const u = state.users[email];
    if (!u) return err("User not found", 404);
    if (u.password !== b.password) return err("Incorrect password", 401);
    currentUser = email;
    return json({ token: fakeJwt(email) });
  }
  if (path === "/api/users/register" && method === "POST") {
    const email = String(b.email ?? "").toLowerCase();
    if (state.users[email]) return err("An account with this email already exists", 409);
    state.users[email] = { firstName: String(b.firstName), lastName: String(b.lastName), password: String(b.password) };
    save();
    return json({ message: "User registered successfully" });
  }
  if (path === "/api/users/forgotPassword") {
    const email = String(b.email ?? "").toLowerCase();
    if (!state.users[email]) return err("User not found", 404);
    state.users[email].resetCode = "123456";
    save();
    return text("Check your email for the reset code (demo code: 123456)");
  }
  if (path === "/api/users/resetPassword") {
    const email = String(b.email ?? "").toLowerCase();
    const u = state.users[email];
    if (!u) return err("User not found", 404);
    if (u.resetCode !== b.code) return err("Reset password token does not match", 404);
    u.password = String(b.password);
    delete u.resetCode;
    save();
    return json({ message: "Password changed successfully" });
  }
  if (path === "/api/users" && method === "GET") {
    const u = state.users[currentUser];
    return json({ email: currentUser, firstName: u.firstName, lastName: u.lastName });
  }

  // Wallet
  if (path === "/api/wallet/balance") return json({ id: 1, balance: state.wallet.balance, investment: state.wallet.investment });
  if (path === "/api/wallet/AddFounds") {
    const amount = Number(b.amount);
    if (!(amount > 0)) return err("Sorry the amount must be greater than 0", 400);
    state.wallet.balance += amount;
    state.wallet.investment += amount;
    save();
    return json({ message: "Deposit successful" });
  }
  if (path === "/api/wallet/Withdraw") {
    const amount = Number(b.amount);
    if (!(amount > 0)) return err("Sorry the amount must be greater than 0", 400);
    if (amount > state.wallet.balance) return err(`You can withdraw at most $${state.wallet.balance.toFixed(2)}`, 400);
    state.wallet.balance -= amount;
    save();
    return json({ message: "Withdraw successful" });
  }

  // Stocks
  if (path === "/api/stocks/values") {
    return json(SYMBOLS.map((s) => ({ id: s, symbol: s, date: new Date().toISOString(), price: latest[s].price, open: latest[s].open, high: latest[s].high, low: latest[s].low, volume: "0", status: "ok" })));
  }
  if (path === "/api/stocks/charts") {
    const out: { symbol: string; date: string; time: string; value: number }[] = [];
    for (const s of SYMBOLS) for (const p of charts[s]) {
      const d = new Date(p.time * 1000);
      out.push({ symbol: s, date: d.toISOString().slice(0, 10), time: "16:00:00", value: p.value });
    }
    return json(out);
  }

  // Portfolio
  if (path === "/api/portofolio/total") {
    const positions = state.positions.filter((p) => p.shares > 0.00001);
    const total = positions.reduce((a, p) => a + p.amountOwned, 0);
    const marketValue = positions.reduce((a, p) => a + p.shares * latest[p.symbol].price, 0);
    return json({
      total,
      investedValue: total,
      marketValue,
      totalProfit: marketValue - total,
      balance: state.wallet.balance,
      portfolioChart: positions.map((p) => ({
        symbol: p.symbol,
        value: p.amountOwned,
        percentage: total > 0 ? (p.amountOwned / total) * 100 : 0,
        marketValue: p.shares * latest[p.symbol].price,
        profit: p.shares * latest[p.symbol].price - p.amountOwned,
      })),
    });
  }
  if (path.startsWith("/api/portofolio/profit/")) {
    const sym = decodeURIComponent(path.split("/").pop()!);
    const p = state.positions.find((x) => x.symbol === sym);
    const l = latest[sym];
    const dailyProfitValue = p ? (l.price - l.open) * p.shares : 0;
    let totalDaily = 0, atOpen = 0;
    for (const q of state.positions) { totalDaily += (latest[q.symbol].price - latest[q.symbol].open) * q.shares; atOpen += latest[q.symbol].open * q.shares; }
    return json({
      dailyProfitValue,
      dailyProfitPercentage: l ? ((l.price - l.open) / l.open) * 100 : 0,
      totalPortfolioProfitDaily: totalDaily,
      totalPortfolioProfitDailyPercentage: atOpen ? (totalDaily / atOpen) * 100 : 0,
    });
  }
  if (path === "/api/portofolio/buy" && method === "POST") {
    const amount = Number(b.amountToInvest), price = Number(b.currentPrice), symbol = String(b.symbol);
    if (!(amount > 0)) return err("Amount must be greater than 0", 400);
    if (amount > state.wallet.balance) return err("Insufficient funds", 400);
    const sh = amount / price;
    let p = state.positions.find((x) => x.symbol === symbol);
    if (p) { p.amountOwned += amount; p.shares += sh; p.averagePrice = p.amountOwned / p.shares; }
    else { p = { symbol, averagePrice: price, amountOwned: amount, shares: sh, profit: 0 }; state.positions.push(p); }
    recomputeProfit(p);
    state.wallet.balance -= amount;
    state.audit.push({ id: ++state.seq, symbol, total: amount, date: new Date().toString(), price, shares: sh, action: "BUY" });
    save();
    return json({ message: "Your purchase was a success" });
  }
  if (path === "/api/portofolio/sell" && method === "POST") {
    const amount = Number(b.withdrawAmount), price = Number(b.currentPrice), symbol = String(b.symbol);
    const p = state.positions.find((x) => x.symbol === symbol);
    if (!p) return err("You do not own this stock", 404);
    const sh = amount / price;
    if (!(amount > 0)) return err("Amount must be greater than 0", 400);
    if (sh > p.shares + 1e-9) return err("Sorry you don't have enough shares", 400);
    p.shares -= sh;
    p.amountOwned = Math.max(0, p.amountOwned - amount);
    if (p.shares < 1e-6) state.positions = state.positions.filter((x) => x !== p);
    else recomputeProfit(p);
    state.wallet.balance += amount;
    state.audit.push({ id: ++state.seq, symbol, total: amount, date: new Date().toString(), price, shares: sh, action: "SELL" });
    save();
    return json({ message: "Your sell was a success" });
  }
  if (path.startsWith("/api/portofolio/")) {
    const sym = decodeURIComponent(path.split("/").pop()!);
    const p = state.positions.find((x) => x.symbol === sym);
    if (!p) return json({ symbol: sym, averagePrice: 0, amountOwned: 0, shares: 0, profit: 0 });
    recomputeProfit(p);
    return json({ ...p, userId: 1 });
  }

  // Audit
  if (path === "/api/audit/get") return json([...state.audit].reverse());

  return err(`No mock for ${method} ${path}`, 404);
}

export function installMockApi() {
  const real = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (!url.startsWith(API_URL)) return real(input, init);
    const path = new URL(url).pathname;
    const method = (init?.method ?? "GET").toUpperCase();
    let body: unknown;
    if (typeof init?.body === "string") { try { body = JSON.parse(init.body); } catch { body = init.body; } }
    return handle(method, path, body);
  };
  console.info("%cWealthGrow demo mode: using in-browser mock API", "color:#2458e6;font-weight:600");
}
