const axios = require('axios');

// In-memory cache so we don't hammer the upstream API / regenerate random
// walks on every request. Keyed by symbol -> { price, changePct, ts }
const cache = new Map();
const CACHE_MS = 5000;

// Seed prices used by the simulator so re-runs feel consistent rather than
// starting every symbol at some arbitrary number.
const SEED_PRICES = {
  AAPL: 210, MSFT: 445, GOOGL: 178, AMZN: 195, NVDA: 135,
  TSLA: 240, META: 505, NFLX: 680, AMD: 155, INTC: 32,
  JPM: 210, BAC: 42, V: 275, DIS: 112, KO: 68,
  PEP: 172, WMT: 92, NKE: 78, PYPL: 68, ADBE: 520,
};

function seedFor(symbol) {
  return SEED_PRICES[symbol] || (100 + (symbol.charCodeAt(0) % 26) * 8);
}

// Simple deterministic pseudo-random walk based on symbol + current minute,
// so the "simulated feed" still moves over time without a database.
function simulateQuote(symbol) {
  const base = seedFor(symbol);
  const minuteBucket = Math.floor(Date.now() / 60000);
  let seed = 0;
  for (const ch of symbol) seed += ch.charCodeAt(0);
  seed += minuteBucket;

  const pseudoRandom = Math.sin(seed) * 10000;
  const wobble = pseudoRandom - Math.floor(pseudoRandom); // 0..1
  const pctSwing = (wobble - 0.5) * 0.06; // +/- 3%
  const price = +(base * (1 + pctSwing)).toFixed(2);
  const changePct = +(pctSwing * 100).toFixed(2);

  return { symbol, price, changePct, source: 'simulated' };
}

async function fetchLiveQuote(symbol) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;

  try {
    const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
      params: { symbol, token: key },
      timeout: 4000,
    });
    if (!data || typeof data.c !== 'number' || data.c === 0) return null;

    const changePct = data.pc ? +(((data.c - data.pc) / data.pc) * 100).toFixed(2) : 0;
    return { symbol, price: +data.c.toFixed(2), changePct, source: 'live' };
  } catch (err) {
    return null; // fall back to simulated feed below
  }
}

async function getQuote(symbol) {
  const sym = symbol.toUpperCase();
  const cached = cache.get(sym);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return cached.quote;
  }

  let quote = await fetchLiveQuote(sym);
  if (!quote) quote = simulateQuote(sym);

  cache.set(sym, { quote, ts: Date.now() });
  return quote;
}

async function getQuotes(symbols) {
  return Promise.all(symbols.map(getQuote));
}

// A short OHLC history series for candlestick chart pages. Uses the same
// deterministic simulator (day-bucketed) so charts are stable within a day,
// whether or not a live API key is configured.
function getHistory(symbol, days = 60) {
  const base = seedFor(symbol);
  const candles = [];
  let prevClose = base * 0.9;

  for (let i = days; i >= 0; i--) {
    const dayBucket = Math.floor(Date.now() / 86400000) - i;
    let seed = 0;
    for (const ch of symbol) seed += ch.charCodeAt(0);
    seed += dayBucket * 7;

    const pseudoRandom = Math.sin(seed) * 10000;
    const wobble = pseudoRandom - Math.floor(pseudoRandom);
    const drift = (wobble - 0.48) * 0.04;

    const open = prevClose;
    const close = +(open * (1 + drift)).toFixed(2);

    // Derive a plausible high/low band around the open/close range using a
    // second deterministic wobble so candles have real wicks.
    const rangeSeed = Math.sin(seed * 1.7) * 10000;
    const rangeWobble = (rangeSeed - Math.floor(rangeSeed)) * 0.02 + 0.005; // 0.5%-2.5%
    const bandBase = Math.max(open, close);
    const bandLow = Math.min(open, close);
    const high = +(bandBase * (1 + rangeWobble)).toFixed(2);
    const low = +(bandLow * (1 - rangeWobble)).toFixed(2);

    const date = new Date(Date.now() - i * 86400000);
    candles.push({
      date: date.toISOString().slice(0, 10),
      time: Math.floor(date.getTime() / 1000), // unix seconds, what lightweight-charts expects
      open: +open.toFixed(2),
      high,
      low,
      close,
      price: close, // kept for any consumer still expecting a flat price series
    });

    prevClose = close;
  }

  return candles;
}

module.exports = { getQuote, getQuotes, getHistory };
