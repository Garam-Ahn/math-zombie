
// OPTIMIZED FLAT ASSETS FOR OLDER DEVICES
// No Gradients (<defs>), No complex filters. Solid fills only.

const SVG_START = (content: string) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="optimizeSpeed">${content}</svg>`;

export const SVG_COIN = SVG_START(`
<circle cx="50" cy="50" r="40" fill="#eab308" stroke="#854d0e" stroke-width="4" />
<text x="50" y="65" font-family="monospace" font-weight="bold" font-size="50" text-anchor="middle" fill="#713f12">$</text>
<circle cx="50" cy="50" r="30" fill="none" stroke="#fef08a" stroke-width="2" opacity="0.5" />
`);

export const SVG_LOCK = SVG_START(`
<!-- Shackle -->
<path d="M30 40 L30 25 Q30 10 50 10 Q70 10 70 25 L70 40" fill="none" stroke="#9ca3af" stroke-width="8" stroke-linecap="round" />
<!-- Body -->
<rect x="20" y="40" width="60" height="50" rx="5" fill="#f59e0b" stroke="#b45309" stroke-width="3" />
<!-- Keyhole -->
<circle cx="50" cy="60" r="6" fill="#451a03" />
<path d="M50 60 L44 80 L56 80 Z" fill="#451a03" />
`);

// --- PLANTS (FLAT) ---

export const SVG_PEASHOOTER = (level: number) => SVG_START(`
<!-- Shadow -->
<ellipse cx="50" cy="90" rx="25" ry="6" fill="#000000" opacity="0.2" />

<!-- Leaves -->
<path d="M50 90 Q30 70 20 90 Q30 100 50 90 Z" fill="#15803d" />
<path d="M50 90 Q70 70 80 90 Q70 100 50 90 Z" fill="#15803d" />

<!-- Stem -->
<path d="M50 90 Q40 60 45 50" fill="none" stroke="#16a34a" stroke-width="6" stroke-linecap="round" />

<!-- Head Group -->
<g transform="translate(5, 0)">
    <!-- Leaf hair -->
    <path d="M35 30 Q25 10 45 20" fill="#22c55e" stroke="#14532d" stroke-width="1" />

    <!-- Main Head Sphere -->
    <circle cx="45" cy="40" r="22" fill="${level > 2 ? '#fcd34d' : '#4ade80'}" stroke="#14532d" stroke-width="2" />
    
    <!-- Level 2+ Helmet/Upgrade Indicator -->
    ${level > 1 ? `<path d="M25 35 Q45 10 65 35" fill="none" stroke="${level > 2 ? '#f59e0b' : '#3b82f6'}" stroke-width="4" stroke-linecap="round" />` : ''}

    <!-- Snout -->
    <path d="M60 25 L80 15 L80 65 L60 55 Z" fill="#22c55e" stroke="#14532d" stroke-width="2" />
    <ellipse cx="80" cy="40" rx="6" ry="25" fill="#14532d" />
    <ellipse cx="80" cy="40" rx="4" ry="20" fill="#000" />
    
    <!-- Eyes -->
    <circle cx="38" cy="35" r="5" fill="black" />
    <circle cx="36" cy="33" r="1.5" fill="white" />
    <circle cx="52" cy="35" r="5" fill="black" />
    <circle cx="50" cy="33" r="1.5" fill="white" />
</g>
`);

export const SVG_SUNFLOWER = (level: number) => SVG_START(`
<!-- Shadow -->
<ellipse cx="50" cy="90" rx="25" ry="6" fill="#000000" opacity="0.2" />

<!-- Stem -->
<path d="M50 90 Q55 70 50 55" fill="none" stroke="#15803d" stroke-width="5" stroke-linecap="round" />
<path d="M25 85 Q35 95 50 90" fill="#15803d" />
<path d="M75 85 Q65 95 50 90" fill="#15803d" />

<g class="petals" style="transform-origin: 50% 50%;">
  ${[0,45,90,135,180,225,270,315].map(deg => 
    `<path d="M50 15 L60 35 L50 45 L40 35 Z" fill="${level > 1 ? '#facc15' : '#fef08a'}" stroke="#ca8a04" stroke-width="1" transform="rotate(${deg} 50 50)" />`
  ).join('')}
</g>

<!-- Face -->
<circle cx="50" cy="50" r="20" fill="#d97706" stroke="#78350f" stroke-width="2" />
${level > 1 ? '<circle cx="50" cy="50" r="23" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="4,4" />' : ''}

<!-- Face Details -->
<ellipse cx="43" cy="45" rx="3" ry="5" fill="black" />
<ellipse cx="57" cy="45" rx="3" ry="5" fill="black" />
<path d="M42 58 Q50 63 58 58" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" />
`);

export const SVG_WALLNUT = (level: number) => SVG_START(`
<!-- Shadow -->
<ellipse cx="50" cy="92" rx="25" ry="5" fill="#000000" opacity="0.2" />

<!-- Body -->
<path d="M20 40 Q20 10 50 10 Q80 10 80 40 Q80 90 50 90 Q20 90 20 40 Z" fill="#d97706" stroke="${level > 1 ? '#facc15' : '#78350f'}" stroke-width="3" />

<!-- Eyes -->
<circle cx="38" cy="45" r="8" fill="white" />
<circle cx="40" cy="45" r="2.5" fill="black" />
<circle cx="62" cy="45" r="8" fill="white" />
<circle cx="60" cy="45" r="2.5" fill="black" />

<!-- Mouth -->
<path d="M45 70 L55 70" stroke="#451a03" stroke-width="2" stroke-linecap="round" />
`);

export const SVG_CHERRYBOMB = (level: number) => SVG_START(`
<!-- Shadow -->
<ellipse cx="50" cy="90" rx="25" ry="6" fill="#000000" opacity="0.2" />

