# Beat Publisher — publicación automática de beats

Segunda pieza del flujo grande (la primera es `fl-export-automation`). Desde los 3 archivos
exportados (MP3, WAV, RAR de stems), genera el vídeo del beat y lo publica programado en
YouTube y Beatstars, linkeando ambos. Premiere queda fuera del flujo.

## Flujo completo
1. Exportas el beat con el script de FL (`fl-export-automation`) → MP3 + WAV + RAR.
2. Le dices a Claude "sube el beat X" → se activa la skill `subir-beat`.
3. Se genera el vídeo (cover 17. + audio) con `generar_video.py`.
4. Claude sube a YouTube (programado) y a Beatstars por navegador, pidiéndote OK antes
   de publicar en cada plataforma, y linkea los dos.

## Estado
- [x] Generador de vídeo escrito y probado (audio de prueba → MP4 1080p correcto)
- [x] Parser del nombre de archivo probado (con y sin colaborador)
- [x] Plantillas de título/descripción con el texto real de Chavo (`plantillas.md`)
- [x] Catálogo de géneros/artistas/canales con datos reales (`catalogo.md`)
- [x] Config con perfiles y 2 canales reales (`config.json`)
- [x] Skill `subir-beat` creada (`.claude/skills/subir-beat/SKILL.md`)
- [x] Cover = una foto por beat, detectada por nombre; misma foto para vídeo y Beatstars. Vídeo siempre 1920x1080, foto ajustada dentro (bandas negras si sobra espacio, sin desenfoque)
- [x] SEO con VidIQ integrado en el flujo (configurado en `config.json` y en la skill)
- [ ] **Chavo:** al exportar, dejar la foto del beat en su carpeta con el nombre del beat (p. ej. `Perdida.jpg`)
- [ ] Investigación de SEO de tags con VidIQ (primera pasada en la 1ª subida real)
- [ ] Primera subida real supervisada (YouTube + Beatstars por navegador)
- [ ] Probar `fl-export-automation` con un beat real (sigue pendiente de su lado)

## Carpetas y cómo se encuentra cada beat
- **Fotos (las echa Chavo):** `F:\IMAGENES\17\Videobeats` (+ subcarpetas), foto con el nombre del beat.
- **Audio (lo pone FL solo):** `F:\MUSICA\BEATS\4 SALE\MP3\<género>` (+ `\WAV`, `\STEMS`).
- **Vídeos generados (salen solos):** `F:\VIDEOS\Videobeats`.
- **Identificación:** por nombre. Chavo dice "sube el beat X", se busca X (audio + foto) de forma
  recursiva; si hay dudas se pregunta antes de tocar nada. (No "el más reciente" — es frágil.)

## Datos clave (ya configurados)
- **Canales YouTube:** RnB/Trap → @Prod-by17beats · Reggaeton/Afro/Funk → @17beats-afro
- **Título:** `[FREE] Artista x Artista Type Beat - 'Nombre' | Género Type Beat`
- **Link de compra:** SIEMPRE el de la **pro page** de Beatstars (sin comisión), no el normal
- **Perfil:** https://17beats.beatstars.com/ · IG @17godbeats · TikTok @17godbeats

## Archivos
- `generar_video.py` — genera el MP4 (cover + audio) y parsea los metadatos del nombre
- `config.json` — rutas, precios, redes y valores por defecto
- `plantillas.md` — título/descripción de YouTube y datos de Beatstars
- `assets/cover-17.png` — imagen del vídeo (PLACEHOLDER, sustituir por el cover real)
- `videos/` — MP4 generados
- `registro.md` — histórico de beats publicados

## App local de subida (subir_app/) — Playwright
Segunda vía de subida, **sin límite de tamaño** (navegador real, no la herramienta de Chrome).
Resuelve el veto de dominio de Beatstars y el tope de 10 MB.
- `login.py` — login una vez (perfil persistente en `subir_app/perfil/`, gitignored). Chavo ejecuta.
- `subir_beatstars.py` — **FUNCIONA**: crea track y sube Master + metadatos (title/key/bpm/tags,
  máx 3 tags) + artwork + stems (zip 309 MB), todo automático. Falta: release date, campo de
  vídeo y Publish (con OK). Probado con 'lighter'.
- `subir_youtube.py` — pendiente de construir.
- `generar_video.py` sigue igual (genera el MP4).
Estado real primera prueba: borrador de 'lighter' en Beatstars (TK25837925) con Master+Stems+
Artwork+metadatos puestos, sin publicar.

## Pendientes / próxima sesión (2026-07-12)
1. **YouTube en la app con Playwright** — PROBADO el core (subida sin límite, título,
   descripción, no-niños, navegación hasta Visibilidad, abrir Programar). `subir_youtube.py`.
   Falta validar EN VIVO con un beat real: etiquetas, fecha exacta (calendario), hora 20:00 y
   el botón Programar final. Ojo: headless lo bloquea → correr en modo visible.
   NOTA: hay borradores de prueba en el canal ('test yt', 'PRUEBA BORRAR ...') que Chavo debe borrar.
2. **Beatstars:** aplicar las reglas nuevas al script — WAV como master (no MP3),
   título `Artista1 x Artista2 Type Beat - <nombre>`, descripción con Key+BPM+@17godbeats,
   publicar público al momento (sin release date).
3. Cadencia de publicación: **día sí / día no a las 20:00** (España).

## Decisiones de diseño
- **Subida por navegador, no API.** Beatstars no tiene API pública de subida. YouTube sí,
  pero su API bloquea como privados los vídeos de apps sin verificar, así que navegador
  para ambos: un solo mecanismo y sin burocracia de Google Cloud.
- **Flujo asistido, no 100% automático.** Chavo lo lanza y confirma antes de cada
  publicación. Si Beatstars cambia su web, se detecta al momento en vez de publicar mal.
- **YouTube primero, Beatstars después.** El linkeo del vídeo en Beatstars necesita la URL
  de YouTube. El link de compra se añade a la descripción de YouTube al final del flujo.
