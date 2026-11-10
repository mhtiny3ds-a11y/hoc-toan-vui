/* =====================================================================
   HỌC TOÁN VUI — ứng dụng chính
   Dữ liệu lưu trong trình duyệt (localStorage), không cần máy chủ.
   ===================================================================== */
const STAR = 1000, MAX_CAP = 50, LS_KEY = 'htv:v1', LOCK_MS = 10 * 60 * 1000;
const DONATE = { name: 'TAO MINH HIEN', acct: '141431319191', bank: 'MB Bank', qr: 'assets/donate-qr.jpg' };
/* Các mức ủng hộ: mã VietQR có sẵn số tiền (nội dung "Ung ho Hoc Toan Vui"); "Tùy tâm" dùng mã gốc không kèm số tiền */
const DONATE_TIERS = [
  { k: '39k', label: '39k', amount: 39000, qr: 'assets/donate-qr-39k.png' },
  { k: '59k', label: '59k', amount: 59000, qr: 'assets/donate-qr-59k.png' },
  { k: '99k', label: '99k', amount: 99000, qr: 'assets/donate-qr-99k.png' },
  { k: 'tuy-tam', label: 'Tùy tâm', amount: 0, qr: 'assets/donate-qr.jpg' }
];
let donateTier = 'tuy-tam';
const tierOf = k => DONATE_TIERS.find(t => t.k === k) || DONATE_TIERS[3];
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const vnd = n => n.toLocaleString('vi-VN') + 'đ';
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
function weekKey(d = new Date()) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); }

/* ---------------- lưu trữ ---------------- */
let STORE = { families: {}, dev: { familyId: null } };
function load() { try { const s = JSON.parse(localStorage.getItem(LS_KEY)); if (s && s.families) STORE = s; STORE.dev ||= { familyId: null }; } catch (e) { } }
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(STORE)); } catch (e) { toast('Không lưu được dữ liệu trên máy này.'); } }
async function hashPw(s) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('htv:' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 2166136261; for (const c of 'htv:' + s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(16); }
}

/* ---------------- trạng thái giao diện ---------------- */
const UI = { view: 'welcome', tab: 'learn', ptab: 'home', season: null, cid: null, parentAt: 0, lastAct: Date.now(), pin: '', err: '', sheet: null, toast: '', confirm: null, les: null, result: null, fails: 0, lockUntil: 0, regStep: 1 };

/* ---------------- miền dữ liệu ---------------- */
const fam = () => STORE.families[STORE.dev.familyId];
const childOf = (f, cid) => f?.children.find(c => c.id === cid);
const curChild = () => childOf(fam(), UI.cid);
function prog(f, cid) { f.progress ||= {}; f.progress[cid] ||= { lessons: {}, challenges: {}, missions: {}, ledger: [], log: [], streak: { last: null, count: 0 }, lastSeason: 1, speak: true }; return f.progress[cid]; }
const capOf = f => Math.min(MAX_CAP, Math.max(5, f.weeklyCap || MAX_CAP));
const weekStars = (f, cid, wk = weekKey()) => prog(f, cid).ledger.filter(e => e.wk === wk).reduce((a, e) => a + e.counted, 0);
const totalStars = (f, cid) => prog(f, cid).ledger.reduce((a, e) => a + e.counted, 0);
const unpaid = (f, cid) => prog(f, cid).ledger.filter(e => !e.paid).reduce((a, e) => a + e.counted, 0);
function award(f, cid, n, reason) {
  if (n <= 0) return { n: 0, counted: 0, over: 0 };
  const p = prog(f, cid), wk = weekKey(), have = weekStars(f, cid, wk);
  const counted = Math.max(0, Math.min(n, capOf(f) - have));
  p.ledger.push({ id: uid(), ts: Date.now(), wk, n, counted, reason, paid: false });
  return { n, counted, over: n - counted, total: have + counted };
}
function bumpStreak(p) { const t = dayKey(), y = dayKey(addDays(new Date(), -1)); if (p.streak.last === t) return; p.streak.count = p.streak.last === y ? p.streak.count + 1 : 1; p.streak.last = t; }
const streakNow = p => (p.streak.last === dayKey() || p.streak.last === dayKey(addDays(new Date(), -1))) ? p.streak.count : 0;

/* các "nút" trên bản đồ của một mùa: bài học + thử thách sau mỗi 5 bài */
function nodesOf(s) {
  const out = []; const ls = BY_SEASON[s];
  ls.forEach((l, i) => {
    out.push({ type: 'lesson', l, key: l.id });
    if ((i + 1) % 5 === 0) { const grp = ls.slice(i - 4, i + 1); out.push({ type: 'challenge', key: `s${s}c${(i + 1) / 5}`, k: (i + 1) / 5, grp, s }); }
  });
  return out;
}
const nodeBest = (p, n) => n.type === 'lesson' ? (p.lessons[n.key] || 0) : (p.challenges[n.key] || 0);
const seasonDone = (p, s) => nodesOf(s).every(n => nodeBest(p, n) > 0);
const seasonOpen = (f, p, s) => s == 1 || f.unlockAll || seasonDone(p, s - 1);
function nodeStates(f, cid, s) {
  const p = prog(f, cid), list = nodesOf(s), sOpen = seasonOpen(f, p, s); let curSet = false;
  return list.map((n, i) => {
    const best = nodeBest(p, n), done = best > 0;
    const open = f.unlockAll || (sOpen && (i === 0 || nodeBest(p, list[i - 1]) > 0));
    let current = false; if (open && !done && !curSet) { current = true; curSet = true; }
    return { ...n, i, best, done, open, current };
  });
}
const lessonsDone = p => Object.values(p.lessons).filter(v => v > 0).length;
function currentSeason(f, cid) { const p = prog(f, cid); for (let s = 1; s <= 6; s++) if (!seasonDone(p, s)) return s; return 6; }
function badgesOf(f, cid) {
  const p = prog(f, cid), ld = lessonsDone(p), st = streakNow(p), ms = Object.values(p.missions).filter(m => m.status === 'approved').length;
  const weeks = [...new Set(p.ledger.map(e => e.wk))];
  const fullWeek = weeks.some(w => weekStars(f, cid, w) >= capOf(f));
  const b = [
    ['🌱', 'Bài đầu tiên', ld >= 1], ['🔟', '10 bài học', ld >= 10], ['🎯', 'Nhiệm vụ đầu tiên', ms >= 1], ['🐝', '10 nhiệm vụ', ms >= 10],
    ['🔥', '3 ngày liên tục', st >= 3 || p.streak.count >= 3], ['🏅', '7 ngày liên tục', p.streak.count >= 7], ['🐷', 'Đầy hũ một tuần', fullWeek], ['💯', '100 sao', totalStars(f, cid) >= 100]
  ];
  for (let s = 1; s <= 6; s++) b.push([SEASONS[s].icon, 'Xong ' + SEASONS[s].name, seasonDone(p, s)]);
  return b.map(([i, t, on]) => ({ i, t, on }));
}

/* ---------------- tiện ích giao diện ---------------- */
let toastTimer;
function toast(msg) { UI.toast = msg; render(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { UI.toast = ''; render(); }, 2600); }
function go(view, extra = {}) { Object.assign(UI, { view, err: '', pin: '', sheet: null, confirm: null }, extra); render(); window.scrollTo(0, 0); }
let VOICE = null;
function pickVoice() { try { const vs = speechSynthesis.getVoices(); VOICE = vs.find(v => /vi[-_]VN/i.test(v.lang)) || vs.find(v => /^vi/i.test(v.lang)) || null; } catch (e) { } }
function say(html) {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(stripTags(html).replace(/[−]/g, ' trừ ').replace(/×/g, ' nhân ').replace(/ : /g, ' chia ').replace(/\+/g, ' cộng ').replace(/=/g, ' bằng ').replace(/\?/g, ' mấy ')); u.lang = 'vi-VN'; if (VOICE) u.voice = VOICE; u.rate = .95; speechSynthesis.speak(u); } catch (e) { }
}
let AC;
function beep(kind) {
  try {
    AC ||= new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 'ok' ? [660, 880] : kind === 'win' ? [523, 659, 784, 1046] : [220, 180];
    notes.forEach((fq, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = kind === 'bad' ? 'square' : 'sine'; o.frequency.value = fq; g.gain.setValueAtTime(.0001, AC.currentTime + i * .1); g.gain.exponentialRampToValueAtTime(.12, AC.currentTime + i * .1 + .02); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + i * .1 + .22); o.connect(g).connect(AC.destination); o.start(AC.currentTime + i * .1); o.stop(AC.currentTime + i * .1 + .25); });
  } catch (e) { }
}
const ava = (a, cls = '') => `<span class="ava ${cls}">${esc(a)}</span>`;
const sayBox = (m, html, sp = true) => `<div class="say">${m}<div class="bubble">${html}${sp ? `<button class="spk" data-act="speak" aria-label="Nghe đọc">🔊</button>` : ''}</div></div>`;
const REMIND = 'Ba mẹ ơi, dành 10 phút mỗi ngày đồng hành cùng Su và con nhé';
const remindBox = () => `<div class="remind" role="note">${su('happy', 40)}<p><b>💛 ${REMIND}</b></p></div>`;
const backBtn = (act = 'home', data = '') => `<button class="x" data-act="${act}" ${data} aria-label="Quay lại">←</button>`;

/* ---------------- render gốc ---------------- */
function render() {
  const app = $('#app'); let html = '';
  const v = UI.view;
  const views = { welcome: vWelcome, parentLogin: vParentLogin, forgot: vForgot, register: vRegister, family: vFamilyFind, profiles: vProfiles, pin: vPin, child: vChild, parent: vParent, parentLock: vParentLock, lesson: vLesson, result: vResult, about: vAbout };
  html = (views[v] || vWelcome)();
  app.className = (v === 'child' || v === 'parent') ? '' : 'bare';
  app.innerHTML = html + (UI.sheet ? `<div class="scrim" data-act="closeSheet"><div class="sheet" data-stop="1" role="dialog" aria-modal="true">${UI.sheet()}</div></div>` : '') + (UI.toast ? `<div class="toast" role="status">${esc(UI.toast)}</div>` : '');
  const af = app.querySelector('[autofocus]'); if (af && !('ontouchstart' in window)) af.focus();
  afterRender();
}
function afterRender() {
  const fl = $('.qvis .flash'); if (fl && !fl.dataset.t) { fl.dataset.t = 1; setTimeout(() => { const x = $('.qvis .flash'); if (x) x.classList.add('gone'); }, 1600); }
}

