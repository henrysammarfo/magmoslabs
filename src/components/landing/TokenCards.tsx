import { Check } from "lucide-react";

function IndexChart() {
  // simple compounding curve from 1.00 -> 1.12
  const points: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * 320;
    const v = Math.pow(1.12, i / 40); // 1 -> 1.12
    const y = 110 - (v - 1) * 800; // scale
    points.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 320 120" className="w-full h-32">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c8a04a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c8a04a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#c8a04a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <polygon points={`0,120 ${points.join(" ")} 320,120`} fill="url(#g)" />
    </svg>
  );
}

const aurumPoints = [
  "Always equals $1 — pure open-market arbitrage",
  "Lives in your wallet as a native Move object",
  "Composable across Scallop, Cetus, DeepBook",
  "Mint 1:1 from USDC, any time, by anyone",
];

const sAurumPoints = [
  "Accumulation index rises daily as yield compounds",
  "Yield from Scallop + DeepBook + Aftermath",
  "Unstake any time — receive AURUM at current index",
  "The longer you hold, the more AURUM you get back",
];

export function TokenCards() {
  return (
    <section id="aurum" className="px-6 py-28">
      <div className="max-w-[88rem] mx-auto">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-[#c8a04a] mb-4">
            Two tokens. One protocol.
          </p>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            A stable dollar, and a dollar that grows.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-10 border border-black/5">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-3xl font-medium tracking-tight">AURUM</h3>
              <span className="text-sm text-black/50">always $1.00</span>
            </div>
            <p className="text-black/70 mb-8">
              The composable dollar. Unit-stable, transferable, and native to every Sui
              protocol at the type level.
            </p>
            <div className="h-32 flex items-center justify-center mb-2 rounded-xl bg-[#f5f5f5]">
              <span
                className="text-6xl font-medium text-black"
                style={{ letterSpacing: "-0.04em" }}
              >
                $1.00
              </span>
            </div>
            <ul className="mt-8 space-y-3">
              {aurumPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 text-black/80">
                  <Check className="w-5 h-5 text-black mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black text-white rounded-2xl p-10">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-3xl font-medium tracking-tight">sAURUM</h3>
              <span className="text-sm text-white/50">index ↑ daily</span>
            </div>
            <p className="text-white/70 mb-8">
              The yield dollar. Stake AURUM and your balance tracks a rising accumulation
              index — compounded daily, verified on-chain.
            </p>
            <div className="rounded-xl bg-white/[0.04] p-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-white/50">Accumulation index</span>
                <span
                  className="text-xl font-medium text-[#c8a04a]"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  1.1200
                </span>
              </div>
              <IndexChart />
            </div>
            <ul className="mt-8 space-y-3">
              {sAurumPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 text-white/85">
                  <Check className="w-5 h-5 text-[#c8a04a] mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
