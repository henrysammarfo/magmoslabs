import { ShieldCheck } from "lucide-react";

const stats = [
  { label: "Total reserves", value: "$24.8M", sub: "100% in Scallop / Aftermath / DeepBook" },
  { label: "Accumulation index", value: "1.1247", sub: "Updated 4 hours ago" },
  { label: "30-day APY", value: "12.4%", sub: "Multi-protocol yield, compounded daily" },
];

export function Reserves() {
  return (
    <section id="reserves" className="px-6 py-28">
      <div className="max-w-[88rem] mx-auto bg-white rounded-2xl border border-black/5 p-10 md:p-16">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-[#c8a04a]" />
          <span className="text-sm font-medium uppercase tracking-widest text-[#c8a04a]">
            Proof of reserves
          </span>
        </div>
        <h2
          className="text-4xl md:text-5xl font-medium leading-tight max-w-3xl mb-12"
          style={{ letterSpacing: "-0.03em" }}
        >
          100% on-chain reserves, verified via Walrus MemWal.
        </h2>

        <div className="grid md:grid-cols-3 gap-10 md:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="border-t border-black/10 pt-6">
              <p className="text-sm text-black/50 mb-3">{s.label}</p>
              <p
                className="text-5xl font-medium mb-3"
                style={{ letterSpacing: "-0.04em" }}
              >
                {s.value}
              </p>
              <p className="text-sm text-black/60">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
