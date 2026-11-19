/* =====================================================================
   THÚ CƯNG — con chọn nuôi 1 bạn; mỗi bài học xong bạn ấy được ăn.
   Thú cưng lớn lên theo lộ trình học: số bài + thử thách con đã hoàn thành.
   6 giai đoạn: Quả trứng → Em bé → Nhóc con → Thiếu niên → Trưởng thành → Huyền thoại
   ===================================================================== */
const PET_KINDS = {
  rong: { name: 'Rồng Lửa', desc: 'Lớn lên sẽ có sừng, cánh và vương miện', c1: '#FF8A5B', c2: '#FFE3CC', c3: '#E2602F', acc: '#FFC94D' },
  meo: { name: 'Mèo Mây', desc: 'Lớn lên sẽ bay trên đám mây bông', c1: '#B9A7FF', c2: '#F2EDFF', c3: '#8E78E8', acc: '#FF9EC4' },
  cun: { name: 'Cún Sao', desc: 'Lớn lên sẽ đeo vòng sao và áo choàng', c1: '#7CC4F2', c2: '#E4F4FF', c3: '#3F8FC9', acc: '#FFD23F' }
};
const PET_STAGES = [
  { min: 0, name: 'Quả trứng', scale: .62 },
  { min: 1, name: 'Em bé', scale: .62 },
  { min: 8, name: 'Nhóc con', scale: .72 },
  { min: 25, name: 'Thiếu niên', scale: .83 },
  { min: 55, name: 'Trưởng thành', scale: .93 },
  { min: 95, name: 'Huyền thoại', scale: 1 }
];
const PET_FOOD = ['🍎', '🍓', '🥕', '🍪', '🍙', '🍌', '🥛', '🧁', '🍉', '🌽'];
const petStageOf = n => { let s = 0; PET_STAGES.forEach((st, i) => { if (n >= st.min) s = i; }); return s; };

