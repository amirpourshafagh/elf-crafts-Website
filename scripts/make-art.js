const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(dir, { recursive: true });

function write(name, svg) {
  fs.writeFileSync(path.join(dir, name), svg.trim() + '\n', 'utf8');
}

write('mark.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3e6c2"/>
      <stop offset="0.5" stop-color="#d4b36a"/>
      <stop offset="1" stop-color="#8d6b32"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="18" fill="#1e3d32"/>
  <path d="M32 8c6 12 16 18 16 31 0 11-7 17-16 17S16 50 16 39C16 26 26 20 32 8z" fill="url(#g)"/>
  <path d="M32 16c0 12 0 22 0 34" stroke="#1e3d32" stroke-width="1.4" fill="none"/>
  <path d="M32 28c6 2 10 8 8 14" stroke="#1e3d32" stroke-width="1.1" fill="none" opacity=".7"/>
</svg>`);

write('hero.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#102820"/>
      <stop offset="0.42" stop-color="#1c4a3a"/>
      <stop offset="1" stop-color="#07140f"/>
    </linearGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d7e6d4" stop-opacity="0"/>
      <stop offset="1" stop-color="#d7e6d4" stop-opacity=".22"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#f6efd8" stop-opacity=".95"/>
      <stop offset="1" stop-color="#f6efd8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1400" height="900" fill="url(#sky)"/>
  <circle cx="1040" cy="190" r="220" fill="url(#glow)" opacity=".55"/>
  <circle cx="1040" cy="190" r="62" fill="#f6efd8"/>
  <circle cx="1064" cy="176" r="52" fill="#1c4a3a"/>
  <g fill="#f6efd8">
    <circle cx="180" cy="120" r="1.4" opacity=".7"/>
    <circle cx="260" cy="80" r="1.2" opacity=".5"/>
    <circle cx="420" cy="140" r="1.3" opacity=".6"/>
    <circle cx="640" cy="90" r="1.5" opacity=".55"/>
    <circle cx="760" cy="160" r="1.1" opacity=".45"/>
    <circle cx="880" cy="70" r="1.3" opacity=".5"/>
    <circle cx="1200" cy="120" r="1.2" opacity=".6"/>
    <circle cx="1320" cy="200" r="1.4" opacity=".4"/>
  </g>
  <g fill="#d4b36a">
    <circle cx="300" cy="460" r="2.2" opacity=".85"/>
    <circle cx="520" cy="520" r="1.8" opacity=".7"/>
    <circle cx="690" cy="430" r="2" opacity=".8"/>
    <circle cx="860" cy="560" r="1.6" opacity=".65"/>
    <circle cx="210" cy="580" r="1.7" opacity=".55"/>
  </g>
  <path d="M0 620 C220 560 380 700 560 640 C760 570 900 700 1120 630 C1260 590 1340 640 1400 620 L1400 900 L0 900 Z" fill="#0c221a"/>
  <path d="M0 700 C240 660 420 760 680 710 C940 660 1160 760 1400 700 L1400 900 L0 900 Z" fill="#081710"/>
  <g fill="#163528">
    <path d="M-20 780 L90 360 L210 780 Z"/>
    <path d="M80 800 L210 300 L360 800 Z"/>
    <path d="M250 820 L390 250 L560 820 Z"/>
    <path d="M470 820 L620 210 L790 820 Z"/>
    <path d="M700 830 L860 280 L1040 830 Z"/>
    <path d="M960 820 L1120 340 L1280 820 Z"/>
    <path d="M1160 830 L1280 420 L1420 830 Z"/>
  </g>
  <g fill="#10281f">
    <path d="M40 820 L150 430 L270 820 Z"/>
    <path d="M300 830 L430 340 L590 830 Z"/>
    <path d="M620 840 L760 300 L930 840 Z"/>
    <path d="M980 840 L1110 390 L1260 840 Z"/>
  </g>
  <path d="M180 430 C230 390 250 470 300 500" fill="none" stroke="#2f6a4e" stroke-width="8" stroke-linecap="round"/>
  <path d="M1080 470 C1140 420 1180 500 1240 500" fill="none" stroke="#2f6a4e" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="700" cy="760" rx="520" ry="70" fill="url(#mist)"/>
  <g transform="translate(180 640)">
    <path d="M40 70 C70 20 120 20 150 70" fill="none" stroke="#e7d3a1" stroke-width="4" stroke-linecap="round"/>
    <path d="M95 68 C120 78 128 110 95 140 C62 110 70 78 95 68 Z" fill="#d4b36a"/>
    <path d="M95 84 V128" stroke="#6d5224" stroke-width="1.4"/>
  </g>
</svg>`);