/* ---------------- màn chào ---------------- */
const DISCLAIMER = `<p><b>Học Toán Vui</b> là ứng dụng học toán <b>độc lập, miễn phí, phi thương mại</b>, dùng trong gia đình. Chương trình gồm 6 chặng, 120 bài do Học Toán Vui tự biên soạn dựa trên kiến thức toán phổ thông dành cho trẻ mầm non và tiểu học.</p><p>Ứng dụng <b>không liên kết, không được tài trợ hay bảo trợ</b> bởi bất kỳ chương trình, thương hiệu, nhà xuất bản hay tổ chức giáo dục nào. Nhân vật Su, Bi, Xu là nhân vật riêng của Học Toán Vui.</p>`;
const TERMS = [
  ['📚', 'Nội dung bài học', [
    'Toàn bộ bài giảng, câu hỏi, hình minh họa và nhiệm vụ do Học Toán Vui tự biên soạn từ kiến thức toán phổ thông (đếm, cộng, trừ, nhân, chia, hình học cơ bản). Các con số, phép tính và khái niệm toán học là kiến thức chung, không thuộc sở hữu riêng của ai.',
    'Nội dung chỉ mang tính <b>tham khảo, hỗ trợ ôn luyện tại nhà</b>; không thay thế chương trình chính thức của nhà trường, giáo viên hay chuyên gia giáo dục, và không cam kết bất kỳ kết quả học tập cụ thể nào.',
    'Ứng dụng không liên kết, không được tài trợ hay bảo trợ bởi bất kỳ chương trình, thương hiệu, nhà xuất bản hay tổ chức giáo dục nào. Mọi tên gọi, nhãn hiệu (nếu có nhắc đến) thuộc về chủ sở hữu tương ứng.',
    'Nếu ba mẹ hoặc bất kỳ ai cho rằng một nội dung nào đó trong ứng dụng ảnh hưởng đến quyền của mình, vui lòng liên hệ qua kho mã nguồn của ứng dụng; nội dung đó sẽ được xem xét và gỡ bỏ hoặc chỉnh sửa.'
  ]],
  ['⭐', 'Sao thưởng', [
    'Sao là <b>công cụ khích lệ trong gia đình</b>. Quy đổi "1 sao = 1.000đ" chỉ là gợi ý để ba mẹ tự thỏa thuận với con; ba mẹ hoàn toàn có quyền thưởng bằng hình thức khác hoặc không thưởng tiền.',
    'Học Toán Vui <b>không giữ, không chuyển, không thanh toán</b> bất kỳ khoản tiền nào. Sao không phải tiền điện tử, ví điện tử, điểm thưởng có giá trị quy đổi, giải thưởng hay trò chơi có thưởng, và không thể rút, chuyển nhượng hay đổi lấy tiền từ ứng dụng.',
    'Giới hạn tối đa 50 sao/tuần giúp phần thưởng ở mức hợp lý. Việc trao thưởng thực tế hoàn toàn do ba mẹ quyết định và tự chịu trách nhiệm.'
  ]],
  ['☕', 'Ủng hộ (donate)', [
    'Ủng hộ là <b>hoàn toàn tự nguyện</b>, mang tính chất quà tặng cá nhân để tác giả duy trì ứng dụng. Đây <b>không phải</b> khoản thanh toán mua hàng, phí dịch vụ, phí thành viên hay khoản đầu tư.',
    'Ứng dụng luôn miễn phí đầy đủ tính năng dù ba mẹ có ủng hộ hay không. Người ủng hộ <b>không nhận được</b> và không phát sinh bất kỳ quyền lợi, ưu đãi, cam kết hỗ trợ, quyền sở hữu hay nghĩa vụ nào giữa hai bên.',
    'Khoản ủng hộ không được hoàn lại. Ba mẹ vui lòng kiểm tra kỹ tên chủ tài khoản và số tài khoản trước khi chuyển, chỉ ủng hộ trong khả năng của mình và tự chịu trách nhiệm về giao dịch.',
    'Ứng dụng không bao giờ yêu cầu chuyển tiền để mở bài học hay tính năng. Nếu thấy yêu cầu như vậy, đó không phải từ Học Toán Vui.'
  ]],
  ['🔒', 'Dữ liệu và quyền riêng tư', [
    'Tài khoản, tiến độ và sao chỉ lưu <b>trong trình duyệt trên máy của gia đình</b>. Ứng dụng không có máy chủ, không thu thập, không gửi và không bán dữ liệu của ba mẹ hay của con.',
    'Mật khẩu và mã PIN được mã hóa một chiều trước khi lưu. Tuy vậy đây là ứng dụng dùng trong gia đình, không phải hệ thống bảo mật chuyên dụng; ba mẹ không nên nhập thông tin nhạy cảm.',
    'Dữ liệu có thể mất khi xóa dữ liệu trình duyệt hoặc đổi máy. Ba mẹ tự chịu trách nhiệm sao lưu bằng chức năng "Tải file sao lưu".'
  ]],
  ['👨‍👩‍👧', 'Trẻ em sử dụng', [
    'Tài khoản gia đình do ba mẹ (người giám hộ) tạo và quản lý. Trẻ nên sử dụng ứng dụng dưới sự đồng hành, giám sát của ba mẹ, với thời lượng phù hợp lứa tuổi.'
  ]],
  ['⚖️', 'Miễn trừ trách nhiệm', [
    'Ứng dụng được cung cấp <b>"nguyên trạng"</b>, không kèm bất kỳ bảo đảm nào về tính chính xác tuyệt đối, tính liên tục hay sự phù hợp cho một mục đích cụ thể.',
    'Trong phạm vi pháp luật cho phép, tác giả không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp hay gián tiếp nào phát sinh từ việc sử dụng ứng dụng, từ việc mất dữ liệu, hay từ các thỏa thuận thưởng giữa ba mẹ và con.',
    'Điều khoản có thể được cập nhật khi ứng dụng thay đổi. Việc tiếp tục sử dụng đồng nghĩa với việc ba mẹ chấp nhận điều khoản mới nhất.'
  ]]
];
const termsHtml = () => DISCLAIMER + TERMS.map(([i, t, ps]) => `<h3 class="h3" style="margin-top:14px">${i} ${t}</h3><ul class="terms">${ps.map(x => `<li>${x}</li>`).join('')}</ul>`).join('');
const termsLink = (txt = 'Điều khoản & lưu ý') => `<button type="button" class="link tiny" data-act="terms">${txt}</button>`;
function vWelcome() {
  const f = fam(); const hasReal = Object.values(STORE.families).some(x => !x.demo);
  return `<div class="hero">
    <div class="cast">${bi('happy', 66, 'bob2')}${su('cheer', 130, 'bob')}${xu('happy', 66, 'bob2')}</div>
    <div class="brand">Học Toán <b>Vui</b></div>
    <span class="pill jade">Miễn phí 100% · không quảng cáo</span>
    <p class="muted lead">Toán tư duy cho bé qua 6 chặng, 120 bài từ số 1 đến phép nhân. Mỗi ngày một bài, làm nhiệm vụ, nhận sao thưởng.</p>
  </div>
  ${remindBox()}
  ${sayBox(su('happy', 56), 'Chào con! Tớ là <b>khủng long Su</b>, tớ dạy toán. Bạn ong <b>Bi</b> giữ nhiệm vụ, còn heo đất <b>Xu</b> giữ hũ sao của con.')}
  <div class="stack">
    <button class="choice" data-act="toChild"><span class="ic" style="background:var(--gold-soft)">🎒</span><span><b>Con vào học</b><span class="muted tiny">${f ? 'Gia đình: ' + esc(f.parentName) : 'Chọn hồ sơ và nhập mã PIN 4 số'}</span></span></button>
    <button class="choice" data-act="go" data-v="parentLogin"><span class="ic" style="background:var(--jade-soft)">👨‍👩‍👧</span><span><b>Ba mẹ đăng nhập</b><span class="muted tiny">Theo dõi tiến độ, duyệt nhiệm vụ, trao thưởng</span></span></button>
    <button class="choice" data-act="startReg"><span class="ic" style="background:var(--pink-soft)">✨</span><span><b>Tạo tài khoản gia đình</b><span class="muted tiny">Miễn phí · nhiều con, mỗi con một mã PIN</span></span></button>
  </div>
  ${hasReal ? '' : `<div class="demo">Muốn xem thử? <button class="link" data-act="demo">Mở gia đình mẫu</button> · ba mẹ: <b>demo</b> / <b>123456</b> · Bông: PIN <b>1111</b> · Tí: PIN <b>2222</b></div>`}
  ${restoreBlock()}
  <details class="card disc"><summary>Về Học Toán Vui</summary>${DISCLAIMER}<p>${termsLink('Xem đầy đủ điều khoản & lưu ý →')}</p></details>`;
}
const restoreBlock = () => `<label class="link tiny center" style="display:block">📂 Khôi phục từ file sao lưu<input type="file" accept="application/json,.json" data-act="restore" hidden></label>`;
/* mở điều khoản dạng hộp nổi, không vẽ lại trang để giữ nguyên dữ liệu ba mẹ đang nhập */
function openTerms() {
  document.getElementById('terms-modal')?.remove();
  const m = document.createElement('div'); m.id = 'terms-modal'; m.className = 'scrim'; m.dataset.act = 'termsClose';
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="terms-h"><div class="row between"><h2 class="h2" id="terms-h">Điều khoản & lưu ý</h2><button type="button" class="x" data-act="termsClose" aria-label="Đóng">✕</button></div><div class="disc">${termsHtml()}<p class="tiny muted" style="margin-top:14px">Cập nhật: 11/2026</p></div><button type="button" class="btn block" data-act="termsClose" style="margin-top:14px">Đã hiểu</button></div>`;
  document.body.appendChild(m); m.querySelector('.x').focus();
}
function vAbout() { return `<div class="row">${backBtn('go', 'data-v="welcome"')}<h1 class="h2">Điều khoản & lưu ý</h1></div><section class="card disc">${termsHtml()}<p class="tiny muted" style="margin-top:14px">Cập nhật: 11/2026</p></section>`; }

/* ---------------- đăng nhập / đăng ký ---------------- */
function vParentLogin() {
  const locked = Date.now() < UI.lockUntil;
  return `<div class="row">${backBtn('go', 'data-v="welcome"')}<h1 class="h2">Ba mẹ đăng nhập</h1></div>
  ${sayBox(xu('happy', 56), 'Ba mẹ đăng nhập để xem tiến độ, duyệt nhiệm vụ và trao thưởng cho con nhé.', false)}
  <form class="card stack" data-form="login" autocomplete="on">
    <div class="field"><label for="lu">Số điện thoại / email / tên đăng nhập</label><input id="lu" name="u" required autocomplete="username" autofocus></div>
    <div class="field"><label for="lp">Mật khẩu</label><input id="lp" name="p" type="password" required autocomplete="current-password"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block" ${locked ? 'disabled' : ''}>Đăng nhập</button>
    <div class="row between"><button type="button" class="link" data-act="go" data-v="forgot">Quên mật khẩu?</button><button type="button" class="link" data-act="startReg">Tạo tài khoản</button></div>
  </form>
  ${restoreBlock()}
  ${donateBlock()}`;
}
function vForgot() {
  return `<div class="row">${backBtn('go', 'data-v="parentLogin"')}<h1 class="h2">Đặt lại mật khẩu</h1></div>
  <form class="card stack" data-form="forgot">
    <p class="muted tiny">Nhập tên đăng nhập và <b>mã PIN ba mẹ</b> (4 số) đã tạo khi đăng ký để đặt mật khẩu mới.</p>
    <div class="field"><label>Tên đăng nhập</label><input name="u" required autofocus></div>
    <div class="field"><label>Mã PIN ba mẹ</label><input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></div>
    <div class="field"><label>Mật khẩu mới (ít nhất 6 ký tự)</label><input name="p" type="password" minlength="6" required autocomplete="new-password"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block" ${Date.now() < UI.lockUntil ? 'disabled' : ''}>Đặt mật khẩu mới</button>
  </form>`;
}
function avatarPicker(name, cur) { return `<div class="avpick">${AVATARS.map(a => `<label><input type="radio" name="${name}" value="${a}" ${a === cur ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div>`; }
function vRegister() {
  return `<div class="row">${backBtn('go', 'data-v="welcome"')}<h1 class="h2">Tạo tài khoản gia đình</h1></div>
  ${sayBox(su('happy', 56), 'Chỉ mất 1 phút thôi! Ba mẹ tạo tài khoản, rồi thêm hồ sơ cho con kèm mã PIN 4 số để con tự đăng nhập.', false)}
  <form class="card stack" data-form="register" autocomplete="on">
    <h2 class="h3">1 · Thông tin ba mẹ</h2>
    <div class="field"><label>Tên ba/mẹ</label><input name="pn" required maxlength="40" placeholder="VD: Mẹ Lan" autofocus></div>
    <div class="field"><label>Số điện thoại / email (dùng để đăng nhập)</label><input name="u" required maxlength="60" autocomplete="username"></div>
    <div class="field"><label>Mật khẩu (ít nhất 6 ký tự)</label><input name="p" type="password" minlength="6" required autocomplete="new-password"></div>
    <div class="field"><label>Mã PIN ba mẹ (4 số, dùng mở khóa khu vực ba mẹ)</label><input name="ppin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></div>
    <h2 class="h3">2 · Hồ sơ của con</h2>
    <div class="field"><label>Tên con</label><input name="cn" required maxlength="24" placeholder="VD: Bông"></div>
    <div class="field"><label>Chọn hình đại diện</label>${avatarPicker('ca', '🦊')}</div>
    <div class="field"><label>Mã PIN của con (4 số)</label><input name="cpin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></div>
    <label class="toggle tiny"><input type="checkbox" name="agree" required><span>Tôi là ba mẹ/người giám hộ của con, đã đọc và đồng ý ${termsLink('Điều khoản & lưu ý')} (nội dung học, sao thưởng, ủng hộ, dữ liệu).</span></label>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block">Tạo tài khoản</button>
    <p class="tiny muted">Dữ liệu chỉ lưu trên máy này. Ba mẹ nên tải file sao lưu định kỳ trong mục Tài khoản.</p>
  </form>`;
}
function vFamilyFind() {
  const fams = Object.values(STORE.families);
  return `<div class="row">${backBtn('go', 'data-v="welcome"')}<h1 class="h2">Tìm gia đình</h1></div>
  ${sayBox(su('think', 56), fams.length ? 'Con thuộc gia đình nào? Chọn bên dưới nhé.' : 'Máy này chưa có gia đình nào. Nhờ ba mẹ tạo tài khoản trước nhé!', false)}
  <div class="stack">${fams.map(f => `<button class="choice" data-act="pickFam" data-fid="${f.id}"><span class="ic" style="background:var(--gold-soft)">🏠</span><span><b>Gia đình ${esc(f.parentName)}</b><span class="muted tiny">${f.children.map(c => esc(c.avatar + ' ' + c.name)).join(' · ')}</span></span></button>`).join('')}</div>
  ${fams.length ? '' : `<button class="btn block" data-act="startReg">Tạo tài khoản gia đình</button>`}`;
}
function vProfiles() {
  const f = fam(); if (!f) return vFamilyFind();
  return `<div class="row">${backBtn('go', 'data-v="welcome"')}<h1 class="h2">Ai đang học?</h1></div>
  ${sayBox(su('happy', 56), 'Chọn hình của con rồi nhập mã PIN nhé!', false)}
  <div class="profiles">${f.children.map(c => `<button class="prof" data-act="pickChild" data-cid="${c.id}">${ava(c.avatar, 'lg')}<b>${esc(c.name)}</b></button>`).join('')}</div>
  ${Object.keys(STORE.families).length > 1 ? '<button class="link center" data-act="go" data-v="family">Đổi gia đình khác</button>' : ''}`;
}
function vPin() {
  const f = fam(), c = childOf(f, UI.pinFor); if (!c) return vProfiles();
  const dots = [0, 1, 2, 3].map(i => `<i class="${i < UI.pin.length ? 'on' : ''}"></i>`).join('');
  return `<div class="row">${backBtn('go', 'data-v="profiles"')}</div>
  <div class="pinhead">${ava(c.avatar, 'lg')}<h1 class="h2">Chào ${esc(c.name)}!</h1><p class="muted">Nhập mã PIN 4 số của con</p></div>
  <div class="pindots ${UI.err ? 'shake' : ''}" aria-live="polite">${dots}</div>
  ${UI.err ? `<p class="err center">${esc(UI.err)}</p>` : ''}
  <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : `<button data-act="key" data-k="${k}" aria-label="${k === '⌫' ? 'Xóa' : k}">${k}</button>`).join('')}</div>`;
}

/* ---------------- khu vực của con ---------------- */
function vChild() {
  const f = fam(), c = curChild(); if (!f || !c) return vProfiles();
  const p = prog(f, c.id), ws = weekStars(f, c.id);
  const s = UI.season || p.lastSeason || 1;
  const top = `<div class="topbar">${ava(c.avatar, 'sm')}<div class="who"><b>${esc(c.name)}</b><span class="tiny muted">Chặng ${s} · ${SEASONS[s].name}</span></div>
    <span class="statpill" title="Chuỗi ngày học">🔥 ${streakNow(p)}</span><span class="statpill" title="Sao tuần này">⭐ ${ws}/${capOf(f)}</span></div>`;
  let body = '';
  if (UI.tab === 'learn') body = vLearn(f, c, p, s);
  else if (UI.tab === 'missions') body = vMissions(f, c, p);
  else if (UI.tab === 'rewards') body = vRewards(f, c, p);
  else body = vMe(f, c, p);
  const pending = Object.values(p.missions).filter(m => m.status === 'pending').length;
  const tabs = [['learn', '🗺️', 'Học'], ['missions', '🐝', 'Nhiệm vụ'], ['rewards', '🐷', 'Hũ sao'], ['me', esc(c.avatar), 'Của con']];
  return top + body + `<nav class="tabbar" aria-label="Điều hướng"><div class="in">${tabs.map(([k, i, t]) => `<button class="tab ${UI.tab === k ? 'on' : ''}" data-act="tab" data-t="${k}" ${UI.tab === k ? 'aria-current="page"' : ''}><span class="i">${i}</span>${t}${k === 'missions' && pending ? ` <span class="badge-n">${pending}</span>` : ''}</button>`).join('')}</div></nav>`;
}
function vLearn(f, c, p, s) {
  const S = SEASONS[s], states = nodeStates(f, c.id, s), done = states.filter(x => x.done).length, cur = states.find(x => x.current);
  const sOpen = seasonOpen(f, p, s);
  const xs = [0, 52, 78, 52, 0, -52, -78, -52];
  const today = p.log.filter(l => dayKey(new Date(l.ts)) === dayKey()).length;
  let path = '';
  states.forEach((n, i) => {
    const x = xs[i % xs.length];
    const cls = ['node', n.type === 'challenge' ? 'chal' : '', !n.open ? 'locked' : '', n.current ? 'current' : '', n.done ? 'done' : ''].join(' ');
    const ic = !n.open ? '🔒' : n.type === 'lesson' ? n.l.icon : '🏆';
    const lab = n.type === 'lesson' ? `${n.l.e}. ${esc(n.l.vi)}` : `Thử thách ${n.k}`;
    path += `<button class="${cls}" style="--x:${x};--c:${S.c}" data-act="openNode" data-s="${s}" data-i="${i}" aria-label="${lab}${n.open ? '' : ' (đang khóa)'}">
      <span class="disc">${n.current ? '<span class="here">Học tiếp</span>' : ''}<span class="em">${ic}</span></span>
      <span class="lbl">${lab}</span>${n.best ? `<span class="st">${'★'.repeat(n.best)}${'☆'.repeat(3 - n.best)}</span>` : ''}</button>`;
  });
  const hello = !sOpen ? `Chặng ${s} sẽ mở khi con hoàn thành <b>Chặng ${s - 1}</b> nhé!` : cur ? (cur.type === 'lesson' ? `Hôm nay mình học <b>Bài ${cur.l.e}: ${esc(cur.l.vi)}</b> nhé!` : `Đến <b>Thử thách ${cur.k}</b> rồi! Ôn lại 5 bài vừa học.`) : `Con đã xong cả <b>${S.name}</b>! Giỏi quá!`;
  return `<div class="seasonbar" role="tablist">${[1, 2, 3, 4, 5, 6].map(k => `<button class="chip ${k == s ? 'on' : ''}" style="--c:${SEASONS[k].c}" data-act="season" data-s="${k}" role="tab" aria-selected="${k == s}">${seasonOpen(f, p, k) ? '' : '🔒 '}Chặng ${k}</button>`).join('')}</div>
  <section class="world" style="--c:${S.c}"><div><span class="eyebrow">Chặng ${s} · ${BY_SEASON[s].length} bài</span><h2 class="h2">${S.icon} ${S.name}</h2><p class="tiny">${S.sub}</p></div>
    <div class="meter"><i style="width:${Math.round(done / states.length * 100)}%"></i></div><span class="tiny"><b>${done}/${states.length}</b> chặng · hôm nay ${today} bài</span></section>
  ${sayBox(su(sOpen ? 'happy' : 'think', 60, 'bob'), hello)}
  ${remindBox()}
  <div class="path">${path}</div>`;
}
function vMissions(f, c, p) {
  const items = [];
  LESSONS.forEach(l => { const m = p.missions[l.id]; if (m || p.lessons[l.id] > 0) items.push({ l, m }); });
  const pending = items.filter(x => x.m?.status === 'pending'), todo = items.filter(x => !x.m || x.m.status === 'rejected'), done = items.filter(x => x.m?.status === 'approved');
  const today = p.log.filter(l => dayKey(new Date(l.ts)) === dayKey()).length, goal = Math.min(today, 2);
  const card = x => `<div class="mission"><div class="hd"><span class="ic">${x.l.icon}</span><div class="tx"><b>Bài ${x.l.e}: ${esc(x.l.vi)}</b><span class="tiny muted">Chặng ${x.l.s} · ${x.l.code}</span></div>${x.m?.status === 'approved' ? '<span class="pill jade">+2 ⭐</span>' : ''}</div><p>${esc(x.l.mission)}</p>
    ${x.m?.status === 'rejected' ? '<p class="tiny err">Ba mẹ nhắn: con làm lại nhiệm vụ này nhé!</p>' : ''}
    ${!x.m || x.m.status === 'rejected' ? `<div class="row"><button class="btn sm jade" data-act="missionDone" data-id="${x.l.id}">✅ Con đã làm xong</button></div>` : x.m.status === 'pending' ? '<div class="row"><span class="pill gold">⏳ Chờ ba mẹ xác nhận</span></div>' : ''}</div>`;
  return `${sayBox(bi('happy', 62, 'bob'), 'Tớ là ong <b>Bi</b>! Mỗi bài học có một nhiệm vụ làm ở nhà. Làm xong, bấm nút, ba mẹ xác nhận là con được <b>2 sao</b>.')}
  <section class="card stack"><div class="row between"><h2 class="h3">Mục tiêu hôm nay</h2><span class="pill ${goal >= 2 ? 'jade' : ''}">${goal}/2 bài</span></div>
    <div class="meter"><i style="width:${goal * 50}%;background:var(--jade)"></i></div>
    <p class="tiny muted">${goal >= 2 ? 'Tuyệt vời! Con đã hoàn thành mục tiêu hôm nay.' : 'Học 2 bài mỗi ngày để giữ chuỗi 🔥 nhé.'}</p></section>
  ${pending.length ? `<h2 class="h3">Đang chờ ba mẹ (${pending.length})</h2>${pending.map(card).join('')}` : ''}
  <h2 class="h3">Nhiệm vụ cần làm (${todo.length})</h2>
  ${todo.length ? todo.slice().reverse().map(card).join('') : '<div class="card muted">Học xong một bài là có nhiệm vụ mới ở đây.</div>'}
  ${done.length ? `<details class="card"><summary><b>Đã hoàn thành (${done.length})</b></summary><div class="stack" style="margin-top:10px">${done.slice().reverse().map(card).join('')}</div></details>` : ''}`;
}
function vRewards(f, c, p) {
  const ws = weekStars(f, c.id), cp = capOf(f), up = unpaid(f, c.id), pct = Math.round(ws / cp * 100);
  const recent = p.ledger.slice(-10).reverse();
  return `${sayBox(xu('happy', 62, 'bob'), `Tớ là heo đất <b>Xu</b>, giữ hũ sao cho con. Mỗi sao = <b>1.000đ</b>, tối đa <b>${cp} sao</b> mỗi tuần.`)}
  <section class="card jar"><div class="ring" style="--p:${pct}"><div><b>${ws}</b><span class="tiny muted">/ ${cp} sao</span></div></div>
    <div class="stack" style="gap:4px;min-width:0"><span class="eyebrow">Tuần này</span><span class="money">${vnd(ws * STAR)}</span>
    <span class="tiny muted">${ws >= cp ? 'Con đã đầy hũ tuần này! Cứ học tiếp, sao luyện tập vẫn được ghi lại.' : `Còn ${cp - ws} sao nữa là đầy hũ tuần này.`}</span></div></section>
  <section class="card row between"><div><div class="eyebrow">Ba mẹ sẽ trao cho con</div><div class="money">${vnd(up * STAR)}</div></div><span style="font-size:40px">🎁</span></section>
  <p class="tiny muted">Sao là cách ba mẹ khích lệ con trong gia đình. Ứng dụng không giữ hay chuyển tiền; việc trao thưởng do ba mẹ quyết định.</p>
  <h2 class="h3">Cách nhận sao</h2>
  <section class="card howto"><div><b>⭐ 1–3</b> Mỗi bài học, tùy số câu đúng</div><div><b>⭐ 1–3</b> Mỗi thử thách sau 5 bài</div><div><b>⭐ 2</b> Mỗi nhiệm vụ ở nhà ba mẹ xác nhận</div><div><b>⭐ +</b> Ba mẹ thưởng thêm khi con cố gắng</div><p class="tiny muted">Học lại bài cũ chỉ được thêm sao khi con làm tốt hơn lần trước.</p></section>
  <h2 class="h3">Huy hiệu</h2>
  <div class="badges">${badgesOf(f, c.id).map(b => `<div class="badge ${b.on ? '' : 'off'}"><span class="b">${b.i}</span>${esc(b.t)}</div>`).join('')}</div>
  <h2 class="h3">Sao gần đây</h2>
  <section class="card ledger">${recent.length ? recent.map(e => `<div class="li"><span>⭐</span><span class="tx">${esc(e.reason)}<small>${new Date(e.ts).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}${e.counted < e.n ? ` · ${e.n - e.counted} sao vượt mức tuần, không tính tiền` : ''}</small></span><span class="n">+${e.counted}</span></div>`).join('') : '<p class="muted">Chưa có sao nào. Học bài đầu tiên để nhận sao nhé!</p>'}</section>`;
}
function vMe(f, c, p) {
  return `<section class="card mecard">${ava(c.avatar, 'lg')}<div><h2 class="h2">${esc(c.name)}</h2><p class="tiny muted">Gia đình ${esc(f.parentName)}</p></div></section>
  <div class="stats"><div class="card"><b>${lessonsDone(p)}</b><span>bài đã học</span></div><div class="card"><b>${totalStars(f, c.id)}</b><span>sao tích lũy</span></div><div class="card"><b>${p.streak.count || 0}</b><span>ngày liên tục</span></div></div>
  <section class="card stack"><h2 class="h3">Cài đặt</h2>
    <label class="toggle"><input type="checkbox" data-act="toggleSpeak" ${p.speak !== false ? 'checked' : ''}><span>🔊 Su tự đọc to lời giảng</span></label>
    ${VOICE ? '' : '<p class="tiny muted">Máy chưa có giọng đọc tiếng Việt. Ba mẹ có thể cài thêm trong Cài đặt → Trợ năng → Chuyển văn bản thành giọng nói.</p>'}
  </section>
  <div class="stack"><button class="choice" data-act="switchUser"><span class="ic" style="background:var(--gold-soft)">🔁</span><span><b>Đổi người học</b><span class="muted tiny">Quay về màn chọn hồ sơ</span></span></button>
  <button class="choice" data-act="toParent"><span class="ic" style="background:var(--jade-soft)">👨‍👩‍👧</span><span><b>Khu vực ba mẹ</b><span class="muted tiny">Cần mật khẩu hoặc PIN ba mẹ</span></span></button></div>`;
}

/* ---------------- sheet chi tiết bài ---------------- */
function lessonSheet(s, i) {
  const f = fam(), c = curChild(); const n = nodeStates(f, c.id, s)[i];
  if (n.type === 'challenge') return `<div class="stack"><div class="row">${su('cheer', 64)}<div><span class="eyebrow">Chặng ${s} · Thử thách ${n.k}</span><h2 class="h2">Ôn tập 5 bài</h2></div></div>
    <ul class="mini">${n.grp.map(l => `<li>${l.icon} ${l.e}. ${esc(l.vi)}</li>`).join('')}</ul>
    <p class="muted tiny">10 câu hỏi trộn từ 5 bài vừa học. Đúng nhiều được tới 3 sao!</p>
    ${n.best ? `<p class="tiny">Kết quả tốt nhất: <b>${'★'.repeat(n.best)}</b></p>` : ''}
    <button class="btn block" data-act="startNode" data-s="${s}" data-i="${i}">🏆 Bắt đầu thử thách</button></div>`;
  const l = n.l;
  return `<div class="stack"><div class="row"><span class="bigic">${l.icon}</span><div style="min-width:0"><span class="eyebrow">Chặng ${l.s} · Bài ${l.e} · ${l.code}</span><h2 class="h2">${esc(l.vi)}</h2></div></div>
    <div class="goal">🎯 ${esc(l.goal)}</div>
    ${remindBox()}
    ${n.best ? `<p class="tiny">Kết quả tốt nhất: <b>${'★'.repeat(n.best)}${'☆'.repeat(3 - n.best)}</b></p>` : ''}
    <button class="btn block" data-act="startNode" data-s="${s}" data-i="${i}">📚 ${n.done ? 'Học lại' : 'Bắt đầu học'}</button></div>`;
}

/* ---------------- màn học ---------------- */
function startNode(s, i) {
  const f = fam(), c = curChild(); const n = nodeStates(f, c.id, s)[i]; if (!n.open) return;
  if (n.type === 'lesson') UI.les = { kind: 'lesson', l: n.l, key: n.key, phase: 'learn', slide: 0, qs: buildQuiz(n.l.quiz, 8), qi: 0, correct: 0, picked: null, build: 0, s };
  else UI.les = { kind: 'challenge', key: n.key, k: n.k, phase: 'quiz', qs: buildQuiz(n.grp.flatMap(l => l.quiz), 10), qi: 0, correct: 0, picked: null, build: 0, s };
  go('lesson'); autoSpeak();
}
function autoSpeak() { const f = fam(), c = curChild(); if (!f || !c || prog(f, c.id).speak === false) return; const L = UI.les; if (!L) return; if (L.phase === 'learn') say(L.l.learn[L.slide][0]); else if (L.qs[L.qi]) say(L.qs[L.qi].q); }
function vLesson() {
  const L = UI.les; if (!L) return vChild();
  const head = (pct, title) => `<div class="lhead"><button class="x" data-act="quitLesson" aria-label="Thoát bài">✕</button><div class="meter grow"><i style="width:${pct}%"></i></div><span class="tiny muted">${title}</span></div>`;
  if (L.phase === 'learn') {
    const l = L.l, sl = l.learn[L.slide], last = L.slide === l.learn.length - 1;
    return head(Math.round((L.slide + 1) / (l.learn.length + 1) * 30), 'Học') + `
    <div class="ltitle"><span class="eyebrow">Chặng ${l.s} · Bài ${l.e}</span><h1 class="h2">${l.icon} ${esc(l.vi)}</h1></div>
    ${sayBox(su(last ? 'cheer' : 'happy', 64, 'bob'), sl[0])}
    <section class="card visbox" style="--accent:${SEASONS[l.s].c}">${vis(sl[1])}</section>
    <div class="dots">${l.learn.map((_, i) => `<i class="${i === L.slide ? 'on' : ''}"></i>`).join('')}</div>
    <div class="row">${L.slide > 0 ? '<button class="btn ghost" data-act="slide" data-d="-1">←</button>' : ''}<button class="btn block grow" data-act="slide" data-d="1">${last ? 'Luyện tập thôi! 💪' : 'Tiếp tục →'}</button></div>
    ${L.slide === 0 ? remindBox() : ''}`;
  }
  const q = L.qs[L.qi], n = L.qs.length, answered = L.picked !== null;
  const ok = answered && L.picked === q.ans;
  const accent = SEASONS[L.s].c;
  let body;
  if (q.kind === 'build') {
    body = `<section class="card visbox" style="--accent:${accent}"><div class="tray">${L.build ? `<div class="cubes">${blocksRaw(L.build, CUBE_A)}</div>` : '<span class="muted">Bấm ➕ để thêm khối</span>'}</div><div class="bigtxt">${L.build}</div></section>
    <div class="row center"><button class="btn round ghost" data-act="bld" data-d="-1" ${answered ? 'disabled' : ''} aria-label="Bớt một khối">➖</button><button class="btn round ghost" data-act="bld" data-d="1" ${answered ? 'disabled' : ''} aria-label="Thêm một khối">➕</button></div>
    ${answered ? '' : '<button class="btn block" data-act="bldCheck">Kiểm tra</button>'}`;
  } else {
    body = `${q.vis ? `<section class="card visbox qvis" style="--accent:${accent}">${q.vis}${q.flash ? '<button class="link tiny" data-act="reflash">👀 Xem lại</button>' : ''}</section>` : ''}
    <div class="opts ${q.wide || q.opts.length === 2 ? 'wide' : ''}">${q.opts.map(o => {
      const st = !answered ? '' : String(o.v) === String(q.ans) ? 'right' : String(o.v) === String(L.picked) ? 'wrong' : 'dim';
      return `<button class="opt ${st}" data-act="answer" data-v="${esc(o.v)}" ${answered ? 'disabled' : ''}>${o.h}</button>`;
    }).join('')}</div>`;
  }
  const fb = answered ? `<div class="feedback ${ok ? 'ok' : 'no'}" role="status"><div class="row">${ok ? su('cheer', 54) : su('oops', 54)}<div style="min-width:0"><b>${ok ? pickOne(['Đúng rồi! Giỏi quá!', 'Chính xác! 🎉', 'Tuyệt vời!', 'Con làm tốt lắm!']) : 'Chưa đúng rồi, không sao cả!'}</b><p class="tiny">${q.ex}</p></div></div><button class="btn block ${ok ? 'jade' : ''}" data-act="nextQ" autofocus>${L.qi === n - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div>` : '';
  return head(30 + Math.round(L.qi / n * 70), `${L.qi + 1}/${n}`) + `
    ${L.kind === 'challenge' ? `<div class="ltitle"><span class="eyebrow">Chặng ${L.s} · Thử thách ${L.k}</span></div>` : ''}
    <div class="qline">${su('think', 44)}<h2 class="qtext">${q.q}</h2><button class="spk" data-act="speakQ" aria-label="Nghe đọc câu hỏi">🔊</button></div>
    ${body}${fb}`;
}
function answer(v) {
  const L = UI.les, q = L.qs[L.qi]; if (L.picked !== null) return;
  L.picked = typeof q.ans === 'number' ? Number(v) : v;
  const ok = String(L.picked) === String(q.ans);
  if (ok) L.correct++; beep(ok ? 'ok' : 'bad');
  render();
  const f = fam(), c = curChild(); if (f && c && prog(f, c.id).speak !== false) say(ok ? 'Đúng rồi!' : 'Chưa đúng. ' + q.ex);
}
function nextQ() {
  const L = UI.les; if (L.qi < L.qs.length - 1) { L.qi++; L.picked = null; L.build = 0; render(); window.scrollTo(0, 0); autoSpeak(); } else finishLesson();
}
function finishLesson() {
  const L = UI.les, f = fam(), c = curChild(), p = prog(f, c.id);
  const n = L.qs.length, ratio = L.correct / n;
  const stars = ratio >= .85 ? 3 : ratio >= .6 ? 2 : ratio >= .35 ? 1 : 0;
  const book = L.kind === 'lesson' ? p.lessons : p.challenges;
  const prev = book[L.key] || 0;
  let res = { n: 0, counted: 0, over: 0 };
  if (stars > prev) {
    book[L.key] = stars;
    const reason = L.kind === 'lesson' ? `Bài ${L.l.code}: ${L.l.vi}` : `Thử thách ${L.k} · Chặng ${L.s}`;
    res = award(f, c.id, stars - prev, reason);
  }
  p.log.push({ ts: Date.now(), key: L.key, score: L.correct, total: n, stars });
  if (p.log.length > 400) p.log = p.log.slice(-400);
  if (stars > 0) bumpStreak(p);
  p.lastSeason = L.s;
  save();
  UI.result = { stars, prev, correct: L.correct, n, res, kind: L.kind, l: L.l, k: L.k, s: L.s };
  beep(stars ? 'win' : 'bad');
  go('result');
  if (p.speak !== false) say(stars ? `Con được ${stars} sao!` : 'Mình thử lại nhé!');
}
function vResult() {
  const R = UI.result; if (!R) return vChild();
  const f = fam(), c = curChild();
  const msg = R.stars === 3 ? 'Xuất sắc! Con là nhà toán học nhí!' : R.stars === 2 ? 'Giỏi lắm! Thêm chút nữa là 3 sao!' : R.stars === 1 ? 'Con đã hoàn thành! Học lại để được nhiều sao hơn nhé.' : 'Chưa sao cả, mình cùng học lại nhé!';
  const conf = R.stars ? `<div class="confetti" aria-hidden="true">${[...Array(18)].map((_, i) => `<i style="--l:${(i * 53) % 100}%;--d:${(i % 6) * .15}s;--r:${(i * 37) % 360}deg">${['⭐', '🎉', '✨', '🌟'][i % 4]}</i>`).join('')}</div>` : '';
  const earned = R.res.counted, over = R.res.over;
  return `${conf}<div class="result">
    <div class="cast">${su(R.stars ? 'cheer' : 'oops', 120, 'bob')}</div>
    <div class="bigstars">${[1, 2, 3].map(i => `<span class="${i <= R.stars ? 'on' : ''}" style="--d:${i * .18}s">★</span>`).join('')}</div>
    <h1 class="h2 center">${msg}</h1>
    <p class="center muted">Đúng <b>${R.correct}/${R.n}</b> câu</p>
    <section class="card stack">
      ${earned ? `<div class="row between"><span>Sao mới nhận</span><b class="money">+${earned} ⭐ = ${vnd(earned * STAR)}</b></div>` : R.stars && R.stars <= R.prev ? '<p class="tiny muted">Con đã đạt mức sao này từ trước. Làm tốt hơn để nhận thêm sao nhé!</p>' : ''}
      ${over ? `<p class="tiny muted">${over} sao vượt mức ${capOf(f)} sao/tuần nên không tính tiền, nhưng vẫn được ghi nhận.</p>` : ''}
      <div class="row between"><span>Hũ sao tuần này</span><b>${weekStars(f, c.id)}/${capOf(f)}</b></div>
    </section>
    ${remindBox()}
    ${R.kind === 'lesson' && R.stars ? sayBox(bi('happy', 52), `Nhiệm vụ ở nhà: ${esc(R.l.mission)} <b>(+2 sao)</b>`, false) : ''}
    <div class="stack">
      ${R.stars ? '<button class="btn block" data-act="toMap">Tiếp tục hành trình →</button>' : ''}
      <button class="btn ${R.stars ? 'ghost' : ''} block" data-act="retry">↻ Học lại</button>
      ${R.stars ? '' : '<button class="btn ghost block" data-act="toMap">Về bản đồ</button>'}
    </div></div>`;
}

/* ---------------- khu vực ba mẹ ---------------- */
function parentOK() { return UI.parentAt && Date.now() - UI.lastAct < LOCK_MS; }
function vParentLock() {
  const f = fam();
  return `<div class="row">${backBtn('go', 'data-v="welcome"')}<h1 class="h2">Khu vực ba mẹ</h1></div>
  ${sayBox(xu('think', 56), 'Khu vực ba mẹ đã tự khóa để bảo vệ. Nhập mật khẩu hoặc mã PIN ba mẹ để mở.', false)}
  <form class="card stack" data-form="unlock"><div class="field"><label>Mật khẩu hoặc mã PIN ba mẹ</label><input name="p" type="password" required autofocus autocomplete="current-password"></div>
  ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}<button class="btn block" ${Date.now() < UI.lockUntil ? 'disabled' : ''}>Mở khóa</button>
  <p class="tiny muted center">Gia đình ${esc(f?.parentName || '')} · <button type="button" class="link" data-act="logout">Đăng xuất</button></p></form>`;
}
function vParent() {
  const f = fam(); if (!f) return vWelcome();
  if (!parentOK()) return vParentLock();
  let body = '';
  if (UI.ptab === 'home') body = vPHome(f); else if (UI.ptab === 'approve') body = vPApprove(f); else if (UI.ptab === 'wallet') body = vPWallet(f); else body = vPAccount(f);
  const pend = f.children.reduce((a, c) => a + Object.values(prog(f, c.id).missions).filter(m => m.status === 'pending').length, 0);
  const tabs = [['home', '📊', 'Tổng quan'], ['approve', '✅', 'Duyệt'], ['wallet', '💰', 'Ví thưởng'], ['account', '⚙️', 'Tài khoản']];
  return `<div class="topbar"><span class="ava sm">👨‍👩‍👧</span><div class="who"><b>${esc(f.parentName)}</b><span class="tiny muted">Khu vực ba mẹ</span></div><button class="btn sm gold" data-act="letChild">🎒 Cho con học</button></div>
  ${body}<nav class="tabbar" aria-label="Điều hướng ba mẹ"><div class="in">${tabs.map(([k, i, t]) => `<button class="tab ${UI.ptab === k ? 'on' : ''}" data-act="ptab" data-t="${k}"><span class="i">${i}</span>${t}${k === 'approve' && pend ? ` <span class="badge-n">${pend}</span>` : ''}</button>`).join('')}</div></nav>`;
}
function insightFor(f, c) {
  const p = prog(f, c.id); const weak = LESSONS.filter(l => p.lessons[l.id] === 1).slice(-3);
  const last = p.log.slice(-1)[0]; const days = last ? Math.floor((Date.now() - last.ts) / 864e5) : null;
  const tips = [];
  if (days === null) tips.push('Con chưa học bài nào. Ba mẹ ngồi cùng con học bài đầu tiên với Su nhé.');
  else if (days >= 3) tips.push(`Con đã nghỉ ${days} ngày. Một bài ngắn mỗi ngày giúp con nhớ lâu hơn.`);
  if (weak.length) tips.push(`Nên ôn lại: ${weak.map(l => `${l.code} (${l.vi})`).join(', ')}, hiện mới đạt 1 sao.`);
  const pend = Object.values(p.missions).filter(m => m.status === 'pending').length; if (pend) tips.push(`Có ${pend} nhiệm vụ đang chờ ba mẹ xác nhận.`);
  return tips;
}
function vPHome(f) {
  return `${sayBox(xu('happy', 56), `Chào ${esc(f.parentName)}! Đây là tình hình học của các con tuần này.`, false)}
  ${remindBox()}
  ${f.children.map(c => {
    const p = prog(f, c.id), s = currentSeason(f, c.id), ld = lessonsDone(p), ws = weekStars(f, c.id);
    const recent = p.log.slice(-4).reverse();
    return `<section class="card stack"><div class="row">${ava(c.avatar, 'sm')}<b class="h3 grow">${esc(c.name)}</b><span class="statpill">🔥 ${streakNow(p)}</span></div>
      <div class="kpis"><div><b>${ld}</b><span>/120 bài</span></div><div><b>${ws}</b><span>/${capOf(f)} sao tuần</span></div><div><b>${vnd(unpaid(f, c.id) * STAR)}</b><span>chưa trao</span></div></div>
      <div><span class="tiny muted">Đang học: <b>Chặng ${s} · ${SEASONS[s].name}</b></span><div class="meter"><i style="width:${Math.round(ld / 120 * 100)}%"></i></div></div>
      ${insightFor(f, c).map(t => `<p class="tip">💡 ${esc(t)}</p>`).join('')}
      ${recent.length ? `<div class="ledger">${recent.map(r => { const l = LESSON[r.key]; return `<div class="li"><span>${l ? l.icon : '🏆'}</span><span class="tx">${l ? `${l.code} · ${esc(l.vi)}` : 'Thử thách ' + esc(r.key)}<small>${new Date(r.ts).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })} · đúng ${r.score}/${r.total}</small></span><span class="n">${'★'.repeat(r.stars) || '–'}</span></div>`; }).join('')}</div>` : ''}
    </section>`;
  }).join('')}
  ${spreadBlock()}${donateBlock()}`;
}
function vPApprove(f) {
  const list = [];
  f.children.forEach(c => Object.entries(prog(f, c.id).missions).forEach(([k, m]) => { if (m.status === 'pending' && LESSON[k]) list.push({ c, k, m, l: LESSON[k] }); }));
  list.sort((a, b) => a.m.ts - b.m.ts);
  const opt = UI.bonus || { cid: f.children[0]?.id, n: 2 };
  return `${sayBox(bi('happy', 56), 'Con bấm "đã làm xong" thì nhiệm vụ hiện ở đây. Ba mẹ kiểm tra rồi xác nhận để con nhận <b>2 sao</b>.', false)}
  <h2 class="h3">Chờ xác nhận (${list.length})</h2>
  ${list.length ? list.map(x => `<div class="mission"><div class="hd">${ava(x.c.avatar, 'sm')}<div class="tx"><b>${esc(x.c.name)} · ${x.l.code}: ${esc(x.l.vi)}</b><span class="tiny muted">gửi lúc ${new Date(x.m.ts).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}</span></div></div><p>${esc(x.l.mission)}</p>
    <div class="row wrap"><button class="btn sm jade" data-act="approve" data-cid="${x.c.id}" data-id="${x.k}">Xác nhận +2 ⭐</button><button class="btn sm ghost" data-act="reject" data-cid="${x.c.id}" data-id="${x.k}">Chưa đạt, làm lại</button></div></div>`).join('') : '<div class="card muted">Không có nhiệm vụ nào đang chờ.</div>'}
  <h2 class="h3">Thưởng thêm sao</h2>
  <form class="card stack" data-form="bonus">
    <div class="field"><label>Cho con</label><div class="chips">${f.children.map(c => `<button type="button" class="chip ${opt.cid === c.id ? 'on' : ''}" data-act="bonusSet" data-k="cid" data-val="${c.id}">${esc(c.avatar)} ${esc(c.name)}</button>`).join('')}</div></div>
    <div class="field"><label>Số sao</label><div class="chips">${[1, 2, 3, 5].map(n => `<button type="button" class="chip ${opt.n === n ? 'on' : ''}" data-act="bonusSet" data-k="n" data-val="${n}">${n} ⭐</button>`).join('')}</div></div>
    <div class="field"><label>Lý do</label><input name="reason" maxlength="60" placeholder="VD: Tự giác học bài, giúp mẹ đếm tiền đi chợ" required></div>
    <button class="btn block">Tặng sao</button><p class="tiny muted">Sao thưởng thêm cũng tính vào giới hạn ${capOf(f)} sao/tuần.</p>
  </form>`;
}
function vPWallet(f) {
  const weeks = [...Array(6)].map((_, k) => weekKey(addDays(new Date(), -7 * k)));
  return `${sayBox(xu('happy', 56), `Mỗi sao = <b>1.000đ</b>. Hệ thống tự dừng tính thưởng khi con đạt <b>${capOf(f)} sao/tuần</b> (tối đa 50 sao = 50.000đ). Trao tiền xong, ba mẹ bấm "Đã trao" để ghi sổ.`, false)}
  <p class="note">ℹ️ Quy đổi 1 sao = 1.000đ chỉ là <b>gợi ý</b> để ba mẹ khích lệ con. Học Toán Vui không giữ, không chuyển và không thanh toán tiền; sao không có giá trị quy đổi ngoài gia đình. Ba mẹ có thể thưởng bằng hình thức khác. ${termsLink('Xem điều khoản')}</p>
  ${f.children.map(c => {
    const up = unpaid(f, c.id), conf = UI.confirm === 'pay:' + c.id;
    return `<section class="card stack"><div class="row">${ava(c.avatar, 'sm')}<b class="h3 grow">${esc(c.name)}</b></div>
      <div class="row between"><div><div class="eyebrow">Chưa trao</div><div class="money">${vnd(up * STAR)}</div><span class="tiny muted">${up} sao</span></div>
      ${up ? (conf ? '' : `<button class="btn sm jade" data-act="payAsk" data-cid="${c.id}">Đã trao thưởng</button>`) : '<span class="pill jade">Đã trao đủ</span>'}</div>
      ${conf ? `<div class="demo stack">Xác nhận ba mẹ đã trao <b>${vnd(up * STAR)}</b> cho ${esc(c.name)}?<div class="row"><button class="btn sm jade" data-act="pay" data-cid="${c.id}">Xác nhận</button><button class="btn sm ghost" data-act="cancelConfirm">Hủy</button></div></div>` : ''}
      <div class="tablewrap"><table class="table"><thead><tr><th>Tuần</th><th class="r">Sao</th><th class="r">Tiền thưởng</th></tr></thead><tbody>
      ${weeks.map(w => { const s = weekStars(f, c.id, w), d = new Date(w + 'T00:00'); return `<tr><td>${w === weekKey() ? 'Tuần này' : 'Từ ' + d.getDate() + '/' + (d.getMonth() + 1)}</td><td class="r">${s}/${capOf(f)}</td><td class="r">${vnd(s * STAR)}</td></tr>`; }).join('')}
      </tbody></table></div></section>`;
  }).join('')}
  <h2 class="h3">Lịch sử trao thưởng</h2>
  <section class="card ledger">${(f.payouts || []).length ? f.payouts.slice().reverse().slice(0, 15).map(x => { const c = childOf(f, x.cid); return `<div class="li"><span>🎁</span><span class="tx">${esc(c ? c.name : 'Con')}<small>${new Date(x.ts).toLocaleDateString('vi-VN')} · ${x.stars} sao</small></span><span class="n">${vnd(x.amount)}</span></div>`; }).join('') : '<p class="muted">Chưa có lần trao thưởng nào.</p>'}</section>`;
}
function vPAccount(f) {
  return `<h2 class="h3">Các con</h2>
  <div class="stack">${f.children.map(c => `<button class="choice" data-act="editChild" data-cid="${c.id}">${ava(c.avatar, 'sm')}<span><b>${esc(c.name)}</b><span class="muted tiny">Sửa tên, hình, mã PIN</span></span></button>`).join('')}
  <button class="choice" data-act="editChild" data-cid=""><span class="ic" style="background:var(--jade-soft)">➕</span><span><b>Thêm con</b><span class="muted tiny">Mỗi con một hồ sơ và mã PIN riêng</span></span></button></div>
  <h2 class="h3">Cài đặt học tập</h2>
  <form class="card stack" data-form="settings">
    <div class="field"><label>Giới hạn sao mỗi tuần (tối đa 50 sao = 50.000đ)</label><select name="cap">${[10, 15, 20, 25, 30, 35, 40, 45, 50].map(n => `<option value="${n}" ${capOf(f) === n ? 'selected' : ''}>${n} sao · ${vnd(n * STAR)}</option>`).join('')}</select></div>
    <label class="toggle"><input type="checkbox" name="unlock" ${f.unlockAll ? 'checked' : ''}><span>Mở khóa toàn bộ bài học (con vào bài bất kỳ)</span></label>
    <button class="btn sm block">Lưu cài đặt</button>
  </form>
  <h2 class="h3">Bảo mật</h2>
  <form class="card stack" data-form="changePw">
    <div class="field"><label>Mật khẩu hiện tại</label><input name="old" type="password" required autocomplete="current-password"></div>
    <div class="field"><label>Mật khẩu mới</label><input name="p" type="password" minlength="6" autocomplete="new-password"></div>
    <div class="field"><label>Mã PIN ba mẹ mới (để trống nếu giữ nguyên)</label><input name="ppin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}<button class="btn sm block">Cập nhật</button>
  </form>
  <h2 class="h3">Sao lưu dữ liệu</h2>
  <section class="card stack"><p class="tiny muted">Dữ liệu chỉ nằm trên máy này. Tải file sao lưu để chuyển sang máy khác hoặc phòng khi xóa dữ liệu trình duyệt.</p>
    <button class="btn sm ghost block" data-act="backup">⬇️ Tải file sao lưu</button>
    <label class="btn sm ghost block">📂 Khôi phục từ file<input type="file" accept="application/json,.json" data-act="restore" hidden></label></section>
  <section class="card stack"><button class="btn sm ghost block" data-act="terms">⚖️ Điều khoản & lưu ý</button><button class="btn sm ghost block" data-act="logout">Đăng xuất</button>
  ${UI.confirm === 'delFam' ? `<div class="demo stack">Xóa vĩnh viễn gia đình này và toàn bộ tiến độ trên máy?<div class="row"><button class="btn sm" data-act="delFam">Xóa</button><button class="btn sm ghost" data-act="cancelConfirm">Hủy</button></div></div>` : '<button class="link tiny err" data-act="askDelFam">Xóa tài khoản gia đình trên máy này</button>'}</section>`;
}
function childSheet(cid) {
  const f = fam(), c = childOf(f, cid);
  return `<form class="stack" data-form="child" data-cid="${cid || ''}"><h2 class="h2">${c ? 'Sửa hồ sơ' : 'Thêm con'}</h2>
    <div class="field"><label>Tên con</label><input name="n" required maxlength="24" value="${esc(c?.name || '')}"></div>
    <div class="field"><label>Hình đại diện</label>${avatarPicker('a', c?.avatar || AVATARS[f.children.length % AVATARS.length])}</div>
    <div class="field"><label>${c ? 'Mã PIN mới (để trống nếu giữ nguyên)' : 'Mã PIN 4 số'}</label><input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" ${c ? '' : 'required'}></div>
    <button class="btn block">Lưu</button>
    ${c && f.children.length > 1 ? (UI.confirm === 'delChild' ? `<div class="demo stack">Xóa hồ sơ ${esc(c.name)} và toàn bộ tiến độ?<div class="row"><button type="button" class="btn sm" data-act="delChild" data-cid="${c.id}">Xóa</button><button type="button" class="btn sm ghost" data-act="cancelSheetConfirm">Hủy</button></div></div>` : `<button type="button" class="link tiny err" data-act="askDelChild">Xóa hồ sơ này</button>`) : ''}
  </form>`;
}
const donateAmtText = t => t.amount ? `Mã QR đã có sẵn số tiền <b>${vnd(t.amount)}</b>, ba mẹ chỉ cần xác nhận chuyển.` : 'Ba mẹ tự nhập số tiền tùy tâm sau khi quét mã.';
function donateBlock() {
  return `<section class="card stack" aria-labelledby="donate-h">
    <div class="row">${su('cheer', 52)}<h2 class="h3 grow" id="donate-h">Tiếp lửa để Team Khủng Long Su thêm động lực đồng hành và phát triển cùng con nha ba mẹ ☕</h2></div>
    <div class="chips tiers" role="radiogroup" aria-label="Chọn mức ủng hộ">${DONATE_TIERS.map(t => `<button type="button" class="chip ${t.k === donateTier ? 'on' : ''}" role="radio" aria-checked="${t.k === donateTier}" data-act="donateTier" data-k="${t.k}">${t.label}</button>`).join('')}</div>
    <p class="tiny muted center" id="donate-amt">${donateAmtText(tierOf(donateTier))}</p>
    <img src="${tierOf(donateTier).qr}" alt="Mã VietQR ủng hộ: ${DONATE.name}, ${DONATE.bank}, số tài khoản ${DONATE.acct}" class="qr" id="donate-qr" loading="lazy">
    <button type="button" class="btn sm jade block" data-act="saveQr">⬇️ Tải mã QR về máy</button>
    <p class="tiny muted center" style="margin-top:-6px">Tải ảnh về rồi mở app ngân hàng → Quét QR → chọn ảnh từ thư viện.</p>
    <div class="row between wrap"><div style="min-width:0"><b>${DONATE.name}</b><div class="tiny muted">${DONATE.bank} · <span class="num" style="user-select:all">${DONATE.acct}</span></div></div><button type="button" class="btn sm ghost" data-act="copyAcct">📋 Chép số tài khoản</button></div>
    <p class="tiny muted">Hoặc quét trực tiếp bằng app ngân hàng bất kỳ (VietQR / Napas 247).</p>
    <div class="demo tiny stack" style="gap:6px"><b>Lưu ý khi ủng hộ</b>
      <span>• Hoàn toàn <b>tự nguyện</b>, là quà tặng cá nhân cho tác giả để duy trì ứng dụng; <b>không phải</b> thanh toán mua hàng, phí dịch vụ hay phí thành viên.</span>
      <span>• Ứng dụng <b>luôn miễn phí đầy đủ</b> dù có ủng hộ hay không. Ủng hộ không kèm quyền lợi, ưu đãi hay nghĩa vụ nào giữa hai bên.</span>
      <span>• Khoản ủng hộ <b>không hoàn lại</b>. Vui lòng kiểm tra đúng tên và số tài khoản, chỉ ủng hộ trong khả năng của mình.</span>
      <span>• Học Toán Vui không bao giờ yêu cầu chuyển tiền để mở bài học. ${termsLink('Xem điều khoản')}</span></div>
  </section>`;
}
function spreadBlock() {
  return `<section class="card stack" style="background:var(--gold-soft);border-color:transparent">
    <div class="say">${bi('cheer', 52)}<div class="grow"><b class="h3" style="display:block">Lan tỏa Học Toán Vui nha ba mẹ 💛</b><p class="tiny">Ba mẹ ơi, dành 10 phút mỗi ngày đồng hành cùng Su và con nhé: học một bài, làm một nhiệm vụ.</p></div></div>
    <button type="button" class="btn sm gold" data-act="share">🔗 Chia sẻ cho bạn bè</button></section>`;
}

