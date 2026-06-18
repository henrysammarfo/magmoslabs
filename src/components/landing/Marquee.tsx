const partners = [
  "Sui",
  "Scallop",
  "DeepBook",
  "Aftermath",
  "Cetus",
  "Walrus",
  "Nautilus TEE",
];

export function Marquee() {
  const items = [...partners, ...partners];
  return (
    <div className="mt-20 w-full max-w-xl overflow-hidden magmos-marquee-mask">
      <div className="magmos-marquee-track flex gap-12 whitespace-nowrap w-max">
        {items.map((p, i) => (
          <span
            key={i}
            className="text-black/70 text-sm font-medium tracking-wide uppercase"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
