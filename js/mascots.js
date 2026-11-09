/* =====================================================================
   MASCOT — nhân vật riêng của Học Toán Vui
   • Su  : khủng long xanh, thầy dạy toán, dẫn đường mọi bài học
   • Bi  : chú ong vàng chăm chỉ, giữ sổ nhiệm vụ
   • Xu  : heo đất hồng, giữ hũ sao và tiền thưởng
   mood: happy | cheer | oops | think
   ===================================================================== */
function eyesFor(mood, lx, rx, y, r = 11) {
  const ink = '#2A2340';
  if (mood === 'cheer') return `<path d="M${lx - 9} ${y + 2}q9-11 18 0M${rx - 9} ${y + 2}q9-11 18 0" stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  const dy = mood === 'oops' ? 3 : mood === 'think' ? -4 : 0, dx = mood === 'think' ? 3 : 1;
  const pr = mood === 'oops' ? r * .42 : r * .55;
  return `<circle cx="${lx}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${rx}" cy="${y}" r="${r}" fill="#fff"/>
  <circle cx="${lx + dx}" cy="${y + dy}" r="${pr}" fill="${ink}"/><circle cx="${rx + dx}" cy="${y + dy}" r="${pr}" fill="${ink}"/>
  <circle cx="${lx + dx + 2.5}" cy="${y + dy - 2.5}" r="${pr * .35}" fill="#fff"/><circle cx="${rx + dx + 2.5}" cy="${y + dy - 2.5}" r="${pr * .35}" fill="#fff"/>`;
}
function mouthFor(mood, cx, y, w = 14) {
  if (mood === 'oops') return `<ellipse cx="${cx}" cy="${y + 3}" rx="${w * .3}" ry="${w * .24}" fill="#2A2340"/>`;
  if (mood === 'think') return `<path d="M${cx - w * .4} ${y + 3}h${w * .8}" stroke="#2A2340" stroke-width="3.5" stroke-linecap="round"/>`;
  if (mood === 'cheer') return `<path d="M${cx - w * .6} ${y}q${w * .6} ${w * .9} ${w * 1.2} 0z" fill="#2A2340"/><path d="M${cx - w * .3} ${y + w * .35}q${w * .3} ${w * .25} ${w * .6} 0" fill="#FF7A8A"/>`;
  return `<path d="M${cx - w * .5} ${y}q${w * .5} ${w * .55} ${w} 0" stroke="#2A2340" stroke-width="3.8" fill="none" stroke-linecap="round"/>`;
}
const sweat = (x, y) => `<path d="M${x} ${y}c3 6 4 9 0 12c-4-3-3-6 0-12z" fill="#7CC6F2"/>`;

/* Su — khủng long */
function su(mood = 'happy', size = 96, cls = '') {
  const armUp = mood === 'cheer';
  return `<svg class="mascot ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <path d="M96 84q20 4 20-12q-6 8-20 2z" fill="#3FB37F"/>
  <g fill="#FFC94D"><path d="M44 18l7-12 6 13z"/><path d="M58 15l8-12 6 14z"/><path d="M73 19l9-10 3 15z"/><path d="M86 30l11-6-1 14z"/></g>
  <ellipse cx="62" cy="68" rx="40" ry="44" fill="#4CC38A"/>
  <ellipse cx="62" cy="84" rx="25" ry="24" fill="#DDF7E6"/>
  <path d="M48 76h28M46 86h32M50 96h24" stroke="#BDEACF" stroke-width="3" stroke-linecap="round"/>
  ${armUp ? '<ellipse cx="22" cy="54" rx="7" ry="13" fill="#3FB37F" transform="rotate(-30 22 54)"/><ellipse cx="102" cy="54" rx="7" ry="13" fill="#3FB37F" transform="rotate(30 102 54)"/>'
          : '<ellipse cx="26" cy="80" rx="7" ry="12" fill="#3FB37F" transform="rotate(20 26 80)"/><ellipse cx="98" cy="80" rx="7" ry="12" fill="#3FB37F" transform="rotate(-20 98 80)"/>'}
  <ellipse cx="44" cy="110" rx="12" ry="6" fill="#3FB37F"/><ellipse cx="80" cy="110" rx="12" ry="6" fill="#3FB37F"/>
  ${eyesFor(mood, 48, 76, 46, 11)}
  <circle cx="38" cy="60" r="5" fill="#FF9AA8" opacity=".7"/><circle cx="86" cy="60" r="5" fill="#FF9AA8" opacity=".7"/>
  ${mouthFor(mood, 62, 58, 14)}
  ${mood === 'oops' ? sweat(96, 30) : ''}${mood === 'think' ? '<circle cx="104" cy="22" r="4" fill="#C9C3E6"/><circle cx="112" cy="12" r="2.5" fill="#C9C3E6"/>' : ''}
  </svg>`;
}
/* Bi — chú ong */
function bi(mood = 'happy', size = 72, cls = '') {
  return `<svg class="mascot ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse cx="34" cy="34" rx="20" ry="14" fill="#D6EEFF" stroke="#A8D4F5" stroke-width="2" transform="rotate(-25 34 34)"/>
  <ellipse cx="86" cy="34" rx="20" ry="14" fill="#D6EEFF" stroke="#A8D4F5" stroke-width="2" transform="rotate(25 86 34)"/>
  <path d="M50 26q-6-14-14-16M70 26q6-14 14-16" stroke="#2A2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="36" cy="10" r="4.5" fill="#2A2340"/><circle cx="84" cy="10" r="4.5" fill="#2A2340"/>
  <ellipse cx="60" cy="70" rx="40" ry="40" fill="#FFD23F"/>
  <path d="M24 86q36 14 72 0v8q-36 16-72 0z" fill="#2A2340" opacity=".85"/>
  <path d="M21 72q39 10 78 0" stroke="#2A2340" stroke-width="7" opacity=".85" fill="none"/>
  <path d="M60 110l-5 8h10z" fill="#2A2340"/>
  ${eyesFor(mood, 46, 74, 54, 10)}
  <circle cx="36" cy="64" r="4.5" fill="#FF9AA8" opacity=".75"/><circle cx="84" cy="64" r="4.5" fill="#FF9AA8" opacity=".75"/>
  ${mouthFor(mood, 60, 63, 12)}${mood === 'oops' ? sweat(94, 40) : ''}
  </svg>`;
}
/* Xu — heo đất */
function xu(mood = 'happy', size = 72, cls = '') {
  return `<svg class="mascot ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <path d="M30 34l-6-20 22 10z" fill="#F58CA8"/><path d="M90 34l6-20-22 10z" fill="#F58CA8"/>
  <ellipse cx="60" cy="66" rx="46" ry="42" fill="#FFB3C6"/>
  <rect x="48" y="24" width="24" height="6" rx="3" fill="#C8577A"/>
  <ellipse cx="34" cy="106" rx="9" ry="7" fill="#F58CA8"/><ellipse cx="86" cy="106" rx="9" ry="7" fill="#F58CA8"/>
  <path d="M104 64q12-4 8 8q-4 6-8 0" stroke="#F58CA8" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${eyesFor(mood, 44, 76, 52, 10)}
  <ellipse cx="60" cy="72" rx="16" ry="11" fill="#F58CA8"/><ellipse cx="54" cy="72" rx="3" ry="4.5" fill="#C8577A"/><ellipse cx="66" cy="72" rx="3" ry="4.5" fill="#C8577A"/>
  ${mood === 'cheer' ? '<path d="M50 88q10 8 20 0" stroke="#2A2340" stroke-width="3.5" fill="none" stroke-linecap="round"/>' : mood === 'oops' ? '<ellipse cx="60" cy="90" rx="4" ry="3" fill="#2A2340"/>' : '<path d="M52 88q8 5 16 0" stroke="#2A2340" stroke-width="3.5" fill="none" stroke-linecap="round"/>'}
  <path d="M90 92l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#FFD23F" stroke="#E0A800" stroke-width="1.5"/>
  ${mood === 'oops' ? sweat(100, 34) : ''}
  </svg>`;
}
const AVATARS = ['🦊', '🐼', '🐰', '🐯', '🐨', '🦁', '🐸', '🐧', '🦄', '🐙', '🐳', '🦖'];
