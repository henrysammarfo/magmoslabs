import type { EarningsPoint } from "../../lib/mock-data";

interface Props {
  data: EarningsPoint[];
}

export function EarningsChart({ data }: Props) {
  const w = 720;
  const h = 240;
  const pad = { l: 36, r: 16, t: 20, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.value));
  const min = 0;
  const stepX = innerW / (data.length - 1);

  const points = data.map((d, i) => {
    const x = pad.l + i * stepX;
    const y = pad.t + innerH - ((d.value - min) / (max - min)) * innerH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${pad.t + innerH}` +
    ` L ${points[0].x.toFixed(1)} ${pad.t + innerH} Z`;

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => pad.t + innerH * t);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto"
      role="img"
      aria-label="Cumulative earnings over the last 12 weeks"
    >
      <defs>
        <linearGradient id="earningsArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8A04A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C8A04A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="earningsLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B6A22" />
          <stop offset="50%" stopColor="#C8A04A" />
          <stop offset="100%" stopColor="#F1D38A" />
        </linearGradient>
      </defs>

      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={pad.l}
          x2={w - pad.r}
          y1={y}
          y2={y}
          stroke="#000"
          strokeOpacity="0.06"
          strokeDasharray="2 4"
        />
      ))}

      <path d={areaPath} fill="url(#earningsArea)" />
      <path d={linePath} fill="none" stroke="url(#earningsLine)" strokeWidth="2.5" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="#0A0A0A" />
      ))}

      {points
        .filter((_, i) => i % 2 === 0)
        .map((p) => (
          <text
            key={p.day}
            x={p.x}
            y={h - 8}
            textAnchor="middle"
            className="fill-black/40"
            fontSize="10"
          >
            {p.day}
          </text>
        ))}

      {[max, max / 2, 0].map((v, i) => (
        <text
          key={i}
          x={pad.l - 8}
          y={pad.t + (innerH / 2) * i + 4}
          textAnchor="end"
          className="fill-black/40"
          fontSize="10"
        >
          ${Math.round(v)}
        </text>
      ))}
    </svg>
  );
}
