
// High Fidelity Vector Assets with Gradients
// Uses local definitions within SVGs to ensure portability

const SVG_START = (content: string) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

export const SVG_COIN = SVG_START(`
<defs>
  <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#fef08a;stop-opacity:1" />
    <stop offset="50%" style="stop-color:#eab308;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#a16207;stop-opacity:1" />
  </linearGradient>
</defs>
<circle cx="50" cy="50" r="40" fill="url(#coinGrad)" stroke="#854d0e" stroke-width="4" />
<text x="50" y="65" font-family="monospace" font-weight="bold" font-size="50" text-anchor="middle" fill="#854d0e">$</text>
<circle cx="50" cy="50" r="30" fill="none" stroke="#fde047" stroke-width="2" opacity="0.5" />
`);

// --- PLANTS ---

export const SVG_PEASHOOTER = (level: number) => SVG_START(`
<defs>
  <radialGradient id="peaHead" cx="40%" cy="40%" r="60%">
    <stop offset="0%" style="stop-color:${level > 2 ? '#fcd34d' : '#86efac'};stop-opacity:1" />
    <stop offset="100%" style="stop-color:${level > 2 ? '#b45309' : '#16a34a'};stop-opacity:1" />
  </radialGradient>
  <linearGradient id="peaStem" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#14532d;stop-opacity:1" />
  </linearGradient>
</defs>

<!-- Shadow -->
<ellipse cx="50" cy="90" rx="30" ry="8" fill="rgba(0,0,0,0.3)" />

<!-- Leaves -->
<path d="M50 90 Q30 70 20 90 Q30 100 50 90 Z" fill="#15803d" />
<path d="M50 90 Q70 70 80 90 Q70 100 50 90 Z" fill="#15803d" />

<!-- Stem -->
<path d="M50 90 Q40 60 45 50" fill="none" stroke="url(#peaStem)" stroke-width="6" stroke-linecap="round" />

<!-- Head Group -->
<g transform="translate(5, 0)">
    <!-- Leaf hair -->
    <path d="M35 30 Q25 10 45 20" fill="#22c55e" stroke="#14532d" stroke-width="1" />

    <!-- Main Head Sphere -->
    <circle cx="45" cy="40" r="22" fill="url(#peaHead)" stroke="#14532d" stroke-width="1" />
    
    <!-- Level 2+ Helmet/Upgrade Indicator -->
    ${level > 1 ? `<path d="M25 35 Q45 10 65 35" fill="none" stroke="${level > 2 ? '#f59e0b' : '#3b82f6'}" stroke-width="4" stroke-linecap="round" />` : ''}

    <!-- Snout (Trumpet shape) -->
    <path d="M60 25 L80 15 L80 65 L60 55 Z" fill="#22c55e" stroke="#14532d" stroke-width="1" />
    <ellipse cx="80" cy="40" rx="6" ry="25" fill="#14532d" /> <!-- Hole -->
    <ellipse cx="80" cy="40" rx="4" ry="20" fill="#000" />
    
    <!-- Eyes -->
    <g>
        <ellipse cx="38" cy="35" rx="5" ry="7" fill="black" />
        <circle cx="36" cy="33" r="2" fill="white" /> <!-- Shine -->
        <ellipse cx="52" cy="35" rx="5" ry="7" fill="black" />
        <circle cx="50" cy="33" r="2" fill="white" />
    </g>
</g>
`);

