const rows = [
  ["Token ownership", "Balances in contract storage", "Move objects in your wallet"],
  ["Multi-step allocation", "Multiple txs, partial failure risk", "Single atomic PTB"],
  ["Rebalancing privacy", "Public — anyone front-runs", "Nautilus TEE — hidden until executed"],
  ["Reserve verification", "Off-chain attestations", "On-chain via Walrus MemWal"],
  ["Gas for stablecoin ops", "User needs native gas token", "Gasless USDC transfers"],
  ["Composability", "Manual wrapping / bridging", "Native to all Sui protocols"],
];

export function WhySui() {
  return (
    <section className="px-6 py-28">
      <div className="max-w-[88rem] mx-auto">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-[#c8a04a] mb-4">
            Why Sui
          </p>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Architecture only possible here.
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-5 text-sm font-medium text-black/50 uppercase tracking-wider border-b border-black/5">
            <div className="col-span-4">Feature</div>
            <div className="col-span-4">Other chains</div>
            <div className="col-span-4">Magmos on Sui</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r[0]}
              className={`grid grid-cols-1 md:grid-cols-12 px-8 py-6 gap-2 md:gap-0 ${
                i < rows.length - 1 ? "border-b border-black/5" : ""
              }`}
            >
              <div className="md:col-span-4 font-medium">{r[0]}</div>
              <div className="md:col-span-4 text-black/50">{r[1]}</div>
              <div className="md:col-span-4 text-black">{r[2]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