function piece(inner) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="68%">
      <stop offset="0" stop-color="#fbf7ef"/>
      <stop offset="62%" stop-color="#e4f0e3"/>
      <stop offset="100%" stop-color="#c5d9c8"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6edd2"/>
      <stop offset="42%" stop-color="#e0c27a"/>
      <stop offset="100%" stop-color="#8d6a30"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9cbc9f"/>
      <stop offset="100%" stop-color="#2c5b43"/>
    </linearGradient>
    <radialGradient id="pearl" cx="35%" cy="30%" r="70%">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="45%" stop-color="#f4efe4"/>
      <stop offset="100%" stop-color="#c9bfae"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="400" cy="390" r="292" fill="none" stroke="#c6a15e" stroke-opacity=".45" stroke-width="2"/>
  <circle cx="400" cy="390" r="270" fill="none" stroke="#1e3d32" stroke-opacity=".06" stroke-width="26"/>
  <ellipse cx="400" cy="640" rx="150" ry="18" fill="#1e3d32" opacity=".1"/>
  ${inner}
</svg>`;
}

write('p_moonleaf.svg', piece(`
  <path d="M230 250 C300 150 500 150 570 250" fill="none" stroke="url(#gold)" stroke-width="16" stroke-linecap="round"/>
  <circle cx="400" cy="214" r="10" fill="#f6edd2"/>
  <path d="M400 268 C490 300 520 430 400 560 C280 430 310 300 400 268 Z" fill="url(#leaf)" stroke="url(#gold)" stroke-width="8"/>
  <path d="M400 310 C400 390 400 470 400 520" fill="none" stroke="#f6edd2" stroke-width="3"/>
  <path d="M400 360 C450 380 470 430 430 470" fill="none" stroke="#f6edd2" stroke-width="2" opacity=".8"/>
  <circle cx="400" cy="250" r="28" fill="none" stroke="#f6edd2" stroke-width="5"/>
`));

write('p_dew.svg', piece(`
  <path d="M300 210 C300 180 330 160 330 190" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
  <path d="M470 210 C470 180 500 160 500 190" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
  <path d="M315 200 V280" stroke="url(#gold)" stroke-width="6"/>
  <path d="M485 200 V300" stroke="url(#gold)" stroke-width="6"/>
  <circle cx="315" cy="340" r="46" fill="url(#pearl)" stroke="url(#gold)" stroke-width="6"/>
  <circle cx="485" cy="370" r="58" fill="url(#pearl)" stroke="url(#gold)" stroke-width="6"/>
  <path d="M250 470 C330 430 390 500 470 460 C540 430 590 480 640 450" fill="none" stroke="#2c5b43" stroke-width="3" opacity=".45"/>
`));

write('p_vine.svg', piece(`
  <ellipse cx="400" cy="400" rx="150" ry="170" fill="none" stroke="url(#gold)" stroke-width="18"/>
  <path d="M250 360 C320 250 430 250 470 340 C520 450 560 470 620 400" fill="none" stroke="#2c5b43" stroke-width="10" stroke-linecap="round"/>
  <path d="M360 300 C390 270 420 280 430 310 C400 300 380 320 360 300 Z" fill="url(#leaf)"/>
  <path d="M500 360 C540 340 560 360 555 395 C520 380 505 390 500 360 Z" fill="url(#leaf)"/>
  <circle cx="400" cy="400" r="16" fill="#f6edd2" stroke="#8d6a30" stroke-width="3"/>
