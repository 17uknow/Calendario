const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ytdlp = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');

const app = express();
const PORT = 4317;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function extractCleanUrl(raw) {
  if (typeof raw !== 'string') return null;
  let parsed;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, '');
  let videoId = null;
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    videoId = parsed.searchParams.get('v');
  } else if (host === 'youtu.be') {
    videoId = parsed.pathname.slice(1);
  }
  if (!videoId || !/^[\w-]{6,15}$/.test(videoId)) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// Obtiene info del video (titulo, thumbnail) sin descargar
app.post('/api/info', async (req, res) => {
  const url = extractCleanUrl(req.body.url);
  if (!url) {
    return res.status(400).json({ error: 'URL de YouTube no valida' });
  }
  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
    });
    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      id: info.id,
    });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo leer el video', detail: String(err) });
  }
});

// Descarga y convierte a mp3
app.post('/api/convert', async (req, res) => {
  const url = extractCleanUrl(req.body.url);
  if (!url) {
    return res.status(400).json({ error: 'URL de YouTube no valida' });
  }

  const fileId = crypto.randomBytes(8).toString('hex');
  const outputTemplate = path.join(DOWNLOADS_DIR, `${fileId}.%(ext)s`);

  try {
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: 0,
      output: outputTemplate,
      ffmpegLocation: ffmpegPath,
      noWarnings: true,
      noCheckCertificates: true,
    });

    const mp3Path = path.join(DOWNLOADS_DIR, `${fileId}.mp3`);
    if (!fs.existsSync(mp3Path)) {
      return res.status(500).json({ error: 'La conversion no genero el archivo esperado' });
    }

    res.json({ fileId });
  } catch (err) {
    res.status(500).json({ error: 'Fallo la conversion', detail: String(err) });
  }
});

// Descarga el archivo final y lo borra del servidor
app.get('/api/download/:fileId', (req, res) => {
  const fileId = req.params.fileId.replace(/[^a-f0-9]/g, '');
  const mp3Path = path.join(DOWNLOADS_DIR, `${fileId}.mp3`);
  if (!fs.existsSync(mp3Path)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }
  res.download(mp3Path, 'audio.mp3', (err) => {
    if (!err) fs.unlink(mp3Path, () => {});
  });
});

app.listen(PORT, () => {
  console.log(`Wii Tube MP3 corriendo en http://localhost:${PORT}`);
});