<!-- Stems -->
<path d="M50 50 Q60 20 80 10" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
<path d="M50 50 Q40 20 30 15" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>

<!-- Cherry 1 -->
<circle cx="35" cy="65" r="22" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/>
<path d="M25 62 L35 70" stroke="black" stroke-width="2"/>
<path d="M45 62 L35 70" stroke="black" stroke-width="2"/>

<!-- Cherry 2 -->
<circle cx="65" cy="70" r="24" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
<path d="M55 72 L65 80" stroke="black" stroke-width="2"/>
<path d="M75 72 L65 80" stroke="black" stroke-width="2"/>

<!-- Fuse -->
<path d="M80 10 Q85 0 90 5" fill="none" stroke="#d97706" stroke-width="2" />
<circle cx="90" cy="5" r="4" fill="#facc15" />
`);

// --- ZOMBIES (FLAT) ---

const ZOMBIE_BASE = `
  <!-- Shadow -->
  <ellipse cx="50" cy="95" rx="20" ry="4" fill="#000000" opacity="0.2" />

  <!-- Legs -->
  <path d="M45 80 L35 100" stroke="#374151" stroke-width="6" stroke-linecap="round"/>
  <path d="M55 80 L65 100" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
  
  <!-- Coat -->
  <path d="M35 50 L65 50 L70 85 L30 85 Z" fill="#78350f" stroke="#271300" stroke-width="2"/>
  <path d="M48 50 L52 50 L55 70 L45 70 Z" fill="#ef4444" /> <!-- Tie -->
  
  <!-- Arms -->
  <path d="M35 55 L15 65" stroke="#5d3515" stroke-width="6" stroke-linecap="round"/>
  <circle cx="15" cy="65" r="5" fill="#a3e635"/>
`;

const ZOMBIE_HEAD = `
  <path d="M35 15 Q30 15 30 35 Q30 55 50 55 Q70 55 70 35 Q70 15 65 15" fill="#a3e635" stroke="#365314" stroke-width="2"/>
  <circle cx="42" cy="30" r="7" fill="white" stroke="#365314" stroke-width="1"/>
  <circle cx="42" cy="30" r="2" fill="black"/>
  <circle cx="60" cy="30" r="6" fill="white" stroke="#365314" stroke-width="1"/>
  <circle cx="60" cy="30" r="1.5" fill="black"/>
  <rect x="48" y="48" width="5" height="5" fill="#fefce8" stroke="#365314" stroke-width="1"/>
`;

export const SVG_ZOMBIE_NORMAL = SVG_START(`
${ZOMBIE_BASE}
<g class="headGroup">
  ${ZOMBIE_HEAD}
  <path d="M45 15 L45 5 M50 15 L52 7 M55 15 L58 8" stroke="black" stroke-width="2"/>
</g>
`);

export const SVG_ZOMBIE_CONE = SVG_START(`
${ZOMBIE_BASE}
<g class="headGroup">
  ${ZOMBIE_HEAD}
  <!-- Cone -->
  <path d="M25 20 L75 20 L50 -15 Z" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
  <ellipse cx="50" cy="20" rx="26" ry="5" fill="#c2410c"/>
</g>
`);

export const SVG_ZOMBIE_BUCKET = SVG_START(`
${ZOMBIE_BASE}
<g class="headGroup">
  ${ZOMBIE_HEAD}
  <!-- Bucket -->
  <path d="M30 10 L70 10 L68 35 L32 35 Z" fill="#9ca3af" stroke="#374151" stroke-width="2" transform="translate(0, -10)"/>
  <circle cx="40" cy="5" r="4" fill="#ef4444" opacity="0.8"/>
</g>
`);

export const SVG_ZOMBIE_BOSS = SVG_START(`
<!-- Shadow -->
<ellipse cx="50" cy="95" rx="35" ry="8" fill="#000000" opacity="0.2" />

<!-- Robot Legs -->
<path d="M25 85 L20 100" stroke="#374151" stroke-width="10" stroke-linecap="round"/>
<path d="M75 85 L80 100" stroke="#374151" stroke-width="10" stroke-linecap="round"/>

<!-- Robot Body -->
<path d="M20 30 L80 30 L85 85 L15 85 Z" fill="#6b7280" stroke="#1f2937" stroke-width="3"/>
<rect x="40" y="50" width="20" height="15" fill="#374151" rx="2"/> 
<circle cx="50" cy="57" r="4" fill="#ef4444" /> 

<!-- Robot Arms -->
<path d="M20 40 L5 60" stroke="#374151" stroke-width="8" stroke-linecap="round"/>
<circle cx="5" cy="60" r="6" fill="#4b5563"/>
<path d="M80 40 L95 60" stroke="#374151" stroke-width="8" stroke-linecap="round"/>
<circle cx="95" cy="60" r="6" fill="#4b5563"/>

<!-- Glass Dome -->
<path d="M25 30 Q25 0 50 0 Q75 0 75 30" fill="#a5f3fc" stroke="#0891b2" stroke-width="2" opacity="0.7"/>

<!-- Dr. Zomboss -->
<g transform="translate(40, 10) scale(0.6)">
    <path d="M10 20 Q10 0 25 0 Q40 0 40 20 L40 40 L10 40 Z" fill="#a3e635" stroke="#365314" stroke-width="2"/>
    <rect x="15" y="40" width="20" height="15" fill="white"/>
    <circle cx="20" cy="15" r="3" fill="black"/>
    <circle cx="30" cy="15" r="3" fill="black"/>
</g>
`);