`));

write('p_crown.svg', piece(`
  <path d="M180 430 C260 300 540 300 620 430" fill="none" stroke="url(#gold)" stroke-width="16" stroke-linecap="round"/>
  <path d="M210 400 L250 250 L300 390 Z" fill="url(#leaf)" stroke="url(#gold)" stroke-width="4"/>
  <path d="M330 360 L400 180 L470 360 Z" fill="url(#leaf)" stroke="url(#gold)" stroke-width="4"/>
  <path d="M500 390 L560 260 L600 400 Z" fill="url(#leaf)" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="250" cy="268" r="8" fill="#f6edd2"/>
  <circle cx="400" cy="200" r="10" fill="#f6edd2"/>
  <circle cx="555" cy="278" r="8" fill="#f6edd2"/>
  <path d="M230 455 H570" stroke="url(#gold)" stroke-width="8" stroke-linecap="round"/>
`));

write('p_bud.svg', piece(`
  <circle cx="400" cy="430" r="120" fill="none" stroke="url(#gold)" stroke-width="22"/>
  <circle cx="400" cy="430" r="78" fill="none" stroke="#f6edd2" stroke-width="6" opacity=".8"/>
  <path d="M400 250 C450 290 455 340 400 360 C345 340 350 290 400 250 Z" fill="url(#leaf)" stroke="url(#gold)" stroke-width="5"/>
  <circle cx="400" cy="300" r="12" fill="#f6edd2"/>
  <path d="M400 360 V300" stroke="#f6edd2" stroke-width="2"/>
`));

write('p_dragon.svg', piece(`
  <ellipse cx="310" cy="360" rx="130" ry="48" fill="#7eaa86" fill-opacity=".55" transform="rotate(-24 310 360)" stroke="#2c5b43" stroke-width="3"/>
  <ellipse cx="490" cy="360" rx="130" ry="48" fill="#7eaa86" fill-opacity=".55" transform="rotate(24 490 360)" stroke="#2c5b43" stroke-width="3"/>
  <ellipse cx="330" cy="450" rx="100" ry="36" fill="#dfece0" fill-opacity=".8" transform="rotate(-18 330 450)" stroke="url(#gold)" stroke-width="3"/>
  <ellipse cx="470" cy="450" rx="100" ry="36" fill="#dfece0" fill-opacity=".8" transform="rotate(18 470 450)" stroke="url(#gold)" stroke-width="3"/>
  <path d="M400 300 C420 360 420 460 400 540" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round"/>
  <circle cx="400" cy="290" r="18" fill="url(#gold)"/>
  <path d="M386 284 H414" stroke="#1e3d32" stroke-width="2"/>
`));

write('p_river.svg', piece(`
  <path d="M210 300 C300 210 500 210 590 300" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round"/>
  <circle cx="250" cy="340" r="22" fill="url(#pearl)" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="310" cy="400" r="26" fill="url(#pearl)" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="365" cy="455" r="30" fill="url(#pearl)" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="435" cy="455" r="30" fill="url(#pearl)" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="490" cy="400" r="26" fill="url(#pearl)" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="550" cy="340" r="22" fill="url(#pearl)" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="400" cy="250" r="9" fill="#f6edd2"/>
`));

write('p_moss.svg', piece(`
  <path d="M160 470 C280 360 520 360 640 470" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round"/>
  <path d="M250 430 C275 390 310 395 320 430 C290 425 270 445 250 430 Z" fill="url(#leaf)"/>
  <path d="M360 400 C390 355 430 360 440 405 C405 395 385 420 360 400 Z" fill="url(#leaf)"/>
  <path d="M480 430 C510 390 545 398 548 438 C515 428 498 450 480 430 Z" fill="url(#leaf)"/>
  <circle cx="300" cy="455" r="7" fill="#f6edd2"/>
  <circle cx="400" cy="445" r="7" fill="#f6edd2"/>
  <circle cx="500" cy="455" r="7" fill="#f6edd2"/>
