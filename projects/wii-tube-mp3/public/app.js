// --- Reloj y fecha estilo Wii System Menu ---
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
function tickClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dia = DIAS[now.getDay()];
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  document.getElementById('date').textContent = `${dia}. ${dd}/${mm}`;
}
tickClock();
setInterval(tickClock, 1000 * 30);

// --- Puntero tipo mando de Wii ---
const pointer = document.getElementById('wiiPointer');
const pointerImg = document.getElementById('wiiPointerImg');
const POINTER_HOTSPOT = { x: 16, y: 2 };
let pointerX = 0;
let pointerY = 0;
function renderPointer() {
  pointer.style.transform = `translate(${pointerX - POINTER_HOTSPOT.x}px, ${pointerY - POINTER_HOTSPOT.y}px)`;
}
window.addEventListener('mousemove', (e) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
  renderPointer();
});
window.addEventListener('mousedown', () => { pointerImg.src = 'cursor/pointer-click.png'; });
window.addEventListener('mouseup', () => { pointerImg.src = 'cursor/pointer-default.png'; });
window.addEventListener('mouseleave', () => { pointer.style.opacity = '0'; });
window.addEventListener('mouseenter', () => { pointer.style.opacity = '1'; });

// --- Sonidos sintetizados (sin archivos) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration, type = 'sine', volume = 0.15) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}
function playHover() { playTone(880, 0.08, 'sine', 0.06); }
function playSelect() { playTone(660, 0.06, 'sine', 0.12); setTimeout(() => playTone(990, 0.1, 'sine', 0.12), 70); }

document.querySelectorAll('.wii-channel, .wii-btn').forEach(el => {
  el.addEventListener('mouseenter', playHover);
});

// --- Logica de la app ---
const urlInput = document.getElementById('urlInput');
const loadBtn = document.getElementById('loadBtn');
const previewChannel = document.getElementById('previewChannel');
const thumb = document.getElementById('thumb');
const videoTitle = document.getElementById('videoTitle');
const convertBtn = document.getElementById('convertBtn');
const statusEl = document.getElementById('status');

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (kind ? ' ' + kind : '');
}

loadBtn.addEventListener('click', async () => {
  playSelect();
  const url = urlInput.value.trim();
  if (!url) {
    setStatus('Pega un link primero', 'error');
    return;
  }
  loadBtn.disabled = true;
  loadBtn.textContent = 'Cargando...';
  try {
    const res = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error desconocido');

    thumb.src = data.thumbnail;
    videoTitle.textContent = data.title;
    previewChannel.hidden = false;
    previewChannel.dataset.url = url;
    setStatus('');
  } catch (err) {
    setStatus('No se pudo cargar: ' + err.message, 'error');
  } finally {
    loadBtn.disabled = false;
    loadBtn.textContent = 'Cargar canal';
  }
});

convertBtn.addEventListener('click', async () => {
  playSelect();
  const url = previewChannel.dataset.url;
  if (!url) return;

  convertBtn.disabled = true;
  convertBtn.textContent = 'Convirtiendo...';
  setStatus('Convirtiendo, esto puede tardar un poco...');

  try {
    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error desconocido');

    setStatus('Listo. Descargando...', 'ok');
    const a = document.createElement('a');
    a.href = `/api/download/${data.fileId}`;
    a.download = 'audio.mp3';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    setStatus('Fallo la conversion: ' + err.message, 'error');
  } finally {
    convertBtn.disabled = false;
    convertBtn.textContent = 'Convertir a MP3';
  }
});
