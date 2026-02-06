
// PREMIUM STYLIZED ASSETS - Updated for better cross-browser compatibility
const SVG_START = (content: string) => `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

export const SVG_COIN = SVG_START(`
<circle cx="50" cy="50" r="42" fill="#854d0e" />
<circle cx="50" cy="50" r="38" fill="#eab308" />
<circle cx="50" cy="50" r="32" fill="#fbce44" />
<text x="50" y="68" font-family="Titan One, cursive" font-weight="bold" font-size="55" text-anchor="middle" fill="#713f12" style="filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.2))">$</text>
<path d="M30 30 Q50 15 70 30" fill="none" stroke="#fefce8" stroke-width="4" opacity="0.4" stroke-linecap="round" />
`);

export const SVG_LOCK = SVG_START(`
<path d="M30 45 L30 25 Q30 8 50 8 Q70 8 70 25 L70 45" fill="none" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
<rect x="15" y="40" width="70" height="52" rx="10" fill="#f59e0b" stroke="#92400e" stroke-width="4" />
<rect x="25" y="50" width="50" height="32" rx="5" fill="#fbbf24" opacity="0.3" />
<circle cx="50" cy="65" r="8" fill="#451a03" />
<path d="M50 65 L44 85 L56 85 Z" fill="#451a03" />
`);

export const SVG_PEASHOOTER = (level: number) => SVG_START(`
<ellipse cx="50" cy="92" rx="28" ry="6" fill="#000000" opacity="0.25" />
<path d="M50 90 Q20 75 10 90 Q30 105 50 90 Z" fill="#14532d" />
<path d="M50 90 Q80 75 90 90 Q70 105 50 90 Z" fill="#15803d" />
<path d="M50 95 Q50 75 35 95" fill="#166534" />
<path d="M50 90 C45 75 42 65 48 45" fill="none" stroke="#16a34a" stroke-width="8" stroke-linecap="round" />
<path d="M52 85 C48 75 45 65 50 45" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" opacity="0.6" />
<g transform="translate(5, -5)">
    <path d="M30 35 Q10 15 35 25" fill="#15803d" stroke="#052e16" stroke-width="1.5" />
    <circle cx="45" cy="40" r="24" fill="${level > 2 ? '#facc15' : '#22c55e'}" stroke="#052e16" stroke-width="3" />
    <circle cx="38" cy="32" r="8" fill="white" opacity="0.15" />
    <path d="M65 28 L85 18 Q90 18 90 25 L90 55 Q90 62 85 62 L65 52" fill="${level > 2 ? '#eab308' : '#16a34a'}" stroke="#052e16" stroke-width="3" />
    <ellipse cx="88" cy="40" rx="6" ry="24" fill="#052e16" />
    <ellipse cx="86" cy="40" rx="4" ry="18" fill="#000" />
    <circle cx="40" cy="38" r="7" fill="white" stroke="#052e16" stroke-width="1" />
    <circle cx="41" cy="38" r="4" fill="black" />
    <circle cx="42" cy="36" r="1.5" fill="white" />
    <circle cx="58" cy="38" r="7" fill="white" stroke="#052e16" stroke-width="1" />
    <circle cx="57" cy="38" r="4" fill="black" />
    <circle cx="56" cy="36" r="1.5" fill="white" />
    ${level > 1 ? `
        <path d="M28 28 Q45 5 62 28" fill="none" stroke="${level > 2 ? '#ef4444' : '#3b82f6'}" stroke-width="5" stroke-linecap="round" />
        <path d="M35 20 L45 10 L55 20" fill="none" stroke="white" stroke-width="2" opacity="0.5" />
    ` : ''}
