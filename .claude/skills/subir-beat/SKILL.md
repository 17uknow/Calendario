---
name: subir-beat
description: Flujo completo de publicación de un beat — genera el vídeo (cover + audio), lo sube a YouTube programado, sube el beat a Beatstars y linkea ambos. Usar cuando Chavo diga "sube el beat X", "publica este beat" o similar.
---

# Subir beat (YouTube + Beatstars)

Flujo asistido: el sistema lo hace todo, pero **siempre se pide OK a Chavo antes de
publicar/programar en cada plataforma**. Nunca publiques nada sin confirmación explícita.

## Orden recomendado (aprendido 2026-07-10)
**Beatstars PRIMERO**, luego YouTube. Así ya tienes el link de la pro page listo para
meterlo en la descripción de YouTube de una, sin tener que volver a editar. (El primer beat,
lighter, se hizo al revés y quedó pendiente añadir el link a mano.)

## Aprendizajes de la 1ª subida real (lighter)
- YouTube ya tiene **upload defaults** con la plantilla de descripción de Chavo. Solo hay que
  cambiar `Key | bpm` por los valores reales, meter el link de Beatstars y los hashtags/tags.
- **Categoría: Música** (Chavo la quiere en Música, no "Gente y blogs").
- **Etiquetas:** llénalas bien (apunta a ~450-500 de 500 chars). Usa VidIQ para puntuar.
- **Copiar las etiquetas tal cual en la descripción** (bajo la sección -----TAGS-----): a Chavo
  le funciona para SEO.
- **Zona horaria:** hora local = GMT+2 en verano = correcto para España (20:00).
- El archivo (MP4/audio) lo suelta Chavo a mano (selector nativo); Claude rellena el resto.

## Requisitos previos
- Los 3 archivos del beat exportados (MP3, WAV, RAR de stems) siguiendo el patrón:
  `'Nombre' Tags Key BPMbpm (@17godbeats[ + @colab])`
- Chrome con sesión iniciada en YouTube Studio y Beatstars, y la extensión de Claude conectada.
- `projects/beat-publisher/config.json` sin campos PENDIENTE (perfil Beatstars, IG, TikTok, email).
- Cover real en `projects/beat-publisher/assets/cover-17.png` (el actual es un placeholder).

## Pasos

### 1. Localizar archivos y generar vídeo
- **Identificación por nombre.** Chavo te dice el nombre del beat. Búscalo por ese nombre:
  - **MP3/WAV/RAR:** en `F:\MUSICA\BEATS\4 SALE` (subcarpetas `MP3\<género>`, `WAV\<género>`,
    `STEMS\<género>`). Búsqueda recursiva.
  - **Foto:** en `F:\IMAGENES\17\Videobeats` (y subcarpetas), nombrada con el nombre del beat.
    Es la MISMA foto que se sube como artwork a Beatstars (paso 4).
  - Si hay varios candidatos o no encuentras algo, **pregunta a Chavo antes de seguir**.
- Ejecuta: `python "projects/beat-publisher/generar_video.py" "<ruta al MP3>"`
  - Detecta la foto sola (busca en `F:\IMAGENES\17\Videobeats` recursivo) y genera el MP4
    (1920x1080, foto ajustada con bandas negras si sobra) en `F:\VIDEOS\Videobeats`.
    Imprime qué foto detectó y los metadatos.
  - Si no encuentra la foto, pídesela a Chavo y pásala con `--cover "<ruta>"`.
  - Si el nombre no sigue el patrón, el script lo dice — corrige el nombre, no el script.
- **Guarda la ruta de la foto**: hace falta para subirla como artwork a Beatstars en el paso 4.

### 2. Elegir canal, estilo y preparar textos
- **Canal:** según el género, elige el canal de YouTube correcto (`config.json` → canales_youtube):
  RnB/Bouncy/Trap → canal RNB/TRAP; reggaeton/afro/funk → canal REGGAETON/AFRO/FUNK.
- **Sub-género y artistas:** sugiere la variante de título (RnB Bouncy / RnB 2000s / RnB Guitar…)
  y 1-2 artistas de referencia desde `catalogo.md`. Chavo confirma.
- Construye título y descripción con `plantillas.md` + `catalogo.md` + `config.json`.
- Investiga SEO de los tags con **VidIQ** (extensión instalada): mira search volume y
  competition de los tags candidatos en YouTube, prioriza los de buen volumen y poca
  competencia, y apunta lo aprendido en la sección SEO de `catalogo.md`. Propón los tags/hashtags finales.
- Propón fecha/hora de publicación (por defecto: próximo viernes 18:00, ver config).
- **Enséñaselo todo a Chavo y espera su OK antes de seguir.**

### 3. Subir a YouTube (navegador)
- Ve a `https://studio.youtube.com` → Crear → Subir vídeo.
- Sube el MP4, rellena título y descripción (el link de Beatstars aún no existe — se añade en el paso 5).
- Marca "No, no es contenido para niños".
- Visibilidad → Programar → fecha/hora acordada. **Confirma con Chavo antes de darle a Programar.**
- Copia la URL del vídeo (ya existe aunque esté programado).

### 4. Subir a Beatstars (con la APP, no navegador asistido)
Usar la app local `subir_app/subir_beatstars.py` (Playwright, sin límite de tamaño).
Reglas fijadas por Chavo (2026-07-10):
- **Archivo maestro: SIEMPRE el .WAV** (no el .mp3). Sin WAV no se venden licencias WAV ni stems.
  Master = WAV, + Stems = zip. Sin preview tagged.
- **Título:** `Artista1 x Artista2 Type Beat - <nombre>` (con artistas, sin `[FREE]`/género).
- **Descripción:** siempre Key, BPM y @17godbeats.
- **Tags:** máx 3 (límite Beatstars).
- **Artwork:** la MISMA foto del beat que se usó en el vídeo (paso 1).
- **Publicar público al momento** (no programar release date).
- El flujo nuevo NO tiene campo de vídeo → el cruce se hace por la descripción de YouTube.
- Al publicar, copia el **Pro Page link** (bsta.rs/..., sin comisión) del modal de "Share".

### 5. Cerrar el círculo
- Vuelve a YouTube Studio → edita el vídeo → añade el link del track de Beatstars
  a la descripción (línea "Compra este beat").
- Verifica que en Beatstars el vídeo quedó linkeado.

### 6. Registrar
- Añade una línea a `projects/beat-publisher/registro.md`:
  `| YYYY-MM-DD | Nombre | fecha publicación | URL YouTube | URL Beatstars |`

## Si algo cambia en las webs
Beatstars y YouTube cambian su interfaz de vez en cuando. Si un paso ya no coincide con la
realidad, adapta sobre la marcha y **actualiza este SKILL.md** con lo que hayas visto, para
que la próxima vez el flujo esté al día.