export const SVG_SUNFLOWER = (level: number) => SVG_START(`
<defs>
  <radialGradient id="sunFace" cx="50%" cy="50%" r="50%">
    <stop offset="70%" style="stop-color:#d97706;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#78350f;stop-opacity:1" />
  </radialGradient>
  <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:${level > 1 ? '#fde047' : '#fef08a'};stop-opacity:1" />
    <stop offset="100%" style="stop-color:#eab308;stop-opacity:1" />
  </linearGradient>
</defs>

<!-- Shadow -->
<ellipse cx="50" cy="90" rx="25" ry="6" fill="rgba(0,0,0,0.3)" />

<!-- Stem -->
<path d="M50 90 Q55 70 50 55" fill="none" stroke="#15803d" stroke-width="5" stroke-linecap="round" />
<path d="M50 90 Q30 80 25 85 Q35 95 50 90" fill="#15803d" />
<path d="M50 90 Q70 80 75 85 Q65 95 50 90" fill="#15803d" />

<g class="petals" style="transform-origin: 50% 50%;">
  <!-- Draw multiple petals -->
  ${[0,45,90,135,180,225,270,315].map(deg => 
    `<path d="M50 15 L60 35 L50 45 L40 35 Z" fill="url(#petalGrad)" stroke="#ca8a04" stroke-width="1" transform="rotate(${deg} 50 50)" />`
  ).join('')}
</g>

<!-- Face -->
<circle cx="50" cy="50" r="20" fill="url(#sunFace)" stroke="#78350f" stroke-width="2" />
<!-- Level indicator -->
${level > 1 ? '<circle cx="50" cy="50" r="23" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="4,4" />' : ''}

<!-- Cheery Face -->
<ellipse cx="43" cy="45" rx="4" ry="6" fill="black" />
<circle cx="41" cy="43" r="1.5" fill="white" />
<ellipse cx="57" cy="45" rx="4" ry="6" fill="black" />
<circle cx="55" cy="43" r="1.5" fill="white" />
<path d="M42 58 Q50 65 58 58" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" />
`);

export const SVG_WALLNUT = (level: number) => SVG_START(`
<defs>
  <radialGradient id="nutBody" cx="40%" cy="40%" r="70%">
    <stop offset="0%" style="stop-color:#d97706;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#78350f;stop-opacity:1" />
  </radialGradient>
</defs>

<!-- Shadow -->
<ellipse cx="50" cy="92" rx="30" ry="6" fill="rgba(0,0,0,0.3)" />

<g class="body">
  <!-- Nut Shape -->
  <path d="M20 40 Q20 10 50 10 Q80 10 80 40 Q80 90 50 90 Q20 90 20 40 Z" fill="url(#nutBody)" stroke="${level > 1 ? '#facc15' : '#451a03'}" stroke-width="${level > 1 ? '5' : '3'}" />
  
  <!-- Texture Lines -->
  <path d="M30 30 Q50 40 70 30" fill="none" stroke="#92400e" stroke-width="2" opacity="0.6" />
  <path d="M25 60 Q50 70 75 60" fill="none" stroke="#92400e" stroke-width="2" opacity="0.6" />
  
  <!-- Worried Eyes (Big & Glossy) -->
  <circle cx="38" cy="45" r="10" fill="white" stroke="#451a03" stroke-width="1" />
  <circle cx="40" cy="45" r="3" fill="black" />
  
  <circle cx="62" cy="45" r="10" fill="white" stroke="#451a03" stroke-width="1" />
  <circle cx="60" cy="45" r="3" fill="black" />
  
  <!-- Mouth -->
  <path d="M45 70 L55 70" stroke="#451a03" stroke-width="3" stroke-linecap="round" />
  
  ${level > 1 ? `<path d="M20 40 L80 40" stroke="#facc15" stroke-width="2" opacity="0.5" />` : ''}
</g>
`);