</g>
`);

export const SVG_SUNFLOWER = (level: number) => SVG_START(`
<ellipse cx="50" cy="92" rx="25" ry="5" fill="#000" opacity="0.2" />
<path d="M50 90 Q55 70 50 50" fill="none" stroke="#166534" stroke-width="6" stroke-linecap="round" />
<g transform="translate(50, 50)">
    ${[0,45,90,135,180,225,270,315].map(deg => `
        <g transform="rotate(${deg})">
            <path d="M-12 -35 Q0 -55 12 -35 L5 -15 L-5 -15 Z" fill="${level > 1 ? '#fbbf24' : '#fde047'}" stroke="#92400e" stroke-width="2" />
            <path d="M-6 -38 Q0 -48 6 -38" fill="none" stroke="white" stroke-width="2" opacity="0.4" />
        </g>
    `).join('')}
</g>
<circle cx="50" cy="50" r="22" fill="#78350f" stroke="#451a03" stroke-width="3" />
<circle cx="50" cy="50" r="18" fill="#92400e" />
<circle cx="42" cy="45" r="3" fill="black" />
<circle cx="58" cy="45" r="3" fill="black" />
<path d="M44 58 Q50 64 56 58" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8" />
`);

export const SVG_WALLNUT = (level: number) => SVG_START(`
<ellipse cx="50" cy="94" rx="30" ry="6" fill="#000" opacity="0.25" />
<path d="M20 45 C20 15 50 5 80 15 C85 45 85 85 50 92 C15 85 15 45 20 45 Z" fill="#92400e" stroke="#451a03" stroke-width="4" />
<path d="M30 30 Q50 20 70 30" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.2" />
<g transform="translate(0, 5)">
    <ellipse cx="38" cy="40" r="10" fill="white" stroke="#451a03" stroke-width="1" />
    <circle cx="41" cy="42" r="3" fill="black" />
    <ellipse cx="62" cy="40" r="10" fill="white" stroke="#451a03" stroke-width="1" />
    <circle cx="59" cy="42" r="3" fill="black" />
    <path d="M45 70 Q50 75 55 70" fill="none" stroke="#451a03" stroke-width="3" stroke-linecap="round" />
</g>
${level > 1 ? `<path d="M20 50 L80 50" stroke="white" stroke-width="10" opacity="0.1" stroke-dasharray="5,15" />` : ''}
`);

export const SVG_CHERRYBOMB = (level: number) => SVG_START(`
<ellipse cx="50" cy="92" rx="35" ry="8" fill="#000" opacity="0.3" />
<path d="M50 50 C55 30 65 15 85 8" fill="none" stroke="#064e3b" stroke-width="6" stroke-linecap="round" />
<path d="M50 50 C45 35 35 20 25 15" fill="none" stroke="#064e3b" stroke-width="6" stroke-linecap="round" />
<g transform="translate(32, 65)">
    <circle r="26" fill="#b91c1c" stroke="#450a0a" stroke-width="4" />
    <circle r="20" fill="#dc2626" />
    <path d="M-10 -5 L10 -5" stroke="black" stroke-width="4" stroke-linecap="round" />
    <circle cx="-8" cy="5" r="3" fill="black" />
    <circle cx="8" cy="5" r="3" fill="black" />
</g>
<g transform="translate(68, 70)">
    <circle r="28" fill="#991b1b" stroke="#450a0a" stroke-width="4" />
    <circle r="22" fill="#b91c1c" />
    <path d="M-12 -5 L12 -5" stroke="black" stroke-width="4" stroke-linecap="round" />
    <circle cx="-10" cy="5" r="3" fill="black" />
    <circle cx="10" cy="5" r="3" fill="black" />
</g>
<circle cx="85" cy="8" r="6" fill="#facc15" />
<circle cx="85" cy="8" r="3" fill="white" />
`);

export const SVG_ICESHROOM = (level: number) => SVG_START(`
<ellipse cx="50" cy="94" rx="28" ry="6" fill="#000" opacity="0.25" />
<path d="M30 45 C30 25 70 25 70 45 C70 85 30 85 30 45" fill="#93c5fd" stroke="#1d4ed8" stroke-width="3" />
<path d="M35 50 Q50 40 65 50" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.4" />
<g transform="translate(0, -10)">
    <path d="M15 45 Q50 15 85 45" fill="#60a5fa" stroke="#1d4ed8" stroke-width="3" />
    <path d="M15 45 L25 25 L35 45" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" />
    <path d="M35 45 L45 15 L55 45" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" />
    <path d="M55 45 L65 20 L75 45" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" />
    <path d="M25 40 L30 10 L40 40" fill="#93c5fd" opacity="0.6" />
    <path d="M50 35 L55 5 L65 35" fill="#93c5fd" opacity="0.6" />
    <path d="M70 40 L80 15 L85 40" fill="#93c5fd" opacity="0.6" />
