"use client";
import { useState, useEffect } from "react";

interface Signal {
  id: string; market: string; event: string; direction: string; confidence: number;
  entry: string; target: string; stop: string; timestamp: string; reasoning: string; status: string;
}

const features = [
  { icon: "📡", title: "Real-Time Signals", desc: "Algorithmic entries and exits delivered as they trigger. No lag." },
  { icon: "🎯", title: "Multi-Market", desc: "Kalshi, Polymarket, and top crypto pairs — all in one feed." },
  { icon: "📊", title: "Backtested", desc: "Every strategy tested against 12+ months of historical data." },
  { icon: "🔔", title: "Instant Alerts", desc: "Discord & Telegram notifications the moment a signal fires." },
  { icon: "🧠", title: "AI-Powered", desc: "Models that adapt to market regime changes in real-time." },
  { icon: "🔒", title: "Risk Management", desc: "Position sizing, stops, and correlation checks built-in." },
];

const tiers = [
  { name: "Free", price: "$0", period: "/forever", features: ["3 signals per day", "Delayed 15 min", "Crypto only", "Email delivery"], cta: "Start Free", primary: false },
  { name: "Pro", price: "$29", period: "/month", features: ["Unlimited signals", "Real-time", "All markets", "Discord + Telegram", "Backtested strategies", "Priority support"], cta: "Join Waitlist", primary: true },
];

const faqs = [
  { q: "What markets do you cover?", a: "Kalshi event contracts, Polymarket prediction markets, and major crypto (BTC, ETH, SOL)." },
  { q: "How are signals generated?", a: "Algorithmic models combining price action, momentum, volume, and market microstructure." },
  { q: "What's the win rate?", a: "Varies by strategy. Our crypto momentum strategy runs ~62% WR with 2:1 R/R. Full backtests available to Pro." },
  { q: "Can I cancel anytime?", a: "Yes. One click, no questions asked." },
];

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/signals");
        const data = await res.json();
        setSignals(data.signals || []);
        setPrices(data.meta?.prices || {});
      } catch { /* fallback to empty */ }
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, product: "signalflow" }) });
      setSubmitted(true);
    } catch { alert("Error"); }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-blue-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-30" />
        <div className="absolute top-40 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20" style={{ animationDelay: "1s" }} />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm font-mono">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            LIVE — {signals.length} signals active
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Algorithmic Signals.<br /><span className="gradient-text-cyan">While You Sleep.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">Real-time trading signals for Kalshi, Polymarket, and crypto. Powered by live market data.</p>

          {/* Live prices */}
          {prices.btc && (
            <div className="flex justify-center gap-6 mb-10 font-mono text-sm">
              <span className="text-gray-400">BTC <span className="text-white">${prices.btc?.toLocaleString()}</span></span>
              <span className="text-gray-400">ETH <span className="text-white">${prices.eth?.toLocaleString()}</span></span>
              <span className="text-gray-400">SOL <span className="text-white">${prices.sol?.toLocaleString()}</span></span>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1 px-5 py-3.5 rounded-xl bg-gray-900 border border-gray-700 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500 font-mono" />
              <button type="submit" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold transition whitespace-nowrap">Get Early Access</button>
            </form>
          ) : (
            <div className="px-6 py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 max-w-md mx-auto">✅ You&apos;re on the list!</div>
          )}
        </div>
      </section>

      {/* Live Signals */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Live Signal Feed</h2>
        <p className="text-gray-400 text-center mb-8">Real signals from our algorithms. Updates every 60 seconds.</p>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading signals...</div>
        ) : signals.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No active signals right now. Markets are quiet.</div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {signals.map((s) => (
              <div key={s.id} className="p-5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">{s.market}</span>
                    <span className="font-semibold">{s.event}</span>
                  </div>
                  <span className="text-xs text-gray-500">{timeAgo(s.timestamp)}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm font-mono mb-3">
                  <div>
                    <span className="text-gray-500 text-xs block">Direction</span>
                    <span className={s.direction === "LONG" || s.direction === "YES" || s.direction === "HOLD" ? "text-emerald-400" : "text-red-400"}>{s.direction}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Entry</span>
                    <span className="text-white">{s.entry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Target</span>
                    <span className="text-emerald-400">{s.target}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Confidence</span>
                    <span className="text-cyan-400">{s.confidence}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{s.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-center mb-16">Why SignalFlow</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {tiers.map((t) => (
            <div key={t.name} className={`p-8 rounded-2xl ${t.primary ? "bg-gradient-to-b from-gray-900 to-gray-900/50 border-cyan-500/30 ring-1 ring-cyan-500/20" : "bg-gray-900/50 border-gray-800"} border`}>
              <h3 className="text-xl font-semibold mb-2">{t.name}</h3>
              <div className="mb-6"><span className="text-4xl font-bold">{t.price}</span><span className="text-gray-500">{t.period}</span></div>
              <ul className="space-y-3 mb-8">
                {t.features.map((f, i) => (<li key={i} className="flex items-center gap-2 text-gray-300 text-sm"><span className="text-cyan-400">✓</span>{f}</li>))}
              </ul>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`w-full py-3 rounded-xl font-semibold transition ${t.primary ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500" : "bg-gray-800 hover:bg-gray-700"}`}>{t.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-center mb-16">FAQ</h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                <h3 className="font-semibold mb-2">{f.q}</h3>
                <p className="text-gray-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-500 text-sm">© 2026 SignalFlow. Not financial advice. Past performance ≠ future results.</div>
      </footer>
    </main>
  );
}