/* fit = true: vẽ vừa khung (dùng cho biểu tượng nhỏ); mặc định thú cưng to dần theo giai đoạn */
function petSvg(kind, stage, mood = 'happy', size = 120, cls = '', fit = false) {
  const K = PET_KINDS[kind] || PET_KINDS.rong, sc = fit ? 1 : PET_STAGES[stage].scale;
  const wrap = inner => `<svg class="pet ${cls}" width="${size}" height="${size}" viewBox="0 0 160 160" aria-hidden="true"><g transform="translate(80 152) scale(${sc}) translate(-80 -152)">${inner}</g></svg>`;
  if (stage === 0) {
    const spots = kind === 'meo' ? '<circle cx="66" cy="92" r="7"/><circle cx="94" cy="118" r="9"/><circle cx="92" cy="80" r="5"/>'
      : kind === 'cun' ? '<path d="M70 86l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z"/><circle cx="96" cy="114" r="7"/>'
        : '<path d="M60 100l8-8 8 8 8-8 8 8 8-8"  stroke-width="4" stroke="' + K.c1 + '" fill="none"/><circle cx="80" cy="124" r="7"/>';
    const eyes = mood === 'cheer' ? '<path d="M66 70q5-6 10 0M84 70q5-6 10 0" stroke="#2A2340" stroke-width="3" fill="none" stroke-linecap="round"/>' : '';
    return wrap(`<ellipse cx="80" cy="148" rx="34" ry="6" fill="#0000001a"/><path d="M80 52c26 0 40 40 40 62s-18 36-40 36-40-14-40-36 14-62 40-62z" fill="#FFF7E6" stroke="#E9D8B8" stroke-width="3"/>
      <g fill="${K.c1}">${spots}</g><path d="M62 62l6 8 6-6 6 8" stroke="#D9C39A" stroke-width="2.5" fill="none" stroke-linecap="round"/>${eyes}`);
  }
  const ry = 34 + stage * 2, top = 104 - ry, ey = 104 - ry * .32, my = ey + 15;
  let back = '', front = '';
  // ---- phần phía sau thân ----
  if (kind === 'rong') {
    back += `<path d="M112 124q${18 + stage * 4} 4 ${26 + stage * 5} -${10 + stage * 3}l-6 ${stage > 2 ? 12 : 9}q-12 10-24 6z" fill="${K.c1}"/><path d="M${136 + stage * 5} ${114 - stage * 3}l8 -8 2 12z" fill="${K.acc}"/>`;
    if (stage >= 3) { const w = stage >= 4 ? 1.45 : 1; back += `<g transform="translate(46 96) scale(${w}) translate(-46 -96)" fill="#A98BFF" stroke="#7E5FE0" stroke-width="2"><path d="M46 90Q14 66 16 100q10-4 14 6 6-8 16-2z"/></g><g transform="translate(114 96) scale(${-w} ${w}) translate(-46 -96)" fill="#A98BFF" stroke="#7E5FE0" stroke-width="2"><path d="M46 90Q14 66 16 100q10-4 14 6 6-8 16-2z"/></g>`; }
  } else if (kind === 'meo') {
    if (stage >= 2) back += `<path d="M114 128q30 -6 22 -36q-4 -12 -12 -6" stroke="${K.c1}" stroke-width="${stage >= 4 ? 11 : 8}" fill="none" stroke-linecap="round"/>`;
    if (stage >= 4) back += `<g fill="#fff" stroke="#DCD3FF" stroke-width="2"><ellipse cx="32" cy="96" rx="20" ry="13"/><ellipse cx="24" cy="108" rx="14" ry="10"/><ellipse cx="128" cy="96" rx="20" ry="13"/><ellipse cx="136" cy="108" rx="14" ry="10"/></g>`;
  } else {
    if (stage >= 2) back += `<path d="M114 122q16 -8 18 -24" stroke="${K.c1}" stroke-width="9" fill="none" stroke-linecap="round" class="wag"/>`;
    if (stage >= 4) back += `<path d="M50 ${top + ry * .55}q30 18 60 0l14 ${ry + 18}q-44 14-88 0z" fill="#FF6B6B" stroke="#D94B4B" stroke-width="2"/>`;
  }
  if (stage === 5) back = `<circle cx="80" cy="${104 - ry * .1}" r="${ry + 26}" fill="${K.acc}" opacity=".22"/>` + back;
  // ---- thân ----
  let ears = '';
  if (kind === 'rong') {
    const h = stage >= 4 ? 1.5 : stage >= 2 ? 1.1 : .7;
    ears = `<path d="M62 ${top + 8}l${-6 * h} ${-16 * h} ${14 * h} ${8 * h}z" fill="${K.acc}"/><path d="M98 ${top + 8}l${6 * h} ${-16 * h} ${-14 * h} ${8 * h}z" fill="${K.acc}"/>`;
    if (stage >= 2) ears += `<g fill="${K.acc}"><path d="M74 ${top + 2}l6 -10 6 10z"/></g>`;
  } else if (kind === 'meo') {
    ears = `<path d="M54 ${top + 18}l2 -26 22 14z" fill="${K.c1}"/><path d="M106 ${top + 18}l-2 -26 -22 14z" fill="${K.c1}"/><path d="M59 ${top + 12}l1 -12 10 7z" fill="#FFC1D9"/><path d="M101 ${top + 12}l-1 -12 -10 7z" fill="#FFC1D9"/>`;
  } else {
    ears = `<ellipse cx="46" cy="${top + 26}" rx="11" ry="${18 + stage}" fill="${K.c3}" transform="rotate(18 46 ${top + 26})"/><ellipse cx="114" cy="${top + 26}" rx="11" ry="${18 + stage}" fill="${K.c3}" transform="rotate(-18 114 ${top + 26})"/>`;
  }
  const body = `<ellipse cx="80" cy="148" rx="${30 + stage * 3}" ry="6" fill="#0000001a"/>${back}
    <ellipse cx="62" cy="142" rx="12" ry="7" fill="${K.c3}"/><ellipse cx="98" cy="142" rx="12" ry="7" fill="${K.c3}"/>
    ${kind === 'cun' ? '' : ears}<ellipse cx="80" cy="104" rx="${38 + stage}" ry="${ry}" fill="${K.c1}"/>${kind === 'cun' ? ears : ''}
    <ellipse cx="80" cy="${114 + stage}" rx="${22 + stage}" ry="${18 + stage * 1.5}" fill="${K.c2}"/>`;
  // ---- mặt ----
  let face;
  if (mood === 'sleepy') face = `<path d="M60 ${ey}q6 5 12 0M88 ${ey}q6 5 12 0" stroke="#2A2340" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="80" cy="${my + 2}" rx="4" ry="3" fill="#2A2340"/><text x="112" y="${top + 6}" font-size="16" font-weight="800" fill="#8590AA">z</text><text x="122" y="${top - 6}" font-size="12" font-weight="800" fill="#8590AA">z</text>`;
  else face = eyesFor(mood === 'cheer' ? 'cheer' : 'happy', 66, 94, ey, stage <= 1 ? 11 : 9.5) + mouthFor(mood === 'cheer' ? 'cheer' : 'happy', 80, my, 12);
  if (kind === 'cun' && stage >= 2) face = `<ellipse cx="94" cy="${ey}" rx="15" ry="13" fill="${K.c3}" opacity=".45"/>` + face;
  face += `<circle cx="56" cy="${my}" r="5" fill="#FF9AA8" opacity=".7"/><circle cx="104" cy="${my}" r="5" fill="#FF9AA8" opacity=".7"/>`;
  if (kind === 'meo') face += `<path d="M44 ${my - 2}h-14M44 ${my + 4}l-13 4M116 ${my - 2}h14M116 ${my + 4}l13 4" stroke="#8E78E8" stroke-width="2" stroke-linecap="round"/>`;
  if (kind === 'cun') face += `<ellipse cx="80" cy="${my - 6}" rx="5" ry="3.5" fill="#2A2340"/>`;
  // ---- phụ kiện phía trước ----
  if (kind === 'rong' && stage >= 4) front += `<path d="M80 138c-7 -6 -2 -13 0 -17 2 4 7 11 0 17z" fill="#FF6B4A"/>`;
  if (kind === 'cun' && stage >= 3) front += `<path d="M54 ${my + 14}q26 12 52 0" stroke="#FF6B6B" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M80 ${my + 18}l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="${K.acc}" stroke="#E0A800" stroke-width="1"/>`;
  if (kind === 'meo' && stage >= 3) front += `<g fill="#fff" stroke="#DCD3FF" stroke-width="2"><ellipse cx="50" cy="146" rx="20" ry="9"/><ellipse cx="80" cy="150" rx="26" ry="10"/><ellipse cx="110" cy="146" rx="20" ry="9"/></g>`;
  if (stage === 5) front += `<path d="M64 ${top - 2}l4 -18 8 10 4 -14 4 14 8 -10 4 18z" fill="#FFD23F" stroke="#E0A800" stroke-width="2"/><circle cx="80" cy="${top - 10}" r="2.6" fill="#FF6B6B"/>
    <g fill="${K.acc}"><path d="M22 60l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M138 52l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/><path d="M140 120l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>`;
  return wrap(body + face + front);
}