</g>
<g transform="translate(0, 5)">
    <path d="M42 45 L48 48" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" />
    <path d="M58 45 L52 48" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" />
    <circle cx="43" cy="52" r="3" fill="white" stroke="#1e3a8a" stroke-width="1" />
    <circle cx="43" cy="52" r="1.5" fill="black" />
    <circle cx="57" cy="52" r="3" fill="white" stroke="#1e3a8a" stroke-width="1" />
    <circle cx="57" cy="52" r="1.5" fill="black" />
    <path d="M44 65 Q50 60 56 65" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" />
</g>
<g>
    <path d="M25 85 L28 88 M75 85 L72 88" stroke="#bfdbfe" stroke-width="3" stroke-linecap="round" />
</g>
`);

export const SVG_JALAPENO = (level: number) => SVG_START(`
<ellipse cx="50" cy="94" rx="20" ry="5" fill="#000" opacity="0.3" />
<path d="M50 25 C55 15 65 10 75 5" fill="none" stroke="#166534" stroke-width="5" stroke-linecap="round" />
<path d="M50 25 C45 18 35 15 25 20" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round" />
<path d="M50 20 C65 25 70 50 65 80 C60 95 40 95 35 80 C30 50 35 25 50 20 Z" fill="#dc2626" stroke="#450a0a" stroke-width="3" />
<path d="M45 30 Q55 35 55 50 Q55 70 50 85" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.2" />
<g transform="translate(0, -5)">
    <path d="M40 45 L50 50 L60 45" fill="none" stroke="#450a0a" stroke-width="3" stroke-linecap="round" />
    <circle cx="42" cy="55" r="5" fill="white" stroke="#450a0a" stroke-width="1.5" />
    <circle cx="44" cy="57" r="2.5" fill="black" />
    <circle cx="58" cy="55" r="5" fill="white" stroke="#450a0a" stroke-width="1.5" />
    <circle cx="56" cy="57" r="2.5" fill="black" />
    <path d="M45 75 Q50 70 55 75" fill="none" stroke="#450a0a" stroke-width="3" stroke-linecap="round" />
</g>
<g>
    <circle cx="30" cy="40" r="2" fill="#f59e0b" opacity="0.6" />
    <circle cx="70" cy="60" r="3" fill="#ef4444" opacity="0.4" />
    ${level > 1 ? `<circle cx="50" cy="15" r="4" fill="#fbbf24" opacity="0.5" />` : ''}
</g>
`);

const ZOMBIE_BODY = `
  <ellipse cx="50" cy="96" rx="25" ry="5" fill="#000" opacity="0.3" />
  <path d="M42 75 L35 98" stroke="#1e293b" stroke-width="9" stroke-linecap="round" />
  <path d="M58 75 L65 98" stroke="#0f172a" stroke-width="9" stroke-linecap="round" />
  <path d="M30 45 L70 45 L75 80 Q50 85 25 80 Z" fill="#422006" stroke="#271300" stroke-width="3" />
  <path d="M45 45 L55 45 L52 70 L48 70 Z" fill="#991b1b" />
  <path d="M30 50 L20 75" stroke="#5d3515" stroke-width="8" stroke-linecap="round" />
  <path d="M20 75 Q15 75 12 80" stroke="#a3e635" stroke-width="6" stroke-linecap="round" />