export const SVG_CHERRYBOMB = (level: number) => SVG_START(`
<defs>
  <radialGradient id="cherryRed" cx="30%" cy="30%" r="60%">
    <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#7f1d1d;stop-opacity:1" />
  </radialGradient>
</defs>

<!-- Shadow -->
<ellipse cx="50" cy="90" rx="25" ry="6" fill="rgba(0,0,0,0.3)" />

<!-- Stems -->
<path d="M50 50 Q60 20 80 10" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
<path d="M50 50 Q40 20 30 15" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>

<!-- Cherry 1 (Left) -->
<g class="cherry1">
  <circle cx="35" cy="65" r="22" fill="url(#cherryRed)" stroke="#450a0a" stroke-width="2"/>
  <ellipse cx="25" cy="55" rx="6" ry="3" fill="rgba(255,255,255,0.4)" transform="rotate(-45 25 55)"/>
  <path d="M25 62 L35 70" stroke="black" stroke-width="3" stroke-linecap="round"/>
  <path d="M45 62 L35 70" stroke="black" stroke-width="3" stroke-linecap="round"/>
</g>

<!-- Cherry 2 (Right) -->
<g class="cherry2">
  <circle cx="65" cy="70" r="24" fill="url(#cherryRed)" stroke="#450a0a" stroke-width="2"/>
  <ellipse cx="55" cy="60" rx="6" ry="3" fill="rgba(255,255,255,0.4)" transform="rotate(-45 55 60)"/>
  <path d="M55 72 L65 80" stroke="black" stroke-width="3" stroke-linecap="round"/>
  <path d="M75 72 L65 80" stroke="black" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Fuse -->
  <path d="M80 10 Q85 0 90 5" fill="none" stroke="#d97706" stroke-width="2" />
  <circle cx="90" cy="5" r="4" fill="#facc15" class="fuse" />
  <circle cx="90" cy="5" r="2" fill="orange" />
</g>
`);

// --- ZOMBIES ---

const ZOMBIE_DEFS = `
<defs>
  <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" style="stop-color:#a3e635;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#4d7c0f;stop-opacity:1" />
  </linearGradient>
  <linearGradient id="coat" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:#78350f;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#451a03;stop-opacity:1" />
  </linearGradient>
  <linearGradient id="cone" x1="0%" y1="0%" x2="100%" y2="0%">
     <stop offset="0%" style="stop-color:#fb923c;stop-opacity:1" />
     <stop offset="100%" style="stop-color:#c2410c;stop-opacity:1" />
  </linearGradient>
  <linearGradient id="bucket" x1="0%" y1="0%" x2="100%" y2="0%">
     <stop offset="0%" style="stop-color:#d1d5db;stop-opacity:1" />
     <stop offset="100%" style="stop-color:#6b7280;stop-opacity:1" />
  </linearGradient>
  <linearGradient id="football" x1="0%" y1="0%" x2="100%" y2="0%">
     <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
     <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
  </linearGradient>
</defs>
`;

const ZOMBIE_BODY = `
  <!-- Shadow -->
  <ellipse cx="50" cy="95" rx="25" ry="5" fill="rgba(0,0,0,0.3)" />

  <!-- Back Leg -->
  <g class="legs">
    <path d="M45 80 L35 100 L25 100" fill="none" stroke="#374151" stroke-width="8" stroke-linecap="round"/>
  </g>
  
  <!-- Body Coat -->
  <path d="M35 50 L65 50 L70 85 L30 85 Z" fill="url(#coat)" stroke="#271300" stroke-width="2"/>
  <path d="M50 50 L50 85" stroke="#271300" stroke-width="1" opacity="0.5"/>
  
  <!-- Tie -->
  <path d="M48 50 L52 50 L55 70 L45 70 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1"/>
  
  <!-- Front Leg -->
  <g class="legs" style="animation-delay: 0.5s">
    <path d="M55 80 L65 100 L75 100" fill="none" stroke="#374151" stroke-width="8" stroke-linecap="round"/>
    <path d="M55 80 L65 100 L75 100" fill="none" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/> <!-- Shoe detail -->
  </g>

  <!-- Arm (Reaching) -->
  <g class="arms">
    <path d="M35 55 L15 65" stroke="#5d3515" stroke-width="7" stroke-linecap="round"/> <!-- Sleeve -->
    <circle cx="15" cy="65" r="5" fill="url(#skin)"/> <!-- Hand -->
  </g>
`;

