/* =============== Basit Yerel Auth (localStorage) =============== */
const STORAGE_KEY = 'demo_users_v1';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/* SHA-256 hash (salt + password) */
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}
function makeSalt(len=16) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return [...bytes].map(b => b.toString(16).padStart(2,'0')).join('');
}

/* =============== UI Referansları =============== */
const loginForm   = document.getElementById('loginForm');
const loginMsg    = document.getElementById('loginMsg');
const regForm     = document.getElementById('registerForm');
const regMsg      = document.getElementById('registerMsg');
const openReg1    = document.getElementById('openRegister');
const openReg2    = document.getElementById('openRegister2');
const backToLogin = document.getElementById('backToLogin');
const loginCard   = document.getElementById('loginCard');
const registerCard= document.getElementById('registerCard');
const toastEl     = document.getElementById('toast');

/* =============== Helper: Toast & Msg =============== */
function toast(text, type='ok', timeout=1800){
  const t = document.createElement('div');
  t.className = `t ${type}`;
  t.textContent = text;
  toastEl.appendChild(t);
  setTimeout(()=> t.remove(), timeout);
}
function setMsg(el, text, type){
  el.textContent = text || '';
  el.className = `form-msg ${type||''}`;
}

/* =============== Login / Register Kartları Arası Geçiş =============== */
function showRegister(){
  loginCard.classList.add('hidden');
  registerCard.classList.remove('hidden');
  registerCard.classList.add('slide-in');
}
function showLogin(){
  registerCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
  loginCard.classList.add('slide-in');
}
openReg1.addEventListener('click', showRegister);
openReg2.addEventListener('click', showRegister);
backToLogin.addEventListener('click', showLogin);

/* =============== Kayıt Ol =============== */
regForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const username = (document.getElementById('reg-username').value || '').trim();
  const pass1 = document.getElementById('reg-password').value;
  const pass2 = document.getElementById('reg-password2').value;

  if (username.length < 3)  return setMsg(regMsg, 'Kullanıcı adı en az 3 karakter olmalı', 'err');
  if (pass1.length < 6)     return setMsg(regMsg, 'Şifre en az 6 karakter olmalı', 'err');
  if (pass1 !== pass2)      return setMsg(regMsg, 'Şifreler uyuşmuyor', 'err');

  const users = loadUsers();
  if (users[username]) return setMsg(regMsg, 'Bu kullanıcı adı zaten kayıtlı', 'err');

  const salt = makeSalt();
  const hash = await hashPassword(pass1, salt);
  users[username] = { salt, hash, createdAt: Date.now() };
  saveUsers(users);

  setMsg(regMsg, 'Hesap oluşturuldu! Giriş sayfasına yönlendiriliyor…', 'ok');
  toast('Hesap oluşturuldu', 'ok');
  setTimeout(()=> {
    showLogin();
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').focus();
  }, 700);
});

/* =============== Giriş Yap =============== */
loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const username = (document.getElementById('login-username').value || '').trim();
  const password = document.getElementById('login-password').value;

  const users = loadUsers();
  const rec = users[username];
  if (!rec) { setMsg(loginMsg, 'Başarısız: kullanıcı bulunamadı', 'err'); toast('Başarısız giriş', 'err'); return; }

  const inputHash = await hashPassword(password, rec.salt);
  if (inputHash === rec.hash) {
    setMsg(loginMsg, 'Başarılı: hoş geldin!', 'ok');
    toast('Giriş başarılı', 'ok');
    // Başarılı giriş sonrası yönlendirme gerekiyorsa:
    // location.href = '/dashboard.html';
  } else {
    setMsg(loginMsg, 'Başarısız: şifre hatalı', 'err');
    toast('Başarısız giriş', 'err');
  }
});

/* =============== Şifremi Unuttum (demo) =============== */
document.getElementById('forgot').addEventListener('click', (e)=>{
  e.preventDefault();
  toast('Bu demo yerel çalışır. Şifre sıfırlama için kayıt silin.', 'ok');
});

/* =============== Mouse Spotlight & Ripple =============== */
(function spotlight(){
  const root = document.documentElement;
  let rafId = null;
  function onMove(ev){
    const x = ev.clientX || (ev.touches && ev.touches[0].clientX);
    const y = ev.clientY || (ev.touches && ev.touches[0].clientY);
    if (x==null) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(()=>{
      root.style.setProperty('--mx', x + 'px');
      root.style.setProperty('--my', y + 'px');
    });
  }
  window.addEventListener('pointermove', onMove, {passive:true});
})();

(function buttonRipple(){
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.btn-primary');
    if(!btn) return;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.left = (e.clientX - rect.left) + 'px';
    span.style.top  = (e.clientY - rect.top)  + 'px';
    btn.appendChild(span);
    span.addEventListener('animationend', ()=> span.remove());
  });
})();

/* =============== Küçük kalite-of-life =============== */
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') showLogin();
});
