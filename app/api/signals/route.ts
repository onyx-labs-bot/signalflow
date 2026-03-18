import { NextResponse } from "next/server";

interface Signal {
  id: string;
  market: string;
  event: string;
  direction: string;
  confidence: number;
  entry: string;
  target: string;
  stop: string;
  timestamp: string;
  reasoning: string;
  status: "active" | "hit_target" | "stopped_out" | "expired";
}

// Fetch live crypto prices from CoinGecko (free, no API key)
async function getCryptoPrices(): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 60 } }
    );
    return await res.json();
  } catch {
    return {};
  }
}

// Simple momentum signal generator based on 24h change
function generateCryptoSignals(prices: Record<string, Record<string, number>>): Signal[] {
  const signals: Signal[] = [];
  const coins: Record<string, { id: string; symbol: string }> = {
    bitcoin: { id: "btc", symbol: "BTC/USD" },
    ethereum: { id: "eth", symbol: "ETH/USD" },
    solana: { id: "sol", symbol: "SOL/USD" },
  };

  for (const [coinId, info] of Object.entries(coins)) {
    const data = prices[coinId];
    if (!data) continue;

    const price = data.usd;
    const change24h = data.usd_24h_change;

    if (Math.abs(change24h) < 1.5) continue; // Skip low-volatility

    const direction = change24h > 0 ? "LONG" : "SHORT";
    const confidence = Math.min(85, Math.round(50 + Math.abs(change24h) * 5));

    const targetMult = direction === "LONG" ? 1.03 : 0.97;
    const stopMult = direction === "LONG" ? 0.98 : 1.02;

    signals.push({
      id: `crypto-${info.id}-${Date.now()}`,
      market: "Crypto",
      event: info.symbol,
      direction,
      confidence,
      entry: `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      target: `$${(price * targetMult).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      stop: `$${(price * stopMult).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      timestamp: new Date().toISOString(),
      reasoning: `${Math.abs(change24h).toFixed(1)}% move in 24h ${direction === "LONG" ? "upward" : "downward"} momentum. ${confidence}% confidence based on price action.`,
      status: "active",
    });
  }

  return signals;
}

// Static Kalshi-style event signals (would connect to Kalshi API with credentials)
function generateEventSignals(): Signal[] {
  const now = new Date();
  return [
    {
      id: `kalshi-fed-${Date.now()}`,
      market: "Kalshi",
      event: "Fed Rate Decision — Next Meeting",
      direction: "HOLD",
      confidence: 78,
      entry: "0.72",
      target: "0.88",
      stop: "0.60",
      timestamp: now.toISOString(),
      reasoning: "CME FedWatch shows 78% probability of hold. Market consensus aligns with recent Fed communications.",
      status: "active",
    },
    {
      id: `pm-ai-reg-${Date.now()}`,
      market: "Polymarket",
      event: "Major AI Regulation Bill 2026",
      direction: "NO",
      confidence: 65,
      entry: "0.38",
      target: "0.20",
      stop: "0.50",
      timestamp: now.toISOString(),
      reasoning: "Congressional gridlock and election year dynamics make comprehensive AI regulation unlikely in 2026.",
      status: "active",
    },
  ];
}

export async function GET() {
  try {
    const prices = await getCryptoPrices();
    const cryptoSignals = generateCryptoSignals(prices);
    const eventSignals = generateEventSignals();
    const allSignals = [...cryptoSignals, ...eventSignals].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      signals: allSignals,
      meta: {
        generated: new Date().toISOString(),
        count: allSignals.length,
        markets: ["Crypto", "Kalshi", "Polymarket"],
        prices: {
          btc: prices.bitcoin?.usd,
          eth: prices.ethereum?.usd,
          sol: prices.solana?.usd,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate signals" }, { status: 500 });
  }
}
