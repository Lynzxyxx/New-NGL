/* ============================================================
   SoraPay - Anonymous Sender
   Catatan: Tidak ada mekanisme kirim otomatis berulang/quota/
   delay anti-block. Setiap klik tombol = 1 permintaan kirim,
   dikendalikan manual oleh pengguna.
   ============================================================ */

const STORAGE_KEYS = {
  theme: 'sorapay_theme',
  bg: 'sorapay_bg_color'
};

/* ---------- Tema (Dark/Light) ---------- */
const themeToggleBtn = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(theme) {
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '☀️';
  } else {
    root.removeAttribute('data-theme');
    themeToggleBtn.textContent = '🌙';
  }
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  applyTheme(saved);
}

themeToggleBtn.addEventListener('click', () => {
  const current = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEYS.theme, next);
  applyTheme(next);
});

/* ---------- Background Custom ---------- */
const colorPicker = document.getElementById('colorPicker');
const resetBgBtn = document.getElementById('resetBgBtn');
const presetSwatches = document.querySelectorAll('.preset-swatch');
const DEFAULT_BG = '#0f172a';

function setBackground(color, save = true) {
  document.body.style.setProperty('--bg-color', color);
  document.body.style.backgroundColor = color;
  colorPicker.value = color;
  presetSwatches.forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color.toLowerCase() === color.toLowerCase());
  });
  if (save) localStorage.setItem(STORAGE_KEYS.bg, color);
}

function initBackground() {
  const saved = localStorage.getItem(STORAGE_KEYS.bg) || DEFAULT_BG;
  setBackground(saved, false);
}

presetSwatches.forEach(sw => {
  sw.addEventListener('click', () => setBackground(sw.dataset.color));
});

colorPicker.addEventListener('input', (e) => setBackground(e.target.value));

resetBgBtn.addEventListener('click', () => setBackground(DEFAULT_BG));

/* ---------- Logo -> scroll ke atas ---------- */
document.getElementById('logoHome').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Validasi Target NGL ---------- */
const targetInput = document.getElementById('targetInput');
const targetError = document.getElementById('targetError');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const sendBtnText = document.getElementById('sendBtnText');
const statusBox = document.getElementById('statusBox');

// Format wajib: "Target: https://ngl.link/username"
const TARGET_PATTERN = /^Target:\s*https:\/\/ngl\.link\/([A-Za-z0-9_.-]+)\s*$/i;

function extractUsername(value) {
  const match = value.trim().match(TARGET_PATTERN);
  return match ? match[1] : null;
}

function validateTarget() {
  const value = targetInput.value.trim();
  if (!value) {
    targetError.classList.add('hidden');
    return false;
  }
  const username = extractUsername(value);
  if (!username) {
    targetError.textContent = 'Format salah. Contoh: Target: https://ngl.link/username';
    targetError.classList.remove('hidden');
    return false;
  }
  targetError.classList.add('hidden');
  return true;
}

targetInput.addEventListener('input', validateTarget);

/* ---------- Status helper ---------- */
function showStatus(type, message) {
  statusBox.className = `status-box ${type}`;
  statusBox.textContent = message;
  statusBox.classList.remove('hidden');
}

/* ---------- Kirim 1 pesan ke NGL ----------
   Catatan penting: NGL tidak menyediakan API publik lintas-domain
   (CORS) untuk website pihak ketiga. Browser akan memblokir
   permintaan cross-origin ke ngl.link kecuali NGL mengizinkannya.
   Fungsi ini tetap mencoba pengiriman langsung dan menangani
   semua kemungkinan error (format salah, network error, CORS,
   atau target diblokir) dengan pesan yang jelas ke pengguna.
------------------------------------------------------------- */
async function sendSingleMessage(username, message) {
  const endpoint = 'https://ngl.link/api/submit';
  const deviceId = getOrCreateDeviceId();

  const body = new URLSearchParams({
    username: username,
    question: message,
    deviceId: deviceId,
    gameSlug: '',
    referrer: ''
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('BLOCKED');
    }
    throw new Error('HTTP_' + response.status);
  }

  return response.json().catch(() => ({}));
}

function getOrCreateDeviceId() {
  let id = localStorage.getItem('sorapay_device_id');
  if (!id) {
    id = 'sp-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('sorapay_device_id', id);
  }
  return id;
}

/* ---------- Handler tombol kirim ---------- */
sendBtn.addEventListener('click', async () => {
  const isValidTarget = validateTarget();
  const username = extractUsername(targetInput.value);
  const message = messageInput.value.trim();

  if (!targetInput.value.trim()) {
    targetError.textContent = 'Isi target terlebih dahulu. Contoh: Target: https://ngl.link/username';
    targetError.classList.remove('hidden');
    return;
  }
  if (!isValidTarget || !username) {
    return;
  }
  if (!message) {
    showStatus('error', 'Pesan tidak boleh kosong.');
    return;
  }

  sendBtn.disabled = true;
  sendBtnText.textContent = 'Mengirim...';
  showStatus('info', 'Mengirim pesan ke ' + username + ' ...');

  try {
    await sendSingleMessage(username, message);
    showStatus('success', 'Pesan berhasil dikirim secara anonim ke ' + username + '.');
    messageInput.value = '';
  } catch (err) {
    if (err.message === 'BLOCKED') {
      showStatus('error', 'Gagal: target ini sedang membatasi/memblokir pesan masuk (rate limit NGL).');
    } else if (err.message && err.message.startsWith('HTTP_')) {
      showStatus('error', 'Gagal mengirim. Server merespons error (' + err.message.replace('HTTP_', '') + ').');
    } else {
      showStatus(
        'error',
        'Gagal mengirim: kemungkinan koneksi terputus, atau NGL memblokir permintaan lintas-domain (CORS) dari browser. Coba lagi nanti atau kirim langsung lewat situs NGL resmi.'
      );
    }
  } finally {
    sendBtn.disabled = false;
    sendBtnText.textContent = 'Kirim Pesan';
  }
});

/* ---------- Init ---------- */
initTheme();
initBackground();
validateTarget();
