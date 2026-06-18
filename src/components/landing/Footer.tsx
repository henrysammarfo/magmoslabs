import { LogoIcon } from "./LogoIcon";

const cols = [
  {
    title: "Protocol",
    links: ["AURUM", "sAURUM", "Reserves", "Audits"],
  },
  {
    title: "Developers",
    links: ["Docs", "Move SDK", "GitHub", "Integrations"],
  },
  {
    title: "Community",
    links: ["X / Twitter", "Discord", "Mirror", "Brand kit"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Disclosures"],
  },
];

export function Footer() {
  return (
    <footer className="px-6 pt-20 pb-10">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid md:grid-cols-5 gap-12 pb-16 border-b border-black/10">
          <div className="md:col-span-2 max-w-sm">
            <div className="flex items-center gap-2 mb-4 text-black">
              <LogoIcon className="w-6 h-6" />
              <span className="text-xl font-medium tracking-tight">Magmos</span>
            </div>
            <p className="text-black/60 leading-relaxed">
              Sui's composable yield dollar protocol. Magma creates gold. The protocol
              creates composable yield.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-medium text-black mb-4">{c.title}</p>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-black/60 hover:text-black transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-black/50">
          <span>© 2026 Magmos Labs. All rights reserved.</span>
          <span>Sui Overflow 2026 · DeFi &amp; Payments</span>
        </div>
      </div>
    </footer>
  );
}