`));

write('p_crescent.svg', piece(`
  <path d="M300 200 C300 170 328 155 328 188" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
  <path d="M500 200 C500 170 528 155 528 188" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
  <path d="M250 280 A80 80 0 1 0 250 470 A58 58 0 1 1 250 280 Z" fill="url(#gold)"/>
  <path d="M470 280 A80 80 0 1 0 470 470 A58 58 0 1 1 470 280 Z" fill="url(#gold)"/>
  <path d="M300 470 C325 500 345 510 360 530 C340 515 325 530 300 500 Z" fill="url(#leaf)"/>
  <path d="M520 470 C545 500 565 510 580 530 C560 515 545 530 520 500 Z" fill="url(#leaf)"/>
`));

write('p_acorn.svg', piece(`
  <path d="M190 390 C300 300 500 300 610 390" fill="none" stroke="#6b4a2e" stroke-width="14" stroke-linecap="round"/>
  <circle cx="250" cy="430" r="28" fill="#a56b3c" stroke="#6b4a2e" stroke-width="4"/>
  <circle cx="330" cy="470" r="28" fill="#c48a55" stroke="#6b4a2e" stroke-width="4"/>
  <circle cx="410" cy="490" r="28" fill="#8d5a32" stroke="#6b4a2e" stroke-width="4"/>
  <circle cx="490" cy="470" r="28" fill="#c48a55" stroke="#6b4a2e" stroke-width="4"/>
  <circle cx="560" cy="420" r="28" fill="#a56b3c" stroke="#6b4a2e" stroke-width="4"/>
  <path d="M390 300 h40 v28 h-40 z" fill="#6b4a2e"/>
  <path d="M385 328 h50 c0 40 -10 70 -25 78 c-15 -8 -25 -38 -25 -78 z" fill="url(#gold)"/>
  <path d="M410 250 v50" stroke="#2c5b43" stroke-width="4"/>
`));

write('about.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7f3ea"/>
      <stop offset="1" stop-color="#d5e6d6"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6edd2"/>
      <stop offset="50%" stop-color="#d4b36a"/>
      <stop offset="100%" stop-color="#8d6a30"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#paper)"/>
  <circle cx="860" cy="250" r="90" fill="#f6efd8"/>
  <circle cx="888" cy="232" r="74" fill="#d5e6d6"/>
  <path d="M120 620 C280 520 480 700 680 580 C860 480 1000 620 1160 540 L1200 800 L0 800 Z" fill="#1e3d32" opacity=".9"/>
  <path d="M180 610 C260 470 340 500 390 610 Z" fill="#163528"/>
  <path d="M300 630 C400 420 500 470 560 640 Z" fill="#10281f"/>
  <rect x="150" y="300" width="360" height="230" rx="28" fill="#fbf7ef" stroke="#c6a15e" stroke-width="3"/>
  <path d="M210 360 C250 330 300 345 320 390 C300 370 260 380 250 410 C230 390 215 380 210 360 Z" fill="#3f6b52"/>
  <circle cx="400" cy="430" r="36" fill="#f4efe4" stroke="url(#gold)" stroke-width="6"/>
  <path d="M620 470 C760 360 900 390 980 520" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round"/>
  <path d="M800 430 C850 390 890 410 900 470 C860 450 830 470 800 430 Z" fill="#2c5b43"/>
  <rect x="640" y="500" width="280" height="16" rx="8" fill="#e7dcc4"/>
  <rect x="640" y="528" width="210" height="16" rx="8" fill="#e7dcc4" opacity=".7"/>
</svg>`);

console.log('Artwork written to', dir);