const ZOMBIE_HEAD_BASE = `
  <path d="M35 15 Q30 15 30 35 Q30 55 50 55 Q70 55 70 35 Q70 15 65 15" fill="url(#skin)" stroke="#365314" stroke-width="2"/>
  
  <!-- Big Bug Eyes -->
  <circle cx="42" cy="30" r="8" fill="white" stroke="#365314" stroke-width="1"/>
  <circle cx="42" cy="30" r="2" fill="black"/>
  
  <circle cx="60" cy="30" r="7" fill="white" stroke="#365314" stroke-width="1"/>
  <circle cx="60" cy="30" r="1.5" fill="black"/>
  
  <!-- Tooth -->
  <rect x="48" y="48" width="5" height="5" fill="#fefce8" stroke="#365314" stroke-width="1"/>
`;

export const SVG_ZOMBIE_NORMAL = SVG_START(`
${ZOMBIE_DEFS}
${ZOMBIE_BODY}
<g class="headGroup">
  ${ZOMBIE_HEAD_BASE}
  <path d="M45 15 L45 5 M50 15 L52 7 M55 15 L58 8" stroke="black" stroke-width="2"/>
</g>
`);

export const SVG_ZOMBIE_CONE = SVG_START(`
${ZOMBIE_DEFS}
${ZOMBIE_BODY}
<g class="headGroup">
  ${ZOMBIE_HEAD_BASE}
  <path d="M25 20 L75 20 L50 -15 Z" fill="url(#cone)" stroke="#9a3412" stroke-width="2"/>
  <ellipse cx="50" cy="20" rx="26" ry="5" fill="#c2410c"/>
</g>
`);

export const SVG_ZOMBIE_BUCKET = SVG_START(`
${ZOMBIE_DEFS}
${ZOMBIE_BODY}
<g class="headGroup">
  ${ZOMBIE_HEAD_BASE}
  <path d="M30 10 L70 10 L68 35 L32 35 Z" fill="url(#bucket)" stroke="#374151" stroke-width="2" transform="translate(0, -10)"/>
  <path d="M30 10 Q50 0 70 10" fill="none" stroke="#374151" stroke-width="2" transform="translate(0, -10)"/>
  <circle cx="40" cy="5" r="4" fill="#ef4444" opacity="0.8"/>
</g>
`);

// Giant Football Zombie
export const SVG_ZOMBIE_BOSS = SVG_START(`
${ZOMBIE_DEFS}
<!-- Shadow -->
<ellipse cx="50" cy="95" rx="35" ry="8" fill="rgba(0,0,0,0.4)" />

<!-- Bulkier Body -->
<path d="M25 40 L75 40 L80 90 L20 90 Z" fill="url(#football)" stroke="#7f1d1d" stroke-width="3"/>
<rect x="40" y="50" width="20" height="10" fill="white" font-weight="bold" />
<text x="50" y="59" font-size="8" text-anchor="middle" fill="red" font-weight="bold">BOSS</text>

<!-- Legs -->
<path d="M35 90 L30 100" stroke="#374151" stroke-width="10" stroke-linecap="round"/>
<path d="M65 90 L70 100" stroke="#374151" stroke-width="10" stroke-linecap="round"/>

<!-- Arms -->
<path d="M25 50 L10 70" stroke="#ef4444" stroke-width="10" stroke-linecap="round"/>
<circle cx="10" cy="70" r="8" fill="url(#skin)"/>

<!-- Head -->
<g class="headGroup" transform="scale(1.2) translate(-8, -10)">
  ${ZOMBIE_HEAD_BASE}
  <!-- Helmet -->
  <path d="M25 15 Q50 -10 75 15" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/>
  <path d="M25 15 L25 45 L35 45" fill="none" stroke="#ef4444" stroke-width="4"/>
  <rect x="30" y="20" width="40" height="2" fill="white"/>
  <rect x="35" y="20" width="2" height="20" fill="white"/>
  <rect x="49" y="20" width="2" height="20" fill="white"/>
  <rect x="63" y="20" width="2" height="20" fill="white"/>
</g>
`);
