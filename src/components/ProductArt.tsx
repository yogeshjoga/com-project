import type { ArtKind } from "@/lib/types";

// Inline technical line-art per product type. Zero network requests, crisp at any size.
// Swap for real photography by replacing this component's usage with next/image.

const S = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Prop({ cx, cy, r = 26 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} {...S} strokeOpacity={0.25} strokeDasharray="4 6" />
      <ellipse cx={cx} cy={cy} rx={r} ry={5} fill="var(--art-accent)" opacity={0.85} transform={`rotate(-20 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={6} fill="currentColor" />
    </g>
  );
}

const shapes: Record<ArtKind, React.ReactNode> = {
  quad: (
    <g>
      <path d="M58 48 L142 102 M142 48 L58 102" {...S} strokeWidth={7} />
      <rect x="82" y="60" width="36" height="30" rx="5" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="92" y="52" width="16" height="10" rx="2" {...S} />
      <Prop cx={52} cy={44} /><Prop cx={148} cy={44} /><Prop cx={52} cy={106} /><Prop cx={148} cy={106} />
    </g>
  ),
  whoop: (
    <g>
      {[[58, 50], [142, 50], [58, 100], [142, 100]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r={27} {...S} strokeWidth={5} />
          <Prop cx={x} cy={y} r={20} />
        </g>
      ))}
      <rect x="84" y="62" width="32" height="26" rx="6" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
    </g>
  ),
  camdrone: (
    <g>
      <path d="M50 52 L82 66 M150 52 L118 66 M50 98 L82 84 M150 98 L118 84" {...S} strokeWidth={6} />
      <path d="M78 60 Q100 46 122 60 L122 90 Q100 100 78 90 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <circle cx="100" cy="98" r="8" {...S} />
      <Prop cx={44} cy={48} r={22} /><Prop cx={156} cy={48} r={22} /><Prop cx={44} cy={102} r={22} /><Prop cx={156} cy={102} r={22} />
    </g>
  ),
  wing: (
    <g>
      <path d="M20 92 L100 46 L180 92 L150 98 L100 78 L50 98 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M100 46 L100 112" {...S} />
      <path d="M44 84 L44 66 M156 84 L156 66" {...S} />
      <ellipse cx="44" cy="62" rx="16" ry="4" {...S} /><ellipse cx="156" cy="62" rx="16" ry="4" {...S} />
    </g>
  ),
  goggles: (
    <g>
      <path d="M40 58 Q100 38 160 58 L160 96 Q130 106 112 94 Q100 86 88 94 Q70 106 40 96 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M40 72 L20 76 M160 72 L180 76" {...S} strokeWidth={6} />
      <path d="M70 46 L66 32 M130 46 L134 32" {...S} />
      <circle cx="66" cy="30" r="4" fill="currentColor" /><circle cx="134" cy="30" r="4" fill="currentColor" />
    </g>
  ),
  airunit: (
    <g>
      <rect x="60" y="56" width="80" height="50" rx="6" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="84" y="36" width="32" height="22" rx="4" {...S} />
      <circle cx="100" cy="47" r="7" fill="currentColor" />
      <path d="M140 72 L168 60 M140 90 L168 102" {...S} />
      <circle cx="170" cy="58" r="5" {...S} /><circle cx="170" cy="104" r="5" {...S} />
    </g>
  ),
  fpvcam: (
    <g>
      <rect x="66" y="48" width="68" height="60" rx="8" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <circle cx="100" cy="78" r="20" {...S} /><circle cx="100" cy="78" r="9" fill="currentColor" />
      <path d="M60 64 L66 64 M134 64 L140 64" {...S} />
    </g>
  ),
  antenna: (
    <g>
      <path d="M100 120 L100 62" {...S} strokeWidth={5} />
      <path d="M78 52 Q100 22 122 52 Q100 40 78 52 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M70 40 Q100 4 130 40" {...S} strokeOpacity={0.35} />
      <rect x="92" y="114" width="16" height="12" rx="2" fill="currentColor" />
    </g>
  ),
  frame: (
    <g>
      <path d="M48 40 L152 110 M152 40 L48 110" {...S} strokeWidth={10} />
      <path d="M48 40 L152 110 M152 40 L48 110" stroke="var(--art-accent)" strokeWidth={4} strokeLinecap="round" />
      <rect x="80" y="58" width="40" height="34" rx="4" {...S} />
      {[[48, 40], [152, 40], [48, 110], [152, 110]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={9} {...S} />)}
    </g>
  ),
  motor: (
    <g>
      <ellipse cx="100" cy="98" rx="42" ry="12" {...S} />
      <path d="M58 98 L58 62 M142 98 L142 62" {...S} />
      <ellipse cx="100" cy="62" rx="42" ry="12" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M100 62 L100 32" {...S} strokeWidth={5} />
      {[70, 86, 114, 130].map((x) => <path key={x} d={`M${x} 72 L${x} 98`} {...S} strokeOpacity={0.35} />)}
    </g>
  ),
  esc: (
    <g>
      <rect x="50" y="44" width="100" height="64" rx="5" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      {[64, 88, 112].map((x) => <rect key={x} x={x} y="58" width="18" height="14" rx="2" fill="currentColor" />)}
      <path d="M150 64 L178 64 M150 88 L178 88" {...S} strokeWidth={5} />
      <circle cx="62" cy="96" r="4" fill="currentColor" /><circle cx="138" cy="96" r="4" fill="currentColor" />
    </g>
  ),
  board: (
    <g>
      <rect x="50" y="36" width="100" height="80" rx="6" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="84" y="60" width="32" height="32" rx="3" fill="currentColor" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${86 + i * 7} 60 L${86 + i * 7} 52 M${86 + i * 7} 92 L${86 + i * 7} 100`} {...S} strokeWidth={2} />)}
      {[[58, 44], [142, 44], [58, 108], [142, 108]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={4} {...S} strokeWidth={2} />)}
    </g>
  ),
  prop: (
    <g>
      <path d="M100 76 C70 40 40 44 36 56 C34 66 70 72 100 76 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M100 76 C130 112 160 108 164 96 C166 86 130 80 100 76 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M100 76 C118 40 112 22 104 22 C94 22 96 50 100 76 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} opacity={0.75} />
      <circle cx="100" cy="76" r="9" fill="currentColor" />
    </g>
  ),
  gps: (
    <g>
      <rect x="62" y="46" width="76" height="60" rx="30" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="84" y="62" width="32" height="28" rx="3" {...S} />
      <path d="M100 30 Q118 30 124 42 M100 22 Q128 22 136 40" {...S} strokeOpacity={0.4} />
      <path d="M100 106 L100 124" {...S} />
    </g>
  ),
  radio: (
    <g>
      <path d="M44 60 Q48 44 70 44 L130 44 Q152 44 156 60 L164 108 Q166 120 150 120 L50 120 Q34 120 36 108 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="80" y="54" width="40" height="24" rx="3" fill="currentColor" />
      <circle cx="66" cy="96" r="12" {...S} /><circle cx="134" cy="96" r="12" {...S} />
      <path d="M66 96 L66 82 M134 96 L134 82" {...S} strokeWidth={5} />
      <path d="M150 44 L162 14" {...S} strokeWidth={5} />
    </g>
  ),
  receiver: (
    <g>
      <rect x="76" y="58" width="48" height="34" rx="4" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M124 70 Q150 70 160 44 M124 80 Q150 80 160 106" {...S} />
      <path d="M154 40 L166 48 M154 110 L166 102" {...S} strokeWidth={5} />
      <path d="M76 66 L56 66 M76 76 L56 76 M76 86 L56 86" {...S} strokeWidth={2} />
      <circle cx="92" cy="75" r="4" fill="currentColor" />
    </g>
  ),
  battery: (
    <g>
      <rect x="44" y="50" width="104" height="52" rx="8" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M44 66 L148 66" {...S} strokeOpacity={0.35} />
      <path d="M148 64 Q166 64 166 48 M148 88 Q172 90 172 62" {...S} />
      <rect x="160" y="34" width="18" height="16" rx="2" fill="currentColor" />
      <path d="M86 78 L96 78 M91 73 L91 83 M104 78 L114 78" {...S} />
    </g>
  ),
  charger: (
    <g>
      <rect x="46" y="40" width="108" height="76" rx="8" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="60" y="52" width="56" height="34" rx="3" fill="currentColor" />
      <path d="M78 60 L72 70 L84 70 L78 80" stroke="var(--art-accent)" strokeWidth={3} fill="none" />
      <circle cx="134" cy="62" r="6" {...S} /><circle cx="134" cy="84" r="6" {...S} />
      <path d="M62 102 L118 102" {...S} strokeOpacity={0.4} />
    </g>
  ),
  cable: (
    <g>
      <path d="M30 100 C70 120 80 40 120 60 S160 90 170 50" {...S} strokeWidth={6} />
      <path d="M30 100 C70 120 80 40 120 60 S160 90 170 50" stroke="var(--art-accent)" strokeWidth={2.5} fill="none" />
      <rect x="160" y="30" width="22" height="22" rx="3" fill="currentColor" />
      <rect x="16" y="94" width="20" height="18" rx="3" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
    </g>
  ),
  actioncam: (
    <g>
      <rect x="54" y="44" width="92" height="66" rx="10" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <circle cx="116" cy="78" r="20" {...S} /><circle cx="116" cy="78" r="10" fill="currentColor" />
      <rect x="66" y="54" width="22" height="14" rx="2" fill="currentColor" />
      <path d="M70 110 L70 122 L86 122 L86 110" {...S} />
    </g>
  ),
  gimbal: (
    <g>
      <rect x="84" y="20" width="32" height="14" rx="3" fill="currentColor" />
      <path d="M100 34 L100 46 M72 46 L128 46 L128 64 M72 46 L72 86" {...S} strokeWidth={4} />
      <circle cx="104" cy="88" r="28" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <circle cx="104" cy="88" r="13" {...S} /><circle cx="104" cy="88" r="5" fill="currentColor" />
    </g>
  ),
  meter: (
    <g>
      <rect x="62" y="24" width="76" height="104" rx="10" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="72" y="34" width="56" height="26" rx="3" fill="currentColor" />
      <circle cx="100" cy="88" r="16" {...S} /><path d="M100 88 L110 78" {...S} />
      <circle cx="80" cy="118" r="4" fill="currentColor" /><circle cx="120" cy="118" r="4" fill="currentColor" />
    </g>
  ),
  iron: (
    <g>
      <path d="M34 112 L80 76" {...S} strokeWidth={3} />
      <rect x="78" y="44" width="92" height="32" rx="14" transform="rotate(-28 124 60)" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M170 34 Q182 30 186 40" {...S} />
      <circle cx="30" cy="116" r="3" fill="currentColor" />
    </g>
  ),
  tool: (
    <g>
      <path d="M50 110 L118 42" {...S} strokeWidth={6} />
      <rect x="112" y="18" width="28" height="56" rx="10" transform="rotate(45 126 46)" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <path d="M70 112 L150 112" {...S} strokeOpacity={0.3} />
    </g>
  ),
  bag: (
    <g>
      <path d="M58 52 Q58 30 100 30 Q142 30 142 52 L148 118 Q148 126 140 126 L60 126 Q52 126 52 118 Z" fill="var(--art-accent)" stroke="currentColor" strokeWidth={3} />
      <rect x="74" y="74" width="52" height="30" rx="6" {...S} />
      <path d="M84 30 Q84 16 100 16 Q116 16 116 30" {...S} />
    </g>
  ),
};

export function ProductArt({ kind, hue, className, color = "var(--ink)" }: { kind: ArtKind; hue: number; className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-hidden="true"
      style={{ ["--art-accent" as string]: `oklch(0.86 0.09 ${hue})`, color }}
    >
      {shapes[kind]}
    </svg>
  );
}
