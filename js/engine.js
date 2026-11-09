/* =====================================================================
   ENGINE: hình minh họa + bộ sinh câu hỏi luyện tập
   ===================================================================== */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b, s = 1) => { const o = []; for (let i = a; s > 0 ? i <= b : i >= b; i += s) o.push(i); return o; };
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stripTags = s => String(s).replace(/<[^>]+>/g, '');

const NUM_VI = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];
const ORD_VI = ['', 'thứ nhất', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy', 'thứ tám'];
const THINGS = [['🍎', 'quả táo'], ['🐟', 'con cá'], ['⭐', 'ngôi sao'], ['🎈', 'quả bóng bay'], ['🐤', 'chú gà con'], ['🌸', 'bông hoa'], ['🚗', 'chiếc xe'], ['🍪', 'cái bánh'], ['🦋', 'con bướm'], ['🍓', 'quả dâu'], ['🐞', 'con bọ rùa'], ['🍌', 'quả chuối']];
const PEOPLE = ['Bông', 'Tí', 'Na', 'Bin', 'Su', 'Mít', 'Bơ', 'Cốm'];

/* ---------------- hình minh họa ---------------- */
const CUBE_A = 'var(--cube-a)', CUBE_B = 'var(--cube-b)';
function cube(c = CUBE_A, extra = '') { return `<i class="cb ${extra}" style="--cc:${c}"></i>`; }
function blocks(n, c = CUBE_A, opt = {}) {
  if (n > 20 && !opt.flat) return tensVis(n);
  if (n > 10 && !opt.flat) return tensVis(n);
  if (n === 0) return `<div class="vis-empty">0 khối</div>`;
  let h = '', i = 0;
  const per = n <= 5 ? n : 5;
  while (i < n) { const row = Math.min(per, n - i); h += `<div class="cb-row">${cube(c).repeat(row)}</div>`; i += row; }
  return `<div class="cubes">${h}</div>`;
}
function twoGroups(a, b) {
  return `<div class="groups"><div class="cubes g">${blocksRaw(a, CUBE_A)}</div><span class="plus">+</span><div class="cubes g">${blocksRaw(b, CUBE_B)}</div></div>`;
}
function blocksRaw(n, c, ghost = 0) {
  if (n + ghost === 0) return '<span class="zero">0</span>';
  const cells = [...Array(n)].map(() => cube(c)).concat([...Array(ghost)].map(() => cube(c, 'ghost')));
  let h = ''; for (let i = 0; i < cells.length; i += 5) h += `<div class="cb-row">${cells.slice(i, i + 5).join('')}</div>`;
  return h;
}
function tensVis(n) {
  const H = Math.floor(n / 100), T = Math.floor((n % 100) / 10), O = n % 10;
  let h = '';
  if (H) h += `<div class="hund-wrap">${'<i class="hund"></i>'.repeat(Math.min(H, 10))}</div>`;
  if (T) h += `<div class="rods">${'<i class="rod"></i>'.repeat(T)}</div>`;
  if (O) h += `<div class="cubes ones">${blocksRaw(O, CUBE_B)}</div>`;
  const lab = [H ? `${H} trăm` : '', T ? `${T} chục` : '', O ? `${O} đơn vị` : ''].filter(Boolean).join(' · ');
  return `<div class="tens">${h}</div><div class="vis-cap">${lab || '0'}</div>`;
}
function arrVis(r, c, col = CUBE_A) {
  const sz = Math.max(10, Math.min(28, Math.floor(240 / Math.max(r, c))));
  return `<div class="arr" style="--n:${c};--s:${sz}px">${cube(col).repeat(r * c)}</div><div class="vis-cap">${r} hàng × ${c} cột</div>`;
}
function emojiVis(em, n) {
  const per = n <= 5 ? n : n <= 10 ? 5 : 10;
  return `<div class="emos" style="--n:${per}">${`<span>${em}</span>`.repeat(n)}</div>`;
}
function lineVis(a, b, x) {
  const W = 320, pad = 14, n = b - a, step = (W - 2 * pad) / n;
  const every = n <= 20 ? 1 : n <= 50 ? 5 : 10;
  let t = '';
  for (let i = 0; i <= n; i++) {
    const v = a + i, X = pad + i * step, show = v % every === 0 || v === x, big = v === x;
    t += `<line x1="${X}" y1="30" x2="${X}" y2="${v % (every * 2 || 2) === 0 || every === 1 ? 40 : 37}" stroke="currentColor" stroke-width="1.5"/>`;
    if (show) t += big ? `<circle cx="${X}" cy="34" r="11" fill="var(--accent)"/><text x="${X}" y="38.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${v}</text>` : `<text x="${X}" y="56" text-anchor="middle" font-size="${n > 12 ? 9 : 12}" font-weight="700" fill="currentColor">${v}</text>`;
  }
  return `<svg class="nline" viewBox="0 0 ${W} 62" role="img" aria-label="Tia số từ ${a} đến ${b}"><line x1="${pad - 6}" y1="34" x2="${W - pad + 8}" y2="34" stroke="currentColor" stroke-width="2.5"/><path d="M${W - pad + 8} 34l-7-5v10z" fill="currentColor"/>${t}</svg>`;
}
function seqVis(items) { return `<div class="seq">${items.map(v => `<span class="${v === '?' ? 'q' : ''}">${escH(v)}</span>`).join('')}</div>`; }
const DOT_POS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [0, 2], [2, 0], [2, 2]], 5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], 6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]] };
function die(n) { return `<div class="die">${(DOT_POS[n] || []).map(([r, c]) => `<i style="grid-row:${r + 1};grid-column:${c + 1}"></i>`).join('')}</div>`; }
function dotsVis(n) { if (n <= 6) return `<div class="dice">${die(n)}</div>`; if (n <= 10) return `<div class="dice">${die(5)}${die(n - 5)}</div>`; return `<div class="dice">${die(5)}${die(5)}${die(n - 10)}</div>`; }
function handVis(n) {
  const hands = Math.max(1, Math.ceil(n / 5));
  let h = '';
  for (let k = 0; k < hands; k++) { let f = ''; for (let i = 0; i < 5; i++) f += `<i class="${k * 5 + i < n ? 'on' : ''}" style="--h:${[26, 38, 42, 38, 30][i]}px"></i>`; h += `<div class="hand"><div class="fingers">${f}</div><div class="palm"></div></div>`; }
  return `<div class="hands">${h}</div><div class="vis-cap">${n} ngón tay</div>`;
}
function stairsVis(n) { let h = ''; for (let i = 1; i <= n; i++) h += `<div class="col">${cube(CUBE_A).repeat(i)}</div>`; return `<div class="stairs">${h}</div><div class="vis-cap">1${range(2, n).map(i => ' + ' + i).join('')} = ${n * (n + 1) / 2}</div>`; }
function cubeVis(n) {
  // khối lập phương N×N×N vẽ isometric
  const s = 64 / n, ox = 80, oy = 18; let p = '';
  const P = (x, y, z) => [ox + (x - y) * s * 0.87, oy + (x + y) * s * 0.5 - z * s + 64];
  const poly = (pts, f) => `<polygon points="${pts.map(q => q.join(',')).join(' ')}" fill="${f}" stroke="#00000033" stroke-width="1"/>`;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    p += poly([P(i, j, n), P(i + 1, j, n), P(i + 1, j + 1, n), P(i, j + 1, n)], 'var(--cube-top)');
  }
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) {
    p += poly([P(i, n, k), P(i + 1, n, k), P(i + 1, n, k + 1), P(i, n, k + 1)], 'var(--cube-a)');
    p += poly([P(n, i, k), P(n, i + 1, k), P(n, i + 1, k + 1), P(n, i, k + 1)], 'var(--cube-side)');
  }
  return `<svg class="cube3d" viewBox="0 0 160 150" role="img" aria-label="Khối lập phương ${n} nhân ${n} nhân ${n}">${p}</svg><div class="vis-cap">${n} × ${n} × ${n}</div>`;
}
const SHAPES = {
  sq: ['hình vuông', '<rect x="14" y="14" width="52" height="52" rx="3"/>', 4],
  re: ['hình chữ nhật', '<rect x="4" y="22" width="72" height="38" rx="3"/>', 4],
  tri: ['hình tam giác', '<path d="M40 8 L74 70 L6 70 Z"/>', 3],
  ci: ['hình tròn', '<circle cx="40" cy="40" r="32"/>', 0]
};
function shapeSvg(k, col = 'var(--accent)') { return `<svg class="shp" viewBox="0 0 80 80" aria-label="${SHAPES[k][0]}"><g fill="${col}" stroke="color-mix(in srgb,${col} 60%,#000)" stroke-width="3" stroke-linejoin="round">${SHAPES[k][1]}</g></svg>`; }

