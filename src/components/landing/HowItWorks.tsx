import { Coins, Flame, TrendingUp, ArrowDownToLine } from "lucide-react";

const steps = [
  {
    icon: Coins,
    name: "Forge",
    desc: "Deposit USDC. Receive AURUM 1:1 immediately as a Move object in your wallet.",
  },
  {
    icon: Flame,
    name: "Smelt",
    desc: "Stake AURUM and receive sAURUM at the current accumulation index.",
  },
  {
    icon: TrendingUp,
    name: "Compound",
    desc: "Yield from Scallop, DeepBook, and Aftermath flows in and lifts the index daily.",
  },
  {
    icon: ArrowDownToLine,
    name: "Refine",
    desc: "Unstake any time. sAURUM burns and you receive AURUM at the higher index.",
  },
];

export function HowItWorks() {
  return (
    <section id="protocol" className="px-6 py-28">
      <div className="max-w-[88rem] mx-auto">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-[#c8a04a] mb-4">
            How it works
          </p>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Four flows. One atomic transaction.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div
              key={s.name}
              className="bg-white rounded-2xl p-8 border border-black/5 relative"
            >
              <span className="absolute top-6 right-6 text-sm text-black/30 font-medium">
                0{i + 1}
              </span>
              <s.icon className="w-7 h-7 text-black mb-10" strokeWidth={1.5} />
              <h3 className="text-2xl font-medium mb-2 tracking-tight">{s.name}</h3>
              <p className="text-black/70 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