/* ---------------- gia đình mẫu ---------------- */
async function seedDemo() {
  const id = 'demo';
  const f = { id, demo: true, parentName: 'Ba mẹ mẫu', user: 'demo', pw: await hashPw('123456'), ppin: await hashPw('pin:0000'), weeklyCap: 50, unlockAll: false, payouts: [], created: Date.now(), progress: {},
    children: [{ id: 'c1', name: 'Bông', avatar: '🐰', pin: await hashPw('pin:1111') }, { id: 'c2', name: 'Tí', avatar: '🦖', pin: await hashPw('pin:2222') }] };
  STORE.families[id] = f;
  const p2 = prog(f, 'c2');
  BY_SEASON[1].forEach((l, i) => { p2.lessons[l.id] = [3, 2, 3, 3, 1][i % 5]; });
  p2.challenges.s1c1 = 3; p2.challenges.s1c2 = 2; p2.challenges.s1c3 = 3; p2.challenges.s1c4 = 3;
  BY_SEASON[2].slice(0, 3).forEach(l => { p2.lessons[l.id] = 2; });
  const wk = weekKey(), lwk = weekKey(addDays(new Date(), -7));
  p2.ledger.push({ id: uid(), ts: Date.now() - 864e5 * 8, wk: lwk, n: 30, counted: 30, reason: 'Các bài Chặng 1', paid: true });
  p2.ledger.push({ id: uid(), ts: Date.now() - 864e5, wk, n: 6, counted: 6, reason: 'Bài C2·B01–C2·B03', paid: false });
  p2.missions.s2e1 = { status: 'pending', ts: Date.now() - 36e5 }; p2.missions.s1e20 = { status: 'approved', ts: Date.now() - 864e5 * 2 };
  p2.log.push({ ts: Date.now() - 864e5, key: 's2e3', score: 6, total: 8, stars: 2 });
  p2.streak = { last: dayKey(addDays(new Date(), -1)), count: 4 }; p2.lastSeason = 2;
  f.payouts.push({ ts: Date.now() - 864e5 * 3, cid: 'c2', amount: 30000, stars: 30 });
  STORE.dev.familyId = id; save();
}