function vis(spec) {
  if (!spec) return '';
  const [t, a, b, c] = spec.split(':');
  switch (t) {
    case 'b': return blocks(+a);
    case 'bb': { const [x, y] = a.split('+').map(Number); return x + y > 20 ? `<div class="groups">${tensVis(x)}<span class="plus">+</span>${tensVis(y)}</div>` : twoGroups(x, y); }
    case 'e': return emojiVis(a, +b);
    case 'arr': { const [r, cc] = a.split('x').map(Number); return arrVis(r, cc); }
    case 'line': { const [x, y] = a.split('-').map(Number); return lineVis(x, y, +b); }
    case 'seq': return seqVis(a.split(','));
    case 'tens': return tensVis(+a);
    case 'eq': return `<div class="eqv">${escH(spec.slice(3)).replace(/([+\-×:=<>])/g, '<b>$1</b>')}</div>`;
    case 'txt': return `<div class="bigtxt">${escH(spec.slice(4))}</div>`;
    case 'stairs': return stairsVis(+a);
    case 'cube': return cubeVis(+a || 2);
    case 'dots': return dotsVis(+a);
    case 'hand': return handVis(+a);
    case 'shape': return `<div class="shapes">${shapeSvg(a)}</div><div class="vis-cap">${SHAPES[a][0]}</div>`;
    case 'shapes': return `<div class="shapes">${Object.keys(SHAPES).map((k, i) => shapeSvg(k, ['#F2994A', '#2D9CDB', '#27AE60', '#EB5757'][i])).join('')}</div>`;
    default: return `<div class="bigtxt">${escH(spec)}</div>`;
  }
}

/* ---------------- sinh câu hỏi ---------------- */
function numOpts(ans, lo = 0, hi = ans + 5, n = 4) {
  const s = new Set([ans]); const span = Math.max(3, Math.ceil(Math.abs(ans) * 0.15));
  let guard = 0;
  while (s.size < n && guard++ < 200) {
    const d = rnd(-span, span) || 1; const v = ans + d;
    if (v >= lo && v <= Math.max(hi, ans + span)) s.add(v);
  }
  let k = 1; while (s.size < n) { s.add(ans + k); k++; }
  return shuffle([...s]).map(v => ({ v, h: String(v) }));
}
const Q = (o) => Object.assign({ kind: 'mc', vis: '', ex: '' }, o);
const thing = () => pickOne(THINGS);

