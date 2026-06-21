import type { EarningsPoint } from "../../lib/live-data";

interface Props {
  data: EarningsPoint[];
}

export function EarningsChart({ data }: Props) {
  const w = 720;
  const h = 260;
  const pad = { l: 40, r: 20, t: 24, b: 32 };
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

  // Smooth Catmull-Rom -> Bezier
  const smooth = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  };

  const linePath = smooth(points);
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(2)} ${pad.t + innerH}` +
    ` L ${points[0].x.toFixed(2)} ${pad.t + innerH} Z`;

  const last = points[points.length - 1];
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
          <stop offset="60%" stopColor="#C8A04A" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C8A04A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="earningsLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B6A22" />
          <stop offset="50%" stopColor="#C8A04A" />
          <stop offset="100%" stopColor="#F1D38A" />
        </linearGradient>
        <radialGradient id="earningsGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8A04A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C8A04A" stopOpacity="0" />
        </radialGradient>
        <filter id="earningsBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={pad.l}
          x2={w - pad.r}
          y1={y}
          y2={y}
          stroke="#0A0A0A"
          strokeOpacity="0.06"
          strokeDasharray="2 6"
        />
      ))}

      <path d={areaPath} fill="url(#earningsArea)" className="magmos-area-in" />

      {/* soft underline glow */}
      <path
        d={linePath}
        fill="none"
        stroke="#C8A04A"
        strokeOpacity="0.45"
        strokeWidth="6"
        filter="url(#earningsBlur)"
      />

      <path
        d={linePath}
        fill="none"
        stroke="url(#earningsLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="magmos-line-draw"
      />

      {/* leading pulse */}
      <circle cx={last.x} cy={last.y} r={4} fill="url(#earningsGlow)" className="magmos-pulse-ring" />
      <circle cx={last.x} cy={last.y} r={4} fill="#0A0A0A" stroke="#fff" strokeWidth="2" />

      {points
        .filter((_, i) => i % 2 === 0)
        .map((p) => (
          <text
            key={p.day}
            x={p.x}
            y={h - 10}
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
          x={pad.l - 10}
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