/* ---------------- xử lý sự kiện ---------------- */
const findFamily = u => Object.values(STORE.families).find(f => f.user === u.trim().toLowerCase());
function touch() { UI.lastAct = Date.now(); }
document.addEventListener('click', async e => {
  touch();
  const t = e.target.closest('[data-act]');
  if (e.target.closest('[data-stop]') && !(t && t.closest('[data-stop]'))) return;
  if (!t) return;
  const a = t.dataset.act, d = t.dataset;
  if (t.tagName === 'INPUT' && (t.type === 'file' || t.type === 'checkbox')) return;
  if (a === 'closeSheet') { if (e.target === t) { UI.sheet = null; UI.confirm = null; render(); } return; }
  const f = fam();
  switch (a) {
    case 'go': go(d.v); break;
    case 'home': go('welcome'); break;
    case 'terms': openTerms(); break;
    case 'termsClose': { const m = document.getElementById('terms-modal'); if (m && (e.target === t || t.tagName === 'BUTTON')) m.remove(); break; }
    case 'speak': { const b = t.closest('.bubble'); if (b) say(b.innerHTML.replace(/<button[\s\S]*?<\/button>/g, '')); break; }
    case 'speakQ': say(UI.les.qs[UI.les.qi].q); break;
    case 'startReg': UI.err = ''; go('register'); break;
    case 'toChild': if (f) go('profiles'); else go('family'); break;
    case 'pickFam': STORE.dev.familyId = d.fid; save(); go('profiles'); break;
    case 'pickChild': go('pin', { pinFor: d.cid }); break;
    case 'key': {
      if (d.k === '⌫') UI.pin = UI.pin.slice(0, -1); else if (UI.pin.length < 4) UI.pin += d.k;
      UI.err = ''; render();
      if (UI.pin.length === 4) {
        const c = childOf(f, UI.pinFor); const h = await hashPw('pin:' + UI.pin);
        if (c && h === c.pin) { UI.cid = c.id; UI.tab = 'learn'; UI.season = prog(f, c.id).lastSeason || currentSeason(f, c.id); go('child'); say(`Chào ${c.name}!`); }
        else { UI.pin = ''; UI.err = 'Mã PIN chưa đúng, con thử lại nhé!'; render(); }
      }
      break;
    }
    case 'demo': await seedDemo(); toast('Đã mở gia đình mẫu!'); go('profiles'); break;
    case 'tab': UI.tab = d.t; render(); window.scrollTo(0, 0); break;
    case 'season': UI.season = +d.s; render(); break;
    case 'openNode': {
      const s = +d.s, i = +d.i; const n = nodeStates(f, UI.cid, s)[i];
      if (!n.open) { toast(seasonOpen(f, prog(f, UI.cid), s) ? 'Con học xong bài trước để mở bài này nhé!' : `Hoàn thành Chặng ${s - 1} để mở Chặng ${s} nhé!`); break; }
      UI.sheet = () => lessonSheet(s, i); render(); break;
    }
    case 'startNode': UI.sheet = null; startNode(+d.s, +d.i); break;
    case 'slide': { const L = UI.les, nx = L.slide + +d.d; if (nx >= L.l.learn.length) { L.phase = 'quiz'; } else L.slide = Math.max(0, nx); render(); window.scrollTo(0, 0); autoSpeak(); break; }
    case 'answer': answer(d.v); break;
    case 'nextQ': nextQ(); break;
    case 'reflash': { const x = $('.qvis .flash'); if (x) { x.classList.remove('gone'); setTimeout(() => x.classList.add('gone'), 1600); } break; }
    case 'bld': { const L = UI.les, q = L.qs[L.qi]; L.build = Math.max(0, Math.min(q.max || 10, L.build + +d.d)); render(); break; }
    case 'bldCheck': answer(UI.les.build); break;
    case 'quitLesson': UI.les = null; go('child'); break;
    case 'retry': { const R = UI.result; const s = R.s; const idx = nodesOf(s).findIndex(n => n.key === (R.kind === 'lesson' ? R.l.id : `s${s}c${R.k}`)); startNode(s, idx); break; }
    case 'toMap': UI.tab = 'learn'; UI.season = UI.result?.s || UI.season; go('child'); break;
    case 'missionDone': { const p = prog(f, UI.cid); p.missions[d.id] = { status: 'pending', ts: Date.now() }; save(); beep('ok'); toast('Đã gửi! Chờ ba mẹ xác nhận nhé 🐝'); break; }
    case 'toggleSpeak': break;
    case 'switchUser': UI.cid = null; go('profiles'); break;
    case 'toParent': UI.cid = null; go(parentOK() ? 'parent' : 'parentLock'); break;
    case 'letChild': UI.parentAt = 0; go('profiles'); break;
    case 'ptab': UI.ptab = d.t; UI.err = ''; render(); window.scrollTo(0, 0); break;
    case 'approve': case 'reject': {
      const p = prog(f, d.cid), m = p.missions[d.id]; if (!m) break;
      if (a === 'approve') { m.status = 'approved'; const r = award(f, d.cid, 2, `Nhiệm vụ ${LESSON[d.id].code}: ${LESSON[d.id].vi}`); toast(r.counted ? `Đã tặng ${r.counted} sao cho ${childOf(f, d.cid).name}!` : 'Đã xác nhận. Con đã đạt giới hạn sao tuần này.'); }
      else { m.status = 'rejected'; toast('Đã nhắn con làm lại nhiệm vụ.'); }
      save(); break;
    }
    case 'bonusSet': UI.bonus = { ...(UI.bonus || { cid: f.children[0]?.id, n: 2 }), [d.k]: d.k === 'n' ? +d.val : d.val }; render(); break;
    case 'payAsk': UI.confirm = 'pay:' + d.cid; render(); break;
    case 'cancelConfirm': UI.confirm = null; render(); break;
    case 'pay': { const p = prog(f, d.cid); const up = unpaid(f, d.cid); p.ledger.forEach(x => x.paid = true); f.payouts ||= []; f.payouts.push({ ts: Date.now(), cid: d.cid, amount: up * STAR, stars: up }); UI.confirm = null; save(); toast(`Đã ghi sổ trao ${vnd(up * STAR)}.`); break; }
    case 'editChild': UI.confirm = null; UI.sheet = () => childSheet(d.cid); render(); break;
    case 'askDelChild': UI.confirm = 'delChild'; render(); break;
    case 'cancelSheetConfirm': UI.confirm = null; render(); break;
    case 'delChild': { f.children = f.children.filter(c => c.id !== d.cid); delete f.progress[d.cid]; UI.sheet = null; UI.confirm = null; save(); toast('Đã xóa hồ sơ.'); break; }
    case 'askDelFam': UI.confirm = 'delFam'; render(); break;
    case 'delFam': { delete STORE.families[f.id]; STORE.dev.familyId = null; UI.parentAt = 0; save(); go('welcome'); toast('Đã xóa tài khoản gia đình trên máy này.'); break; }
    case 'logout': UI.parentAt = 0; UI.cid = null; go('welcome'); break;
    case 'backup': {
      const blob = new Blob([JSON.stringify({ app: 'hoc-toan-vui', v: 1, at: new Date().toISOString(), family: f }, null, 1)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const lnk = document.createElement('a'); lnk.href = url; lnk.download = `hoc-toan-vui-${(f.user || 'gia-dinh').replace(/[^a-z0-9]/gi, '')}-${dayKey()}.json`; document.body.appendChild(lnk); lnk.click(); lnk.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast('Đã tải file sao lưu.'); break;
    }
    case 'donateTier': {
      donateTier = d.k; const tr = tierOf(d.k);
      // chỉ đổi ảnh, không vẽ lại trang để giữ nguyên dữ liệu ba mẹ đang nhập
      const sec = t.closest('section');
      sec.querySelectorAll('[data-act=donateTier]').forEach(b => { const on = b.dataset.k === d.k; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
      sec.querySelector('#donate-qr').src = tr.qr; sec.querySelector('#donate-amt').innerHTML = donateAmtText(tr);
      break;
    }
    case 'saveQr': {
      const tr = tierOf(donateTier), ext = tr.qr.split('.').pop(), name = `ung-ho-hoc-toan-vui-${tr.k}.${ext}`;
      try {
        const blob = await (await fetch(tr.qr)).blob(); const file = new File([blob], name, { type: blob.type });
        // điện thoại: mở bảng chia sẻ để "Lưu hình ảnh"; máy tính: tải file xuống
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Mã QR ủng hộ Học Toán Vui' }); break; }
        const url = URL.createObjectURL(blob); const a2 = document.createElement('a'); a2.href = url; a2.download = name; document.body.appendChild(a2); a2.click(); a2.remove(); setTimeout(() => URL.revokeObjectURL(url), 3000);
        toast('Đã tải mã QR. Mở app ngân hàng để quét từ ảnh nhé!');
      } catch (er) { if (er && er.name === 'AbortError') break; const a2 = document.createElement('a'); a2.href = tr.qr; a2.download = name; a2.target = '_blank'; document.body.appendChild(a2); a2.click(); a2.remove(); }
      break;
    }
    case 'copyAcct': try { await navigator.clipboard.writeText(DONATE.acct); toast('Đã chép số tài khoản.'); } catch (er) { toast('Số tài khoản: ' + DONATE.acct); } break;
    case 'share': { const data = { title: 'Học Toán Vui', text: 'App học toán tư duy miễn phí cho bé: 120 bài, nhiệm vụ ở nhà, sao thưởng', url: location.href.split('#')[0] }; try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast('Đã chép đường dẫn để chia sẻ.'); } } catch (er) { } break; }
  }
});
document.addEventListener('change', async e => {
  touch();
  const t = e.target;
  if (t.dataset.act === 'toggleSpeak') { const f = fam(); prog(f, UI.cid).speak = t.checked; save(); return; }
  if (t.dataset.act === 'restore' && t.files[0]) {
    try {
      const data = JSON.parse(await t.files[0].text()); const F = data.family;
      if (data.app !== 'hoc-toan-vui' || !F || !F.id || !Array.isArray(F.children)) throw new Error('bad');
      STORE.families[F.id] = F; STORE.dev.familyId = F.id; save(); UI.parentAt = 0; toast('Đã khôi phục dữ liệu gia đình ' + F.parentName + '!'); go('profiles');
    } catch (er) { toast('File sao lưu không hợp lệ.'); }
  }
});
document.addEventListener('submit', async e => {
  e.preventDefault(); touch();
  const form = e.target, k = form.dataset.form, fd = Object.fromEntries(new FormData(form));
  const f = fam();
  if (k === 'login') {
    if (Date.now() < UI.lockUntil) return;
    const F = findFamily(fd.u);
    if (F && await hashPw(fd.p) === F.pw) { STORE.dev.familyId = F.id; save(); UI.parentAt = Date.now(); UI.fails = 0; UI.ptab = 'home'; go('parent'); }
    else { failed('Tên đăng nhập hoặc mật khẩu chưa đúng.'); }
  } else if (k === 'forgot') {
    if (Date.now() < UI.lockUntil) return;
    const F = findFamily(fd.u);
    if (F && await hashPw('pin:' + fd.pin) === F.ppin) { F.pw = await hashPw(fd.p); STORE.dev.familyId = F.id; save(); UI.fails = 0; toast('Đã đặt mật khẩu mới!'); go('parentLogin'); }
    else failed('Tên đăng nhập hoặc mã PIN ba mẹ chưa đúng.');
  } else if (k === 'register') {
    const u = fd.u.trim().toLowerCase();
    if (findFamily(u)) { UI.err = 'Tên đăng nhập này đã có trên máy. Ba mẹ đăng nhập nhé.'; return render(); }
    if (!/^\d{4}$/.test(fd.ppin) || !/^\d{4}$/.test(fd.cpin)) { UI.err = 'Mã PIN gồm đúng 4 chữ số.'; return render(); }
    const id = uid();
    STORE.families[id] = { id, parentName: fd.pn.trim(), user: u, pw: await hashPw(fd.p), ppin: await hashPw('pin:' + fd.ppin), weeklyCap: 50, unlockAll: false, payouts: [], created: Date.now(), progress: {},
      children: [{ id: uid(), name: fd.cn.trim(), avatar: fd.ca || '🦊', pin: await hashPw('pin:' + fd.cpin) }] };
    STORE.dev.familyId = id; save(); UI.parentAt = Date.now(); UI.ptab = 'home'; toast('Tạo tài khoản thành công! 🎉'); go('parent');
  } else if (k === 'unlock') {
    if (Date.now() < UI.lockUntil) return;
    const h1 = await hashPw(fd.p), h2 = await hashPw('pin:' + fd.p);
    if (f && (h1 === f.pw || h2 === f.ppin)) { UI.parentAt = Date.now(); UI.fails = 0; go('parent'); } else failed('Chưa đúng mật khẩu hoặc mã PIN ba mẹ.');
  } else if (k === 'bonus') {
    const opt = UI.bonus || { cid: f.children[0]?.id, n: 2 };
    const c = childOf(f, opt.cid); if (!c) return;
    const r = award(f, c.id, opt.n, 'Ba mẹ thưởng: ' + fd.reason.trim()); save(); form.reset();
    toast(r.counted ? `Đã tặng ${r.counted} sao cho ${c.name}!` : `${c.name} đã đạt giới hạn sao tuần này.`);
  } else if (k === 'settings') {
    f.weeklyCap = Math.min(MAX_CAP, Math.max(5, +fd.cap || MAX_CAP)); f.unlockAll = !!fd.unlock; save(); toast('Đã lưu cài đặt.');
  } else if (k === 'changePw') {
    if (await hashPw(fd.old) !== f.pw) { UI.err = 'Mật khẩu hiện tại chưa đúng.'; return render(); }
    if (fd.p && fd.p.length < 6) { UI.err = 'Mật khẩu mới cần ít nhất 6 ký tự.'; return render(); }
    if (fd.ppin && !/^\d{4}$/.test(fd.ppin)) { UI.err = 'Mã PIN gồm đúng 4 chữ số.'; return render(); }
    if (fd.p) f.pw = await hashPw(fd.p); if (fd.ppin) f.ppin = await hashPw('pin:' + fd.ppin);
    UI.err = ''; save(); form.reset(); toast('Đã cập nhật bảo mật.');
  } else if (k === 'child') {
    const cid = form.dataset.cid; if (fd.pin && !/^\d{4}$/.test(fd.pin)) return toast('Mã PIN gồm đúng 4 chữ số.');
    if (cid) { const c = childOf(f, cid); c.name = fd.n.trim(); c.avatar = fd.a || c.avatar; if (fd.pin) c.pin = await hashPw('pin:' + fd.pin); }
    else f.children.push({ id: uid(), name: fd.n.trim(), avatar: fd.a || '🦊', pin: await hashPw('pin:' + fd.pin) });
    UI.sheet = null; save(); toast('Đã lưu hồ sơ.');
  }
});
function failed(msg) { UI.fails = (UI.fails || 0) + 1; if (UI.fails >= 5) { UI.lockUntil = Date.now() + 60000; UI.fails = 0; UI.err = 'Nhập sai 5 lần. Vui lòng thử lại sau 1 phút.'; setTimeout(render, 60500); } else UI.err = msg; render(); }
document.addEventListener('keydown', e => {
  touch();
  if (e.key === 'Escape' && document.getElementById('terms-modal')) { document.getElementById('terms-modal').remove(); return; }
  if (e.key === 'Escape' && UI.sheet) { UI.sheet = null; render(); }
  if (UI.view === 'pin' && /^[0-9]$/.test(e.key)) { const b = document.querySelector(`[data-act="key"][data-k="${e.key}"]`); b && b.click(); }
  if (UI.view === 'pin' && e.key === 'Backspace') { const b = document.querySelector('[data-act="key"][data-k="⌫"]'); b && b.click(); }
});
setInterval(() => { if (UI.view === 'parent' && !parentOK()) { UI.parentAt = 0; render(); } }, 30000);
window.addEventListener('popstate', () => { if (UI.sheet) { UI.sheet = null; render(); } });

/* ---------------- khởi động ---------------- */
load(); pickVoice(); try { speechSynthesis.onvoiceschanged = pickVoice; } catch (e) { }
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  // luôn kiểm tra bản mới; khi có bản mới thì tải lại trang một lần
  const hadCtl = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => { });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtl && !window.__reloaded) { window.__reloaded = true; location.reload(); } });
}