const GEN = {
  count(a = 1, b = 5) { a = +a; b = +b; const n = rnd(a, b); return Q({ q: 'Có bao nhiêu khối?', vis: n > 10 ? tensVis(n).replace(/<div class="vis-cap">.*?<\/div>/, '') : blocks(n), opts: numOpts(n, 0, b + 2), ans: n, ex: `Đếm lần lượt từng khối: có <b>${n}</b> khối.` }); },
  counte(a = 1, b = 6) { const n = rnd(+a, +b), [em, nm] = thing(); return Q({ q: `Có bao nhiêu ${nm}?`, vis: emojiVis(em, n), opts: numOpts(n, 0, +b + 2), ans: n, ex: `Chạm vào từng ${nm} và đếm: <b>${n}</b>.` }); },
  pick(a = 1, b = 5) {
    a = +a; b = +b; const n = rnd(a, b), [em, nm] = thing();
    const s = new Set([n]); let g = 0; while (s.size < 3 && g++ < 50) { const v = n + pickOne([-2, -1, 1, 2]); if (v >= 1 && v <= b + 2) s.add(v); }
    return Q({ q: `Chọn nhóm có <b>${n}</b> ${nm}`, opts: shuffle([...s]).map(v => ({ v, h: `<div class="emos sm" style="--n:${Math.min(5, v)}">${`<span>${em}</span>`.repeat(v)}</div>` })), ans: n, wide: true, ex: `Nhóm đúng có <b>${n}</b> ${nm}.` });
  },
  numword(a = 1, b = 5) { const n = rnd(+a, +b); if (Math.random() < .5) return Q({ q: `Số nào là “<b>${NUM_VI[n]}</b>”?`, opts: numOpts(n, 0, 10), ans: n, ex: `“${NUM_VI[n]}” viết là <b>${n}</b>.` }); const o = numOpts(n, 0, 10).map(x => ({ v: x.v, h: NUM_VI[x.v] })); return Q({ q: 'Đọc số này thế nào?', vis: `<div class="bigtxt">${n}</div>`, opts: o, ans: n, ex: `${n} đọc là <b>${NUM_VI[n]}</b>.` }); },
  build(a = 1, b = 5) { const n = rnd(+a, +b); return Q({ kind: 'build', q: `Con hãy xếp đúng <b>${n}</b> khối nhé!`, ans: n, max: Math.max(10, +b + 2), ex: `Cần đúng <b>${n}</b> khối.` }); },
  next(a = 1, b = 10) { const n = rnd(+a, +b - 1); return Q({ q: `Số liền <b>sau</b> của ${n} là số nào?`, vis: +b <= 20 ? lineVis(Math.max(0, Math.min(n - 5, +b - 10)), Math.max(10, Math.min(n + 5, +b)), n) : seqVis([n, '?']), opts: numOpts(n + 1, 0, +b + 2), ans: n + 1, ex: `${n} thêm 1 là <b>${n + 1}</b>.` }); },
  prev(a = 1, b = 10) { const n = rnd(Math.max(1, +a), +b); return Q({ q: `Số liền <b>trước</b> của ${n} là số nào?`, vis: seqVis(['?', n]), opts: numOpts(n - 1, 0, +b), ans: n - 1, ex: `${n} bớt 1 là <b>${n - 1}</b>.` }); },
  seq(a = 1, b = 10, st = 1) { a = +a; b = +b; st = +st || 1; let len = 5; while (len > 3 && a + (len - 1) * st > b) len--; const start = rnd(a, Math.max(a, b - (len - 1) * st)); const items = range(0, len - 1).map(i => start + i * st); const hi = rnd(1, len - 1); const ans = items[hi]; const shown = items.map((v, i) => i === hi ? '?' : v); return Q({ q: 'Số nào còn thiếu?', vis: seqVis(shown), opts: numOpts(ans, 0, b + st), ans, ex: `Mỗi số hơn số trước <b>${st}</b>, nên số thiếu là <b>${ans}</b>.` }); },
  skip(st = 2, max = 20) { st = +st; max = +max; const len = Math.min(5, Math.floor(max / st)); const start = rnd(1, Math.max(1, Math.floor(max / st) - len + 1)); const items = range(0, len - 1).map(i => (start + i) * st); const hi = rnd(1, len - 1); const ans = items[hi]; return Q({ q: `Đếm cách ${st}: số nào còn thiếu?`, vis: seqVis(items.map((v, i) => i === hi ? '?' : v)), opts: shuffle([ans, ans + st, ans - st > 0 ? ans - st : ans + 2 * st, ans + 1]).map(v => ({ v, h: String(v) })), ans, ex: `Đếm cách ${st}: ${items.join(', ')}.` }); },
  back(max = 10) { max = +max; const s = rnd(4, max); const items = [s, s - 1, s - 2]; return Q({ q: 'Đếm lùi: số tiếp theo là?', vis: seqVis([...items, '?']), opts: numOpts(s - 3, 0, max), ans: s - 3, ex: `Đếm lùi mỗi lần bớt 1: … ${s - 2}, <b>${s - 3}</b>.` }); },
  cmp(a = 1, b = 10) {
    a = +a; b = +b; let x = rnd(a, b), y = rnd(a, b); let g = 0; while (y === x && g++ < 20) y = rnd(a, b); if (x === y) y = x + 1;
    const big = Math.random() < .6, ans = big ? Math.max(x, y) : Math.min(x, y); const small = b <= 10;
    return Q({ q: `Số nào <b>${big ? 'lớn hơn' : 'bé hơn'}</b>?`, opts: [x, y].map(v => ({ v, h: small ? `<div class="optvis">${blocks(v)}<b>${v}</b></div>` : `<span class="big">${v}</span>` })), ans, wide: small, ex: `${Math.max(x, y)} lớn hơn ${Math.min(x, y)}.` });
  },
  sign(a = 1, b = 10) { a = +a; b = +b; const x = rnd(a, b); const y = Math.random() < .2 ? x : rnd(a, b); const ans = x > y ? '>' : x < y ? '<' : '='; return Q({ q: `Chọn dấu đúng: <b>${x} ? ${y}</b>`, vis: `<div class="eqv">${x} <b class="q">?</b> ${y}</div>`, opts: ['>', '<', '='].map(v => ({ v, h: `<span class="big">${v}</span>` })), ans, ex: x === y ? 'Hai số bằng nhau nên dùng dấu <b>=</b>.' : `${x} ${ans} ${y}: miệng dấu luôn mở về phía số lớn hơn.` }); },
  add(max = 10) { max = +max; const s = rnd(2, max), x = rnd(Math.min(1, s), s - 1 || 1), y = s - x; return Q({ q: `${x} + ${y} = ?`, vis: `<div class="eqv">${x} <b>+</b> ${y} <b>=</b> <b class="q">?</b></div>`, opts: numOpts(s, 0, max + 3), ans: s, ex: `${x} + ${y} = <b>${s}</b>. Đếm tiếp từ ${Math.max(x, y)} thêm ${Math.min(x, y)} bước.` }); },
  addv(max = 5) { max = +max; const s = rnd(2, max), x = rnd(1, s - 1), y = s - x; return Q({ q: `${x} + ${y} = ?`, vis: twoGroups(x, y), opts: numOpts(s, 0, max + 2), ans: s, ex: `Gộp ${x} khối và ${y} khối được <b>${s}</b> khối.` }); },
  add1(max = 9) { const n = rnd(0, +max); return Q({ q: `${n} + 1 = ?`, vis: twoGroups(n, 1), opts: numOpts(n + 1, 0, +max + 2), ans: n + 1, ex: `Thêm 1 là số liền sau: <b>${n + 1}</b>.` }); },
  sub1(max = 10) { const n = rnd(1, +max); return Q({ q: `${n} − 1 = ?`, vis: `<div class="cubes">${blocksRaw(n - 1, CUBE_A, 0)}${cube(CUBE_A, 'gone')}</div>`, opts: numOpts(n - 1, 0, +max), ans: n - 1, ex: `Bớt 1 là số liền trước: <b>${n - 1}</b>.` }); },
  add5() { const k = rnd(1, 5); return Q({ q: `5 + ${k} = ?`, vis: handVis(5 + k), opts: numOpts(5 + k, 0, 12), ans: 5 + k, ex: `Một bàn tay là 5, thêm ${k} ngón là <b>${5 + k}</b>.` }); },
  add3(max = 10) { max = +max; const s = rnd(3, max); const x = rnd(1, s - 2), y = rnd(1, s - x - 1), z = s - x - y; return Q({ q: `${x} + ${y} + ${z} = ?`, vis: `<div class="eqv">${x} <b>+</b> ${y} <b>+</b> ${z} <b>=</b> <b class="q">?</b></div>`, opts: numOpts(s, 0, max + 3), ans: s, ex: `${x} + ${y} = ${x + y}, thêm ${z} là <b>${s}</b>.` }); },
  addx(max = 20) { const x = rnd(6, 9), y = rnd(11 - x, Math.min(9, +max - x)); const s = x + y; return Q({ q: `${x} + ${y} = ?`, vis: `<div class="eqv">${x} <b>+</b> ${y} <b>=</b> <b class="q">?</b></div>`, opts: numOpts(s, 0, 20), ans: s, ex: `Tách ${y} = ${10 - x} + ${y - (10 - x)}. ${x} + ${10 - x} = 10, 10 + ${y - (10 - x)} = <b>${s}</b>.` }); },
  sub(max = 10) { max = +max; const x = rnd(2, max), y = rnd(1, x), r = x - y; return Q({ q: `${x} − ${y} = ?`, vis: `<div class="eqv">${x} <b>−</b> ${y} <b>=</b> <b class="q">?</b></div>`, opts: numOpts(r, 0, max), ans: r, ex: `${x} bớt ${y} còn <b>${r}</b>.` }); },
  subv(max = 5) { max = Math.min(10, +max); const x = rnd(2, max), y = rnd(1, x), r = x - y; return Q({ q: `${x} − ${y} = ?`, vis: `<div class="cubes">${blocksRaw(r, CUBE_A)}<div class="cb-row">${cube(CUBE_A, 'gone').repeat(y)}</div></div><div class="vis-cap">Có ${x}, bớt ${y}</div>`, opts: numOpts(r, 0, max), ans: r, ex: `Có ${x} khối, lấy đi ${y} khối còn <b>${r}</b>.` }); },
  bond(n = 5) { n = +n; const x = rnd(0, n); const r = n - x; return Q({ q: `${n} gồm ${x} và mấy?`, vis: n <= 10 ? `<div class="cubes">${blocksRaw(x, CUBE_A, r)}</div>` : `<div class="eqv">${x} <b>+</b> <b class="q">?</b> <b>=</b> ${n}</div>`, opts: numOpts(r, 0, n), ans: r, ex: `${x} + <b>${r}</b> = ${n}.` }); },
  make10() { return GEN.bond(10); }, make20() { const x = rnd(1, 19); return Q({ q: `${x} + ? = 20`, vis: `<div class="eqv">${x} <b>+</b> <b class="q">?</b> <b>=</b> 20</div>`, opts: numOpts(20 - x, 0, 20), ans: 20 - x, ex: `${x} + <b>${20 - x}</b> = 20.` }); },
  make100() { const x = rnd(1, 19) * 5; return Q({ q: `${x} + ? = 100`, vis: `<div class="eqv">${x} <b>+</b> <b class="q">?</b> <b>=</b> 100</div>`, opts: shuffle([100 - x, 100 - x + 10, Math.abs(100 - x - 10) || 15, 100 - x + 5]).filter((v, i, a) => a.indexOf(v) === i).map(v => ({ v, h: String(v) })), ans: 100 - x, ex: `${x} + <b>${100 - x}</b> = 100.` }); },
  miss(max = 20) { max = +max; const c = rnd(3, max), a = rnd(1, c - 1), b = c - a; const t = rnd(0, 2); if (t === 0) return Q({ q: `${a} + ? = ${c}`, vis: `<div class="eqv">${a} <b>+</b> <b class="q">?</b> <b>=</b> ${c}</div>`, opts: numOpts(b, 0, max), ans: b, ex: `${c} − ${a} = <b>${b}</b>.` }); if (t === 1) return Q({ q: `? + ${b} = ${c}`, vis: `<div class="eqv"><b class="q">?</b> <b>+</b> ${b} <b>=</b> ${c}</div>`, opts: numOpts(a, 0, max), ans: a, ex: `${c} − ${b} = <b>${a}</b>.` }); return Q({ q: `${c} − ? = ${a}`, vis: `<div class="eqv">${c} <b>−</b> <b class="q">?</b> <b>=</b> ${a}</div>`, opts: numOpts(b, 0, max), ans: b, ex: `${c} − <b>${b}</b> = ${a}.` }); },
  dbl(max = 5) { const n = rnd(1, +max); return Q({ q: `Gấp đôi ${n} là bao nhiêu?`, vis: n <= 10 ? twoGroups(n, n) : `<div class="eqv">${n} <b>+</b> ${n} <b>=</b> <b class="q">?</b></div>`, opts: numOpts(2 * n, 0, 2 * +max + 2), ans: 2 * n, ex: `${n} + ${n} = <b>${2 * n}</b>.` }); },
  half(max = 10) { const n = rnd(1, Math.floor(+max / 2)); return Q({ q: `Một nửa của ${2 * n} là bao nhiêu?`, vis: 2 * n <= 20 ? arrVis(2, n) : '', opts: numOpts(n, 0, +max), ans: n, ex: `${n} + ${n} = ${2 * n}, nên một nửa của ${2 * n} là <b>${n}</b>.` }); },
  eo(a = 1, b = 10) { const n = rnd(+a, +b), ev = n % 2 === 0; return Q({ q: `Số ${n} là số chẵn hay số lẻ?`, vis: n <= 20 ? `<div class="arr" style="--n:${Math.ceil(n / 2)};--s:22px">${cube(CUBE_A).repeat(n)}</div>` : `<div class="bigtxt">${n}</div>`, opts: [{ v: 'chẵn', h: '⚖️ Chẵn' }, { v: 'lẻ', h: '☝️ Lẻ' }], ans: ev ? 'chẵn' : 'lẻ', ex: ev ? `${n} xếp được thành đôi, không thừa: số <b>chẵn</b>.` : `${n} xếp đôi còn thừa 1: số <b>lẻ</b>. Số lẻ tận cùng là 1, 3, 5, 7, 9.` }); },
  diff(max = 10) { max = +max; const x = rnd(3, max), y = rnd(1, x - 1); return Q({ q: `${x} hơn ${y} bao nhiêu?`, vis: max <= 10 ? `<div class="towers"><div class="tw">${cube(CUBE_A).repeat(x)}</div><div class="tw">${cube(CUBE_B).repeat(y)}</div></div>` : `<div class="eqv">${x} <b>−</b> ${y} <b>=</b> <b class="q">?</b></div>`, opts: numOpts(x - y, 0, max), ans: x - y, ex: `${x} − ${y} = <b>${x - y}</b>.` }); },
  tall(max = 12) { max = Math.min(12, +max); const x = rnd(2, max); let y = rnd(2, max); if (y === x) y = x > 2 ? x - 1 : x + 1; if (Math.random() < .5) return Q({ q: 'Tháp nào <b>cao hơn</b>?', vis: `<div class="towers"><div class="tw"><b>A</b>${cube(CUBE_A).repeat(x)}</div><div class="tw"><b>B</b>${cube(CUBE_B).repeat(y)}</div></div>`, opts: [{ v: 'A', h: '🟧 Tháp A' }, { v: 'B', h: '🟦 Tháp B' }], ans: x > y ? 'A' : 'B', ex: `Tháp A có ${x} khối, tháp B có ${y} khối.` }); return Q({ q: 'Tháp cao hơn hơn mấy khối?', vis: `<div class="towers"><div class="tw">${cube(CUBE_A).repeat(x)}</div><div class="tw">${cube(CUBE_B).repeat(y)}</div></div>`, opts: numOpts(Math.abs(x - y), 0, 12), ans: Math.abs(x - y), ex: `${Math.max(x, y)} − ${Math.min(x, y)} = <b>${Math.abs(x - y)}</b>.` }); },
  flash(a = 1, b = 5) { const n = rnd(+a, +b); return Q({ q: 'Nhìn nhanh! Có mấy chấm?', vis: `<div class="flash">${dotsVis(n)}</div>`, flash: true, opts: numOpts(n, 1, +b + 1), ans: n, ex: `Có <b>${n}</b> chấm.` }); },
  ordinal(n = 5) { n = +n; const ani = shuffle(['🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐸', '🐵']).slice(0, n); const k = rnd(1, n); return Q({ q: `Bạn có mũi tên đứng <b>thứ mấy</b> (tính từ trái)?`, vis: `<div class="ord">${ani.map((x, i) => `<span class="${i === k - 1 ? 'hl' : ''}">${x}</span>`).join('')}</div>`, opts: shuffle([k, ...shuffle(range(1, n).filter(v => v !== k)).slice(0, 3)]).map(v => ({ v, h: ORD_VI[v] })), ans: k, ex: `Đếm từ trái sang: bạn ấy đứng <b>${ORD_VI[k]}</b>.` }); },
  between(a = 0, b = 20) { const x = rnd(+a, +b - 2); return Q({ q: `Số nào nằm giữa ${x} và ${x + 2}?`, vis: seqVis([x, '?', x + 2]), opts: numOpts(x + 1, 0, +b), ans: x + 1, ex: `${x}, <b>${x + 1}</b>, ${x + 2}.` }); },
  tens(a = 10, b = 20) {
    const n = rnd(+a, +b), T = Math.floor(n / 10), O = n % 10;
    if (Math.random() < .5) return Q({ q: 'Đây là số nào?', vis: tensVis(n).replace(/<div class="vis-cap">.*?<\/div>/, ''), opts: numOpts(n, 0, +b + 5), ans: n, ex: `${T} chục và ${O} đơn vị là <b>${n}</b>.` });
    const mk = (t, o) => ({ v: t * 10 + o, h: `${t} chục ${o} đơn vị` });
    const os = [mk(T, O), mk(O, T), mk(T, Math.max(0, O - 1) === O ? O + 1 : Math.max(0, O - 1)), mk(T + 1, O)].filter((x, i, arr) => arr.findIndex(y => y.v === x.v) === i);
    while (os.length < 3) os.push(mk(T, (O + os.length + 2) % 10));
    return Q({ q: `Số <b>${n}</b> gồm mấy chục, mấy đơn vị?`, opts: shuffle(os), ans: n, wide: true, ex: `${n} = ${T} chục và ${O} đơn vị.` });
  },
  add10(a = 1, b = 9) { const k = rnd(+a, +b); return Q({ q: `10 + ${k} = ?`, vis: tensVis(10 + k), opts: numOpts(10 + k, 0, 25), ans: 10 + k, ex: `1 chục và ${k} đơn vị là <b>${10 + k}</b>.` }); },
  arr(R = 4, C = 5) { const r = rnd(2, +R), c = rnd(2, +C); return Q({ q: `Có ${r} hàng, mỗi hàng ${c} khối. Có tất cả bao nhiêu khối?`, vis: arrVis(r, c), opts: numOpts(r * c, 0, +R * +C + 4), ans: r * c, ex: `${r} × ${c} = <b>${r * c}</b>.` }); },
  rect(n = 12) { n = +n; const ds = range(2, n - 1).filter(d => n % d === 0); const r = pickOne(ds); return Q({ q: `Xếp ${n} khối thành ${r} hàng bằng nhau. Mỗi hàng có mấy khối?`, vis: n <= 24 ? `<div class="cubes">${blocksRaw(n, CUBE_A)}</div>` : '', opts: numOpts(n / r, 1, n), ans: n / r, ex: `${r} × <b>${n / r}</b> = ${n}.` }); },
  sqr(N = 4) { N = +N; const k = rnd(2, N); if (Math.random() < .55) return Q({ q: `${k} × ${k} = ?`, vis: k <= 6 ? arrVis(k, k) : '', opts: numOpts(k * k, 0, N * N + 10), ans: k * k, ex: `Hình vuông ${k} hàng × ${k} cột có <b>${k * k}</b> khối.` }); const sq = k * k; const non = shuffle(range(2, N * N + 3).filter(v => !Number.isInteger(Math.sqrt(v)))).slice(0, 3); return Q({ q: 'Số nào là <b>số vuông</b>?', opts: shuffle([sq, ...non]).map(v => ({ v, h: String(v) })), ans: sq, ex: `${sq} = ${k} × ${k} nên xếp được thành hình vuông.` }); },
  tri(N = 5) { N = +N; const k = rnd(2, N); const T = k * (k + 1) / 2; if (Math.random() < .6) return Q({ q: `Bậc thang ${k} bậc có tất cả bao nhiêu khối?`, vis: k <= 6 ? stairsVis(k).replace(/<div class="vis-cap">.*?<\/div>/, '') : `<div class="eqv">1 + 2 + … + ${k}</div>`, opts: numOpts(T, 0, T + 10), ans: T, ex: `1${range(2, k).map(i => ' + ' + i).join('')} = <b>${T}</b>.` }); const trs = range(1, N + 1).map(i => i * (i + 1) / 2); const non = shuffle(range(2, T + 6).filter(v => !trs.includes(v))).slice(0, 3); return Q({ q: 'Số nào là <b>số bậc thang</b>?', vis: seqVis([1, 3, 6, 10, '…']), opts: shuffle([T, ...non]).map(v => ({ v, h: String(v) })), ans: T, ex: `Số bậc thang: ${trs.join(', ')}.` }); },
  place(max = 100) {
    max = +max;
    if (max <= 20) { const n = rnd(11, 20); return Q({ q: `Số ${n} có mấy chục?`, vis: `<div class="bigtxt">${n}</div>`, opts: numOpts(Math.floor(n / 10), 0, 9), ans: Math.floor(n / 10), ex: `${n} = ${Math.floor(n / 10)} chục ${n % 10} đơn vị.` }); }
    if (max <= 100) { const t = rnd(2, 10); return Q({ q: `${t * 10} gồm mấy chục?`, vis: tensVis(t * 10).replace(/<div class="vis-cap">.*?<\/div>/, ''), opts: numOpts(t, 1, 12), ans: t, ex: `${t * 10} = <b>${t}</b> chục.` }); }
    const k = rnd(0, 2);
    if (k === 0) { const n = rnd(101, 999), d = String(n); const w = pickOne([['trăm', 0], ['chục', 1], ['đơn vị', 2]]); return Q({ q: `Số <b>${n}</b>: chữ số hàng ${w[0]} là?`, vis: `<div class="place"><span><small>trăm</small>${d[0]}</span><span><small>chục</small>${d[1]}</span><span><small>đơn vị</small>${d[2]}</span></div>`.replace(/<span><small>[^<]+<\/small>\d<\/span>/g, m => m), opts: shuffle([...new Set([+d[w[1]], +d[(w[1] + 1) % 3], +d[(w[1] + 2) % 3], (+d[w[1]] + 1) % 10])]).slice(0, 4).map(v => ({ v, h: String(v) })), ans: +d[w[1]], ex: `${n} = ${d[0]} trăm, ${d[1]} chục, ${d[2]} đơn vị.` }); }
    if (k === 1) { const h = rnd(1, 9), t = rnd(0, 9), o = rnd(0, 9); const n = h * 100 + t * 10 + o; return Q({ q: `${h * 100} + ${t * 10} + ${o} = ?`, opts: shuffle([n, h * 100 + o * 10 + t, (h + 1) * 100 + t * 10 + o, h * 10 + t * 100 + o].filter((v, i, a) => a.indexOf(v) === i)).map(v => ({ v, h: String(v) })), ans: n, ex: `${h} trăm, ${t} chục, ${o} đơn vị là <b>${n}</b>.` }); }
    const m = pickOne([[1000, 'trăm', 10], [1000, 'chục', 100], [100, 'chục', 10], [500, 'trăm', 5]]); return Q({ q: `${m[0]} gồm mấy ${m[1]}?`, opts: shuffle([m[2], m[2] * 10, Math.max(1, m[2] / 10), m[2] + 1].filter((v, i, a) => a.indexOf(v) === i)).map(v => ({ v, h: String(v) })), ans: m[2], ex: `${m[0]} = <b>${m[2]}</b> ${m[1]}.` });
  },
  round(max = 100) { max = +max; const a = rnd(1, max / 10 - 1) * 10; const sub = Math.random() < .4; const b = sub ? rnd(1, a / 10) * 10 : rnd(1, (max - a) / 10) * 10; const r = sub ? a - b : a + b; return Q({ q: `${a} ${sub ? '−' : '+'} ${b} = ?`, vis: `<div class="eqv">${a} <b>${sub ? '−' : '+'}</b> ${b} <b>=</b> <b class="q">?</b></div>`, opts: shuffle([r, r + 10, Math.abs(r - 10), r + 1].filter((v, i, x) => x.indexOf(v) === i)).map(v => ({ v, h: String(v) })), ans: r, ex: `${a / 10} chục ${sub ? 'bớt' : 'thêm'} ${b / 10} chục là ${r / 10} chục = <b>${r}</b>.` }); },
  jump10(max = 90) { const n = rnd(11, +max); const up = Math.random() < .5 || n < 20; const r = up ? n + 10 : n - 10; return Q({ q: `${n} ${up ? '+' : '−'} 10 = ?`, vis: tensVis(n).replace(/<div class="vis-cap">.*?<\/div>/, ''), opts: shuffle([r, up ? n + 1 : n - 1, up ? n + 20 : n - 20 < 0 ? n + 1 : n - 20, up ? r + 1 : r - 1].filter((v, i, a) => a.indexOf(v) === i)).map(v => ({ v, h: String(v) })), ans: r, ex: `${up ? 'Cộng' : 'Trừ'} 10 chỉ đổi hàng chục: <b>${r}</b>.` }); },
  bal(max = 10) { max = +max; const s = rnd(4, max); const a = rnd(1, s - 1), c = rnd(1, s - 1); let g = 0; let cc = c; while (cc === a && g++ < 10) cc = rnd(1, s - 1); return Q({ q: `${a} + ${s - a} = ${cc} + ?`, vis: `<div class="eqv">${a} <b>+</b> ${s - a} <b>=</b> ${cc} <b>+</b> <b class="q">?</b></div>`, opts: numOpts(s - cc, 0, max), ans: s - cc, ex: `Bên trái bằng ${s}. ${cc} + <b>${s - cc}</b> = ${s}.` }); },
  wrong(max = 10) { max = +max; const eqs = []; while (eqs.length < 3) { const x = rnd(1, max - 1), y = rnd(1, max - x); const op = Math.random() < .5; const t = op ? `${x} + ${y} = ${x + y}` : `${x + y} − ${y} = ${x}`; if (!eqs.includes(t)) eqs.push(t); } const x = rnd(1, max - 1), y = rnd(1, max - x); const bad = `${x} + ${y} = ${x + y + pickOne([1, -1, 2])}`; return Q({ q: 'Phép tính nào <b>SAI</b>?', opts: shuffle([...eqs, bad]).map(v => ({ v, h: v })), ans: bad, wide: true, ex: `Đúng phải là ${x} + ${y} = <b>${x + y}</b>.` }); },
  mul(tables = '2', maxF = 5) { const ts = String(tables).split(',').map(Number); const t = pickOne(ts), f = rnd(1, +maxF); const r = t * f; return Q({ q: `${t} × ${f} = ?`, vis: r <= 40 && t <= 10 && f <= 10 && t > 1 ? arrVis(f, t) : `<div class="eqv">${t} <b>×</b> ${f} <b>=</b> <b class="q">?</b></div>`, opts: shuffle([r, r + t, Math.max(0, r - t) === r ? r + 2 * t : Math.max(0, r - t), r + 1].filter((v, i, a) => a.indexOf(v) === i)).map(v => ({ v, h: String(v) })), ans: r, ex: `${t} × ${f} = <b>${r}</b> (${f} nhóm, mỗi nhóm ${t}).` }); },
  div(tables = '2', maxF = 5) { const ts = String(tables).split(',').map(Number); const t = pickOne(ts), f = rnd(1, +maxF); const n = t * f; return Q({ q: `${n} : ${t} = ?`, vis: n <= 40 ? arrVis(f, t) : '', opts: numOpts(f, 0, +maxF + 4), ans: f, ex: `Vì ${t} × ${f} = ${n}, nên ${n} : ${t} = <b>${f}</b>.` }); },
  share(max = 12) { max = +max; const k = rnd(2, 4); const each = rnd(1, Math.max(1, Math.floor(max / k))); const n = k * each; const [em, nm] = thing(); return Q({ q: `Chia đều ${n} ${nm} cho ${k} bạn. Mỗi bạn được mấy ${nm}?`, vis: n <= 24 ? emojiVis(em, n) : '', opts: numOpts(each, 0, max), ans: each, ex: `${n} : ${k} = <b>${each}</b>.` }); },
  cube() { const k = rnd(1, 3); if (k === 1 || Math.random() < .3) { const f = rnd(2, 5), l = rnd(2, 4); return Q({ q: `Mỗi tầng có ${f} khối, xếp ${l} tầng. Có tất cả bao nhiêu khối?`, opts: numOpts(f * l, 0, 30), ans: f * l, ex: `${l} × ${f} = <b>${f * l}</b>.` }); } return Q({ q: 'Khối lập phương này có bao nhiêu khối nhỏ?', vis: cubeVis(k), opts: shuffle([k ** 3, k * k, k * 3, k ** 3 + k].filter((v, i, a) => a.indexOf(v) === i)).map(v => ({ v, h: String(v) })), ans: k ** 3, ex: `${k} × ${k} × ${k} = <b>${k ** 3}</b>.` }); },
  prime(max = 20) { const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29].filter(p => p <= +max); const p = pickOne(ps.slice(1)); const non = shuffle([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20].filter(v => v <= +max)).slice(0, 3); return Q({ q: 'Số nào chỉ xếp được thành <b>một hàng</b> (không xếp được hình chữ nhật)?', opts: shuffle([p, ...non]).map(v => ({ v, h: String(v) })), ans: p, ex: `${p} là số nguyên tố: chỉ có 1 × ${p}.` }); },
  club() { const isSq = v => Number.isInteger(Math.sqrt(v)), isTri = v => Number.isInteger((Math.sqrt(8 * v + 1) - 1) / 2); const kinds = [['là số vuông', isSq], ['là số bậc thang', isTri], ['vừa chẵn vừa là số vuông', v => v % 2 === 0 && isSq(v)], ['là số lẻ', v => v % 2 === 1]]; const [lab, fn] = pickOne(kinds); const yes = shuffle(range(1, 36).filter(fn))[0]; const no = shuffle(range(2, 36).filter(v => !fn(v))).slice(0, 3); return Q({ q: `Số nào <b>${lab}</b>?`, opts: shuffle([yes, ...no]).map(v => ({ v, h: String(v) })), ans: yes, ex: `<b>${yes}</b> ${lab}.` }); },
  guess(max = 20) { max = +max; const t = rnd(3, max - 2); const x = t - rnd(1, 2), y = t + rnd(1, 2); const par = t % 2 === 0 ? 'chẵn' : 'lẻ'; const cands = new Set([t]); [x, y, t + 1, t - 1, t + 2].forEach(v => { if (v > 0 && v !== t) cands.add(v); }); const os = shuffle([...cands]).filter(v => v === t || v <= x || v >= y || (v % 2) !== (t % 2)).slice(0, 4); if (!os.includes(t)) os[0] = t; return Q({ q: `Tớ lớn hơn ${x}, bé hơn ${y} và là số ${par}. Tớ là số nào?`, vis: lineVis(Math.max(0, x - 2), Math.max(x + 8, y + 2), x), opts: shuffle(os).map(v => ({ v, h: String(v) })), ans: t, ex: `Các số lớn hơn ${x} và bé hơn ${y}: ${range(x + 1, y - 1).join(', ')}. Số ${par} là <b>${t}</b>.` }); },
  shape() { const ks = Object.keys(SHAPES); const k = pickOne(ks); if (Math.random() < .5) return Q({ q: 'Đây là hình gì?', vis: `<div class="shapes">${shapeSvg(k)}</div>`, opts: shuffle(ks).map(v => ({ v, h: SHAPES[v][0] })), ans: k, wide: true, ex: `Đây là <b>${SHAPES[k][0]}</b>.` }); const want = pickOne([['có 3 cạnh', 'tri'], ['không có góc nào', 'ci'], ['có 4 cạnh bằng nhau', 'sq'], ['có 2 cạnh dài, 2 cạnh ngắn', 're']]); return Q({ q: `Hình nào <b>${want[0]}</b>?`, opts: shuffle(ks).map(v => ({ v, h: shapeSvg(v) })), ans: want[1], ex: `${SHAPES[want[1]][0]} ${want[0]}.` }); },
  pattern() { const sets = [['🔴', '🔵', '🟡'], ['⭐', '🌙', '☀️'], ['🍎', '🍌', '🍇'], ['🐶', '🐱', '🐰'], ['🟥', '🟩', '🟦']]; const s = pickOne(sets); const pat = pickOne([[0, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1]]); const len = pat.length * 2 + rnd(0, pat.length - 1); const seqA = range(0, len).map(i => s[pat[i % pat.length]]); const ans = seqA[len]; return Q({ q: 'Hình tiếp theo là gì?', vis: `<div class="pat">${seqA.slice(0, len).map(x => `<span>${x}</span>`).join('')}<span class="q">?</span></div>`, opts: shuffle(s).map(v => ({ v, h: `<span class="big">${v}</span>` })), ans, ex: `Quy luật lặp lại: ${pat.map(i => s[i]).join(' ')}.` }); },
  word(op = 'add', max = 20) {
    max = +max; const A = pickOne(PEOPLE), [em, nm] = thing();
    if (op === 'add') { const x = rnd(2, max - 2), y = rnd(1, max - x); return Q({ q: `${A} có ${x} ${nm}, được cho thêm ${y} ${nm}. ${A} có tất cả bao nhiêu ${nm}?`, vis: `<div class="bigtxt">${em}</div>`, opts: numOpts(x + y, 0, max + 3), ans: x + y, ex: `${x} + ${y} = <b>${x + y}</b>.` }); }
    if (op === 'sub') { const x = rnd(3, max), y = rnd(1, x - 1); return Q({ q: `${A} có ${x} ${nm}, cho bạn ${y} ${nm}. ${A} còn lại bao nhiêu ${nm}?`, vis: `<div class="bigtxt">${em}</div>`, opts: numOpts(x - y, 0, max), ans: x - y, ex: `${x} − ${y} = <b>${x - y}</b>.` }); }
    if (op === 'mul') { const k = rnd(2, 5), e = rnd(2, Math.max(2, Math.min(10, Math.floor(max / k)))); return Q({ q: `Có ${k} cái đĩa, mỗi đĩa có ${e} ${nm}. Có tất cả bao nhiêu ${nm}?`, vis: `<div class="bigtxt">${'🍽️'.repeat(k)}</div>`, opts: numOpts(k * e, 0, k * e + 10), ans: k * e, ex: `${k} × ${e} = <b>${k * e}</b>.` }); }
    const k = rnd(2, 5), e = rnd(2, Math.max(2, Math.floor(max / k))); return Q({ q: `Có ${k * e} ${nm}, chia đều vào ${k} hộp. Mỗi hộp có mấy ${nm}?`, vis: `<div class="bigtxt">${'📦'.repeat(k)}</div>`, opts: numOpts(e, 0, max), ans: e, ex: `${k * e} : ${k} = <b>${e}</b>.` });
  }
};

function makeQuestion(spec) {
  const [t, ...args] = spec.split(':');
  const g = GEN[t];
  if (!g) { console.warn('Thiếu dạng bài', t); return GEN.count(1, 5); }
  return g(...args);
}
function buildQuiz(specs, n) {
  const out = []; const order = shuffle(specs); let i = 0, guard = 0;
  const seen = new Set();
  while (out.length < n && guard++ < n * 8) {
    const q = makeQuestion(order[i % order.length]); i++;
    const key = stripTags(q.q) + '|' + q.ans;
    if (seen.has(key) && guard < n * 6) continue;
    seen.add(key); out.push(q);
  }
  return out;
}