`;

const ZOMBIE_HEAD = `
  <path d="M32 15 Q25 15 25 40 Q25 60 50 60 Q75 60 75 40 Q75 15 68 15 Z" fill="#a3e635" stroke="#1a2e05" stroke-width="3" />
  <path d="M35 25 Q50 15 65 25" fill="none" stroke="white" stroke-width="10" opacity="0.2" />
  <circle cx="40" cy="35" r="9" fill="white" stroke="#1a2e05" stroke-width="1.5" />
  <circle cx="41" cy="36" r="3" fill="black" />
  <circle cx="62" cy="35" r="7" fill="white" stroke="#1a2e05" stroke-width="1.5" />
  <circle cx="61" cy="34" r="2" fill="black" />
  <rect x="45" y="52" width="8" height="6" fill="#fefce8" stroke="#1a2e05" stroke-width="1" />
`;

export const SVG_ZOMBIE_NORMAL = SVG_START(`
${ZOMBIE_BODY}
<g transform="translate(0, -5)">
    ${ZOMBIE_HEAD}
    <path d="M45 15 Q45 5 40 2" fill="none" stroke="black" stroke-width="2" />
    <path d="M55 15 Q58 5 62 8" fill="none" stroke="black" stroke-width="2" />
</g>
`);

export const SVG_ZOMBIE_CONE = SVG_START(`
${ZOMBIE_BODY}
<g transform="translate(0, -5)">
    ${ZOMBIE_HEAD}
    <path d="M22 25 L78 25 L50 -25 Z" fill="#ea580c" stroke="#7c2d12" stroke-width="4" />
    <path d="M30 18 L70 18" stroke="white" stroke-width="6" opacity="0.3" stroke-linecap="round" />
    <ellipse cx="50" cy="25" rx="30" ry="6" fill="#c2410c" stroke="#7c2d12" stroke-width="2" />
</g>
`);

export const SVG_ZOMBIE_BUCKET = SVG_START(`
${ZOMBIE_BODY}
<g transform="translate(0, -5)">
    ${ZOMBIE_HEAD}
    <path d="M28 5 L72 5 L70 35 Q50 40 30 35 Z" fill="#94a3b8" stroke="#334155" stroke-width="4" />
    <path d="M35 12 L65 12" stroke="white" stroke-width="8" opacity="0.3" stroke-linecap="round" />
    <path d="M28 20 L20 20 L20 5 L28 5" fill="none" stroke="#475569" stroke-width="3" />
</g>
`);

export const SVG_ZOMBIE_BOSS = SVG_START(`
<ellipse cx="50" cy="96" rx="40" ry="10" fill="#000" opacity="0.3" />
<rect x="25" y="80" width="12" height="18" fill="#334155" stroke="#0f172a" stroke-width="3" />
<rect x="63" y="80" width="12" height="18" fill="#334155" stroke="#0f172a" stroke-width="3" />
<path d="M15 35 L85 35 L90 85 L10 85 Z" fill="#475569" stroke="#0f172a" stroke-width="5" />
<rect x="35" y="45" width="30" height="25" fill="#1e293b" rx="5" />
<circle cx="50" cy="57" r="8" fill="#dc2626" />
<path d="M15 45 L-5 65" stroke="#334155" stroke-width="12" stroke-linecap="round" />
<circle cx="-5" cy="65" r="10" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
<path d="M85 45 L105 65" stroke="#334155" stroke-width="12" stroke-linecap="round" />
<circle cx="105" cy="65" r="10" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
<path d="M25 35 Q25 -10 50 -10 Q75 -10 75 35" fill="#bae6fd" stroke="#0ea5e9" stroke-width="3" opacity="0.6" />
<g transform="translate(42, 5) scale(0.5)">
    <path d="M10 20 Q10 0 25 0 Q40 0 40 20 L40 45 L10 45 Z" fill="#a3e635" stroke="#1a2e05" stroke-width="3" />
    <circle cx="20" cy="15" r="4" fill="white" stroke="black" stroke-width="1" />
    <circle cx="30" cy="15" r="4" fill="white" stroke="black" stroke-width="1" />
</g>
`);
